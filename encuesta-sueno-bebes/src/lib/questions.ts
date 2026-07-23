export type QuestionType = "single" | "multi" | "scale" | "longText" | "shortText" | "boolean";

export type AnswerValue = string | string[];

export type Question = {
  id: string;
  number: number;
  title: string;
  type: QuestionType;
  required?: boolean;
  optional?: boolean;
  instruction?: string;
  help?: string;
  options?: string[];
  minLabel?: string;
  maxLabel?: string;
  maxSelections?: number;
  conditionalOn?: {
    id: string;
    value: string;
  };
};

export const welcome = {
  title: "¿Cómo están durmiendo las familias con bebés?",
  text:
    "Queremos entender cómo viven las familias el sueño de sus bebés y qué tipo de apoyo les sería realmente útil. La encuesta es anónima y toma menos de 3 minutos.",
  button: "Empezar"
};

export const finalScreen = {
  title: "¡Gracias por compartir tu experiencia! 💛",
  text:
    "Tus respuestas nos ayudarán a entender mejor qué necesitan realmente las familias para descansar con mayor tranquilidad."
};

export const questions: Question[] = [
  {
    id: "babyAge",
    number: 1,
    title: "¿Qué edad tiene tu bebé?",
    type: "single",
    required: true,
    options: [
      "Menos de 3 meses",
      "3 a 5 meses",
      "6 a 8 meses",
      "9 a 12 meses",
      "13 a 18 meses",
      "Más de 18 meses"
    ]
  },
  {
    id: "sleepDescription",
    number: 2,
    title: "En general, ¿cómo describirías actualmente el sueño de tu bebé?",
    type: "single",
    required: true,
    options: [
      "Duerme muy bien",
      "Duerme relativamente bien",
      "Tiene algunas dificultades",
      "Tiene dificultades frecuentes",
      "Es uno de nuestros principales problemas"
    ]
  },
  {
    id: "mainDifficulties",
    number: 3,
    title: "¿Cuáles son hoy tus principales dificultades con el sueño?",
    type: "multi",
    required: true,
    instruction: "Selecciona máximo tres.",
    maxSelections: 3,
    options: [
      "Se despierta muchas veces durante la noche",
      "Solo logra dormirse con ayuda",
      "Sus siestas son muy cortas",
      "Le cuesta conciliar el sueño",
      "Se despierta demasiado temprano",
      "No sé a qué hora debería dormir",
      "No tenemos una rutina consistente",
      "El sueño cambia mucho de un día a otro",
      "Me cuesta volverlo a dormir cuando se despierta",
      "Actualmente duerme bien",
      "Otra"
    ]
  },
  {
    id: "attempts",
    number: 4,
    title: "¿Qué has intentado para mejorar su sueño?",
    type: "multi",
    required: true,
    options: [
      "Buscar información en Google",
      "Preguntar en grupos de mamás o redes sociales",
      "Seguir cuentas de especialistas",
      "Consultar al pediatra",
      "Usar una aplicación de sueño",
      "Contratar una asesoría de sueño",
      "Probar diferentes cosas por mi cuenta",
      "Esperar a que la etapa pase",
      "No he intentado nada",
      "Otra"
    ]
  },
  {
    id: "changeBarrier",
    number: 5,
    title: "¿Qué es lo que más te dificulta hacer cambios?",
    type: "single",
    required: true,
    options: [
      "No sé cuál es realmente el problema",
      "Encuentro información contradictoria",
      "No sé qué método seguir",
      "Me preocupa dejarlo llorar",
      "Me cuesta mantener un plan varios días",
      "Mi pareja o cuidadores no siguen el mismo plan",
      "No tengo suficiente tiempo o energía",
      "No quiero cambiar cómo acompaño a mi bebé",
      "Actualmente no necesito hacer cambios",
      "Otra"
    ]
  },
  {
    id: "cryingView",
    number: 6,
    title: "¿Cuál frase se parece más a lo que piensas sobre el llanto?",
    type: "single",
    required: true,
    options: [
      "No aplicaría ningún método que implique llanto",
      "Aceptaría algo de protesta si puedo acompañar a mi bebé",
      "Aceptaría un método gradual con instrucciones claras",
      "Consideraría distintos métodos según el problema",
      "Ya he usado métodos que implican dejar llorar",
      "No tengo una posición definida"
    ]
  },
  {
    id: "preferredHelp",
    number: 7,
    title: "¿Qué tipo de ayuda te parecería más útil?",
    type: "single",
    required: true,
    options: [
      "Un horario recomendado de siestas y hora de dormir",
      "Entender por qué mi bebé podría estar durmiendo mal",
      "Un plan personalizado para mejorar su sueño",
      "Instrucciones para manejar los despertares",
      "Acompañamiento diario mientras hago cambios",
      "Poder hacer preguntas a un experto",
      "Contenido para aprender sobre sueño infantil",
      "Actualmente no buscaría ayuda"
    ]
  },
  {
    id: "toolInterest",
    number: 8,
    title:
      "Imagina una herramienta que analiza el sueño de tu bebé y te entrega un plan personalizado, gradual y adaptado a lo que estás dispuesta a hacer. ¿Qué tan interesada estarías en probarla?",
    type: "scale",
    required: true,
    minLabel: "1 = Nada interesada",
    maxLabel: "5 = Muy interesada",
    options: ["1", "2", "3", "4", "5"]
  },
  {
    id: "monthlyPrice",
    number: 9,
    title:
      "Si esta herramienta realmente te ayudara a sentirte más segura y mejorar el sueño familiar, ¿cuánto estarías dispuesta a pagar al mes?",
    type: "single",
    required: true,
    options: [
      "No pagaría",
      "Menos de $30.000 COP",
      "Entre $30.000 y $60.000 COP",
      "Entre $60.000 y $100.000 COP",
      "Más de $100.000 COP",
      "Dependería de una prueba gratuita o de los resultados",
      "No estoy segura"
    ]
  },
  {
    id: "lastSituation",
    number: 10,
    title: "Cuéntanos la última situación relacionada con el sueño de tu bebé en la que no supiste qué hacer.",
    type: "longText",
    optional: true,
    help: "Puedes contar brevemente qué pasó, qué intentaste y cómo te sentiste."
  },
  {
    id: "interviewConsent",
    number: 11,
    title: "¿Estarías dispuesta a conversar 15 minutos para contarnos más?",
    type: "boolean",
    optional: true,
    options: ["Sí", "No"]
  },
  {
    id: "contact",
    number: 12,
    title: "Déjanos tu WhatsApp o correo.",
    type: "shortText",
    optional: true,
    help: "Solo lo usaremos para contactarte sobre esta investigación.",
    conditionalOn: {
      id: "interviewConsent",
      value: "Sí"
    }
  }
];

export const requiredQuestionIds = questions.filter((question) => question.required).map((question) => question.id);

export function getVisibleQuestions(answers: Record<string, AnswerValue>) {
  return questions.filter((question) => {
    if (!question.conditionalOn) {
      return true;
    }

    return answers[question.conditionalOn.id] === question.conditionalOn.value;
  });
}

export function getQuestionLabel(id: string) {
  return questions.find((question) => question.id === id)?.title ?? id;
}
