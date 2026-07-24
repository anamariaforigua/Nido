import { neon } from "@neondatabase/serverless";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { AnswerValue } from "./questions";

export type SurveyResponse = {
  id: string;
  createdAt: string;
  answers: Record<string, AnswerValue>;
  metadata?: {
    userAgent?: string | null;
    ip?: string | null;
  };
};

const localDataFile = path.join(process.cwd(), "data", "survey-responses.json");

function getConnectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL_POOLED ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ""
  );
}

async function ensureTable() {
  const sql = neon(getConnectionString());
  await sql`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      answers JSONB NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `;
}

async function readLocalResponses(): Promise<SurveyResponse[]> {
  try {
    const file = await readFile(localDataFile, "utf8");
    return JSON.parse(file) as SurveyResponse[];
  } catch {
    return [];
  }
}

async function writeLocalResponses(responses: SurveyResponse[]) {
  await mkdir(path.dirname(localDataFile), { recursive: true });
  await writeFile(localDataFile, JSON.stringify(responses, null, 2));
}

export async function saveResponse(response: SurveyResponse) {
  if (getConnectionString()) {
    const sql = neon(getConnectionString());
    await ensureTable();
    await sql`
      INSERT INTO survey_responses (id, created_at, answers, metadata)
      VALUES (${response.id}, ${response.createdAt}, ${JSON.stringify(response.answers)}::jsonb, ${JSON.stringify(
        response.metadata ?? {}
      )}::jsonb)
    `;
    return;
  }

  if (process.env.VERCEL) {
    throw new Error("Falta conectar una base de datos Postgres en Vercel.");
  }

  const responses = await readLocalResponses();
  responses.unshift(response);
  await writeLocalResponses(responses);
}

export async function listResponses(): Promise<SurveyResponse[]> {
  if (getConnectionString()) {
    const sql = neon(getConnectionString());
    await ensureTable();
    const rows = await sql<{
      id: string;
      created_at: string;
      answers: Record<string, AnswerValue>;
      metadata: SurveyResponse["metadata"];
    }[]>`
      SELECT id, created_at, answers, metadata
      FROM survey_responses
      ORDER BY created_at DESC
    `;

    return rows.map((row) => ({
      id: row.id,
      createdAt: new Date(row.created_at).toISOString(),
      answers: row.answers,
      metadata: row.metadata
    }));
  }

  return readLocalResponses();
}
