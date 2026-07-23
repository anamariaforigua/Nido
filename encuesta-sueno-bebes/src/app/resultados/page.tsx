"use client";

import { BarChart3, Download, Loader2, Lock, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { getQuestionLabel, questions } from "@/src/lib/questions";
import { NidoLogo } from "@/src/components/NidoLogo";
import type { AnswerValue } from "@/src/lib/questions";

type SurveyResponse = {
  id: string;
  createdAt: string;
  answers: Record<string, AnswerValue>;
};

function formatAnswer(value: AnswerValue | undefined) {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value.join("; ") : value;
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function ResultsPage() {
  const [password, setPassword] = useState("");
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadResults() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/responses", {
        headers: {
          Authorization: `Bearer ${password}`
        }
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudieron cargar los resultados.");
      }

      setResponses(payload.responses);
      setLoaded(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los resultados.");
    } finally {
      setLoading(false);
    }
  }

  const summaries = useMemo(() => {
    return questions
      .filter((question) => question.options?.length)
      .map((question) => {
        const counts = new Map<string, number>();

        for (const response of responses) {
          const answer = response.answers[question.id];
          const values = Array.isArray(answer) ? answer : answer ? [answer] : [];
          for (const value of values) {
            counts.set(value, (counts.get(value) ?? 0) + 1);
          }
        }

        return {
          id: question.id,
          title: question.title,
          rows: Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
        };
      });
  }, [responses]);

  function downloadCsv() {
    const headers = ["id", "fecha", ...questions.map((question) => `${question.number}. ${question.title}`)];
    const rows = responses.map((response) => [
      response.id,
      new Date(response.createdAt).toLocaleString("es-CO"),
      ...questions.map((question) => formatAnswer(response.answers[question.id]))
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => escapeCsv(cell)).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resultados-encuesta-sueno-bebes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="results-shell">
      <header className="results-header">
        <div>
          <NidoLogo compact />
          <p className="eyebrow">Panel privado</p>
          <h1>Resultados de la encuesta</h1>
        </div>
        {loaded ? (
          <div className="results-actions">
            <button className="ghost-button compact" type="button" onClick={loadResults} disabled={loading}>
              {loading ? <Loader2 className="spin" size={18} /> : <RefreshCcw size={18} />}
              Actualizar
            </button>
            <button className="primary-button compact" type="button" onClick={downloadCsv} disabled={!responses.length}>
              <Download size={18} />
              CSV
            </button>
          </div>
        ) : null}
      </header>

      {!loaded ? (
        <section className="login-panel">
          <span className="lock-mark">
            <Lock size={22} />
          </span>
          <h2>Ingresa la clave de administración</h2>
          <p>Usa el valor que configures en `ADMIN_PASSWORD` dentro de Vercel.</p>
          <input
            className="password-input"
            type="password"
            value={password}
            placeholder="Clave"
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                loadResults();
              }
            }}
          />
          {error ? <p className="error-message">{error}</p> : null}
          <button className="primary-button" type="button" onClick={loadResults} disabled={!password || loading}>
            {loading ? <Loader2 className="spin" size={20} /> : <Lock size={18} />}
            Ver resultados
          </button>
        </section>
      ) : (
        <>
          <section className="metrics-grid">
            <div className="metric-card">
              <span>Total respuestas</span>
              <strong>{responses.length}</strong>
            </div>
            <div className="metric-card">
              <span>Contactos para entrevista</span>
              <strong>{responses.filter((response) => response.answers.interviewConsent === "Sí").length}</strong>
            </div>
            <div className="metric-card">
              <span>Última respuesta</span>
              <strong>{responses[0] ? new Date(responses[0].createdAt).toLocaleDateString("es-CO") : "Sin datos"}</strong>
            </div>
          </section>

          <section className="summary-grid">
            {summaries.map((summary) => (
              <article className="summary-card" key={summary.id}>
                <div className="summary-title">
                  <BarChart3 size={18} />
                  <h2>{summary.title}</h2>
                </div>
                {summary.rows.length ? (
                  <div className="bar-list">
                    {summary.rows.map(([label, count]) => {
                      const width = responses.length ? Math.round((count / responses.length) * 100) : 0;
                      return (
                        <div className="bar-row" key={label}>
                          <div className="bar-label">
                            <span>{label}</span>
                            <strong>{count}</strong>
                          </div>
                          <div className="bar-track">
                            <span style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="muted">Sin respuestas todavía.</p>
                )}
              </article>
            ))}
          </section>

          <section className="responses-table-wrap">
            <h2>Respuestas individuales</h2>
            <div className="responses-table">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    {questions.map((question) => (
                      <th key={question.id}>{question.number}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map((response) => (
                    <tr key={response.id}>
                      <td>{new Date(response.createdAt).toLocaleString("es-CO")}</td>
                      {questions.map((question) => (
                        <td key={question.id} title={getQuestionLabel(question.id)}>
                          {formatAnswer(response.answers[question.id])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
