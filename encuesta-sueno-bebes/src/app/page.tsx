"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Loader2, Moon, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { finalScreen, getVisibleQuestions, questions, welcome } from "@/src/lib/questions";
import type { AnswerValue, Question } from "@/src/lib/questions";

type Answers = Record<string, AnswerValue>;

function shuffleOptions(options: string[]) {
  const fixed = options.filter((option) => option === "Otra" || option === "Ninguna");
  const movable = options.filter((option) => option !== "Otra" && option !== "Ninguna");

  for (let i = movable.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [movable[i], movable[j]] = [movable[j], movable[i]];
  }

  return [...movable, ...fixed];
}

function isAnswered(question: Question, answers: Answers) {
  if (!question.required) {
    return true;
  }

  const value = answers[question.id];
  return Boolean(value && (!Array.isArray(value) || value.length > 0));
}

export default function SurveyPage() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [optionOrder] = useState(() =>
    Object.fromEntries(
      questions.map((question) => [
        question.id,
        question.type === "multi" && question.options ? shuffleOptions(question.options) : question.options ?? []
      ])
    )
  );

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers]);
  const currentQuestion = visibleQuestions[currentIndex];
  const progress = started && currentQuestion ? ((currentIndex + 1) / visibleQuestions.length) * 100 : 0;

  useEffect(() => {
    if (currentIndex > visibleQuestions.length - 1) {
      setCurrentIndex(Math.max(visibleQuestions.length - 1, 0));
    }
  }, [currentIndex, visibleQuestions.length]);

  function setSingleAnswer(value: string) {
    setAnswers((current) => ({ ...current, [currentQuestion.id]: value }));
    setError("");
  }

  function toggleMultiAnswer(value: string) {
    setAnswers((current) => {
      const existing = Array.isArray(current[currentQuestion.id]) ? (current[currentQuestion.id] as string[]) : [];
      const next = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value].slice(0, currentQuestion.maxSelections ?? 99);
      return { ...current, [currentQuestion.id]: next };
    });
    setError("");
  }

  async function submitSurvey(finalAnswers: Answers) {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo enviar la encuesta.");
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo enviar la encuesta.");
    } finally {
      setSubmitting(false);
    }
  }

  async function goNext() {
    if (!currentQuestion) {
      return;
    }

    if (!isAnswered(currentQuestion, answers)) {
      setError("Esta pregunta es obligatoria.");
      return;
    }

    if (currentIndex < visibleQuestions.length - 1) {
      setCurrentIndex((value) => value + 1);
      setError("");
      return;
    }

    await submitSurvey(answers);
  }

  function goBack() {
    setCurrentIndex((value) => Math.max(value - 1, 0));
    setError("");
  }

  function renderQuestion(question: Question) {
    const value = answers[question.id];
    const options = optionOrder[question.id] ?? [];

    if (question.type === "longText" || question.type === "shortText") {
      return (
        <textarea
          className={question.type === "shortText" ? "text-input short" : "text-input"}
          value={typeof value === "string" ? value : ""}
          rows={question.type === "shortText" ? 3 : 7}
          placeholder="Escribe tu respuesta aquí"
          onChange={(event) => {
            setAnswers((current) => ({ ...current, [question.id]: event.target.value }));
            setError("");
          }}
        />
      );
    }

    if (question.type === "scale") {
      return (
        <div className="scale-wrap">
          <div className="scale-options" role="radiogroup" aria-label={question.title}>
            {options.map((option) => (
              <button
                className={`scale-button ${value === option ? "selected" : ""}`}
                key={option}
                type="button"
                onClick={() => setSingleAnswer(option)}
                aria-pressed={value === option}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="scale-labels">
            <span>{question.minLabel}</span>
            <span>{question.maxLabel}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="options-list">
        {options.map((option) => {
          const selected = Array.isArray(value) ? value.includes(option) : value === option;
          const disabled =
            question.type === "multi" &&
            !selected &&
            Array.isArray(value) &&
            Boolean(question.maxSelections && value.length >= question.maxSelections);

          return (
            <button
              className={`option-button ${selected ? "selected" : ""}`}
              disabled={disabled}
              key={option}
              type="button"
              onClick={() => (question.type === "multi" ? toggleMultiAnswer(option) : setSingleAnswer(option))}
              aria-pressed={selected}
            >
              <span>{option}</span>
              <Check size={18} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <main className="survey-shell">
      <div className="hero-image" aria-hidden="true">
        <Image src="/nursery-hero.png" alt="" fill priority sizes="100vw" />
      </div>
      <div className="hero-overlay" />

      <section className="survey-panel" aria-live="polite">
        <div className="brand-row">
          <span className="brand-mark">
            <Moon size={18} aria-hidden="true" />
          </span>
          <span>Encuesta sueño bebés</span>
        </div>

        {!started && !submitted ? (
          <div className="welcome-screen">
            <p className="eyebrow">Investigación anónima</p>
            <h1>{welcome.title}</h1>
            <p>{welcome.text}</p>
            <button className="primary-button" type="button" onClick={() => setStarted(true)}>
              {welcome.button}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {started && currentQuestion && !submitted ? (
          <div className="question-screen">
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>

            <div className="question-meta">
              <span>
                Pregunta {currentQuestion.number} de {visibleQuestions[visibleQuestions.length - 1]?.number}
              </span>
              {currentQuestion.optional ? <span>Opcional</span> : <span>Obligatoria</span>}
            </div>

            <h1>{currentQuestion.title}</h1>
            {currentQuestion.instruction ? <p className="instruction">{currentQuestion.instruction}</p> : null}
            {currentQuestion.help ? <p className="instruction">{currentQuestion.help}</p> : null}

            {renderQuestion(currentQuestion)}

            {error ? <p className="error-message">{error}</p> : null}

            <div className="nav-row">
              <button className="ghost-button" type="button" onClick={goBack} disabled={currentIndex === 0 || submitting}>
                <ArrowLeft size={18} aria-hidden="true" />
                Atrás
              </button>
              <button className="primary-button" type="button" onClick={goNext} disabled={submitting}>
                {currentIndex === visibleQuestions.length - 1 ? "Enviar" : "Siguiente"}
                {submitting ? <Loader2 className="spin" size={20} aria-hidden="true" /> : <ArrowRight size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>
        ) : null}

        {submitted ? (
          <div className="final-screen">
            <span className="success-mark">
              <Sparkles size={22} aria-hidden="true" />
            </span>
            <h1>{finalScreen.title}</h1>
            <p>{finalScreen.text}</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
