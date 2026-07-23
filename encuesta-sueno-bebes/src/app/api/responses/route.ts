import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getVisibleQuestions, requiredQuestionIds } from "@/src/lib/questions";
import type { AnswerValue } from "@/src/lib/questions";
import { listResponses, saveResponse } from "@/src/lib/storage";

function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip");
}

function validateAnswers(answers: Record<string, AnswerValue>) {
  for (const id of requiredQuestionIds) {
    const value = answers[id];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return `Falta responder una pregunta obligatoria.`;
    }
  }

  const visibleQuestionIds = new Set(getVisibleQuestions(answers).map((question) => question.id));
  for (const key of Object.keys(answers)) {
    if (!visibleQuestionIds.has(key)) {
      delete answers[key];
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as { answers?: Record<string, AnswerValue> };
    const answers = payload.answers ?? {};
    const error = validateAnswers(answers);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    await saveResponse({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      answers,
      metadata: {
        userAgent: request.headers.get("user-agent"),
        ip: getClientIp(request)
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la respuesta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const password = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!configuredPassword) {
    return NextResponse.json({ error: "Falta configurar ADMIN_PASSWORD." }, { status: 500 });
  }

  if (!password || password !== configuredPassword) {
    return NextResponse.json({ error: "Clave no autorizada." }, { status: 401 });
  }

  try {
    const responses = await listResponses();
    return NextResponse.json({ responses });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron cargar los resultados.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
