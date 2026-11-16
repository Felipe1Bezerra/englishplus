/**
 * Everything the sales page says, in one place.
 *
 * Text wrapped in `fill("...")` is a placeholder: it shows on the page as a highlighted
 * [PREENCHER] box. Replace each one with real information before launch, by swapping
 * fill("...") for plain text.
 */
import { ASSETS_URL } from "./site";

export interface Placeholder {
  placeholder: string;
}

export type Copy = string | Placeholder;

export const fill = (hint: string): Placeholder => ({ placeholder: hint });

export const isPlaceholder = (value: Copy): value is Placeholder => typeof value !== "string";

export const TEACHER_PHOTO = `${ASSETS_URL}/6e0387e5-be3b-47ee-b331-3580ff6b9aa8/felipe-perfil.jpg`;

export const HERO = {
  eyebrow: "Inglês para falar de verdade",
  title: "Destrave seu inglês",
  titleEmphasis: "mesmo que você trave na hora de falar",
  subtitle:
    "Aulas leves, divertidas e 100% focadas em conversação, com a gramática aparecendo só no momento certo. Do zero ao avançado.",
  trust: "Garantia de 7 dias · Cancele quando quiser · Pix ou cartão",
};

export const STATS: { value: Copy; label: string }[] = [
  { value: "+500", label: "Alunos" },
  { value: "8 anos", label: "Ensinando inglês" },
  { value: "★★★★★", label: "Nota máxima nas aulas" },
  { value: "+100 mil", label: "Visualizações no Instagram" },
];

export const BENEFITS = [
  {
    title: "Conversação desde a 1ª aula",
    body: "Cada encontro gira em torno de assuntos reais e variados, para você perder o travamento na hora de se comunicar.",
  },
  {
    title: "Gramática no momento certo",
    body: "Sem listas de regras soltas. A estrutura do inglês aparece durante a conversa, de forma natural.",
  },
  {
    title: "Atividades que fixam",
    body: "Exercícios corrigidos na hora, com a explicação de cada resposta, para memorizar o que você aprendeu.",
  },
  {
    title: "Gravado ou ao vivo",
    body: "Estude na plataforma no seu ritmo, ou pratique ao vivo em turma ou em aulas individuais.",
  },
  {
    title: "Acompanhamento do professor",
    body: "O Felipe acompanha sua evolução e deixa observações sobre seus pontos fortes e o que treinar.",
  },
  {
    title: "Preço que cabe no bolso",
    body: "Um dos pontos mais elogiados pelos alunos: planos a partir de R$ 49,90 por mês.",
  },
];

export const FORMATS = {
  eyebrow: "Dois jeitos de aprender",
  title: "Estude no seu ritmo",
  titleEmphasis: "ou ao vivo com o professor",
  subtitle: "Escolha o formato que encaixa na sua rotina. Dá até para combinar os dois.",
  options: [
    {
      label: "Plataforma",
      body: "2 aulas gravadas novas por semana, exercícios e material de apoio, 24 horas por dia.",
    },
    {
      label: "Ao vivo",
      body: "Turmas em grupo ou aulas individuais, com conversação em tempo real e correção na hora.",
    },
  ],
  problem:
    "Muita gente estuda inglês por anos e continua travando na hora de falar. A maioria dos cursos ensina regras soltas e quase não deixa o aluno conversar.",
  solution:
    "No English+ você conversa desde a primeira aula. A gramática aparece no meio da conversa, quando ela faz sentido, e os exercícios ajudam a fixar.",
  approaches: [
    { label: "Ler e entender", body: "Explicações curtas com exemplos que você usa no dia a dia." },
    { label: "Praticar", body: "Exercícios corrigidos na hora, com a resposta explicada." },
    { label: "Conversar", body: "Aulas ao vivo para colocar tudo em prática falando." },
  ],
};

export const TEACHER = {
  name: "Felipe Bezerra",
  mission: "inglês para falar de verdade",
  title: "Oi, eu sou o Felipe.",
  paragraphs: [
    "Ensino inglês há 8 anos e criei o English+ para quem já tentou aprender do jeito tradicional e travou na hora de falar.",
    "Minhas aulas são leves, divertidas e com foco total em conversação, com a gramática aparecendo só no momento certo.",
  ],
};

export const BASES = [
  {
    title: "Conversa primeiro",
    body: "Toda aula parte de uma situação real: pedir comida, falar de trabalho, contar uma história. Você fala desde o começo.",
    takeaway: "Inglês é para ser usado, não só estudado.",
  },
  {
    title: "Gramática no contexto",
    body: "A regra aparece quando você precisa dela para dizer algo. Assim faz sentido e fica na memória.",
    takeaway: "Menos decoreba, mais entendimento.",
  },
  {
    title: "Vocabulário de verdade",
    body: "Palavras e expressões que os nativos usam, sempre em frases completas para você reaproveitar.",
    takeaway: "Você aprende o que vai ouvir lá fora.",
  },
  {
    title: "Prática com correção",
    body: "Exercícios corrigidos na hora e observações do professor sobre sua evolução.",
    takeaway: "Você sabe exatamente o que treinar.",
  },
];

export const COURSES = [
  {
    level: "Dia a dia",
    title: "Inglês para o dia a dia",
    topics: ["Pedir no restaurante", "Frases educadas", "Perguntas sobre a comida", "Pagar a conta"],
  },
  {
    level: "Gramática",
    title: "Gramática sem decoreba",
    topics: ["Present perfect × past simple", "Palavras-sinal de tempo", "Already, yet e so far"],
  },
  {
    level: "Trabalho",
    title: "Inglês para o trabalho",
    topics: ["Phrasal verbs do escritório", "E-mails educados", "Discordar com elegância"],
  },
];

export const PLATFORM_FEATURES = [
  {
    title: "Tudo numa tela só.",
    body: "Suas próximas aulas, seus pacotes e o acompanhamento do professor assim que você entra.",
  },
  {
    title: "Calendário da turma.",
    body: "Veja todas as aulas ao vivo no horário de Brasília e entre na sala com um clique.",
  },
  {
    title: "Exercícios corrigidos.",
    body: "Responda, confira a nota e veja a explicação de cada resposta na hora.",
  },
];

export const LESSON_VIDEOS: { title: Copy }[] = [
  { title: fill("título do vídeo 1") },
  { title: fill("título do vídeo 2") },
  { title: fill("título do vídeo 3") },
];

export const FOR_YOU = [
  "Já estudou inglês, mas trava na hora de falar",
  "Quer conversar com confiança no trabalho ou em viagens",
  "Prefere aulas leves e práticas a listas de regras",
  "Quer começar do zero com um caminho claro",
  "Busca um preço que caiba no bolso",
];

export const NOT_FOR_YOU = [
  "Quer só decorar regras de gramática para uma prova",
  "Não está disposto a praticar falando",
  "Procura fluência sem nenhum esforço",
  "Prefere aulas cheias de teoria e pouca prática",
  "Não quer ser acompanhado por um professor",
];

export const TESTIMONIALS = [
  {
    name: "Maicon Roberto",
    handle: "@Ohmaik",
    photo: `${ASSETS_URL}/24dbd0c5-5e46-4bef-b0df-6aa554a6b0fc/image.png`,
    highlight: "As aulas têm me ajudado bastante a destravar.",
    quote:
      "As aulas têm sido muito boas pra mim. Além de leves e divertidas, têm bastante foco em conversação. A gramática aparece nos momentos certos, de forma natural. Eu estava bem travado pra conversar em inglês, e as aulas têm me ajudado bastante a destravar.",
  },
  {
    name: "Gabriel Ferreira",
    handle: "@bielks_",
    photo: `${ASSETS_URL}/99a293be-2c71-4159-806e-2d9329821677/image-2.png`,
    highlight: "Um dos melhores investimentos que já fiz.",
    quote:
      "Antes de começar, eu não sabia nem contar até 10 em inglês. Hoje já consigo ouvir podcasts, entender a maior parte das conversas e me comunicar em quase todas as situações. Sem dúvida, um dos melhores investimentos que já fiz.",
  },
  {
    name: "Ariane Mathias",
    handle: "@_arianemathias",
    photo: `${ASSETS_URL}/994c3be8-8af5-4e2c-9573-ee6ffee27e30/image-3.png`,
    highlight: "Hoje faço stand up comedy em inglês.",
    quote:
      "Quando comecei eu não sabia falar nada, e hoje consigo fazer apresentações de stand up comedy em inglês. O idioma me fez melhorar como artista e me trouxe mais oportunidades de trabalho.",
  },
  {
    name: "Maria Eduarda",
    handle: "@dudaabique",
    photo: `${ASSETS_URL}/1365374f-77e8-43b9-a3c1-e21ef9945fc2/image-4.png`,
    highlight: "Sinto que estou evoluindo cada vez mais!",
    quote:
      "As aulas do Felipe são incríveis! São muito dinâmicas, com bastante conversação e teoria na medida certa. Tem exercícios e brincadeiras que estimulam o inglês de forma natural. Sinto que estou evoluindo cada vez mais!",
  },
  {
    name: "Amanda Santos",
    handle: "@mandisantus",
    photo: `${ASSETS_URL}/5e2bac3b-1763-4fd8-baf5-c87fa90f465d/image-5.png`,
    highlight: "Aulas mais leves e participativas.",
    quote:
      "Tenho gostado muito das aulas. Ter aulas com outras pessoas deixa tudo mais dinâmico, porque praticamos conversação e ouvimos diferentes formas de falar. As atividades deixam a aula mais leve e participativa.",
  },
];

/** `value` is optional: add one, like "R$ 97", to show "de R$ 97 GRÁTIS" on the card. */
export const BONUSES: { title: Copy; body: Copy; value?: Copy }[] = [
  {
    title: "Material para praticar",
    body: "Material de apoio para você revisar e praticar o que aprendeu em cada aula, no seu ritmo.",
  },
  {
    title: "Quizzes e atividades",
    body: "Exercícios corrigidos na hora, com a explicação de cada resposta, para fixar o conteúdo de verdade.",
  },
  {
    title: "Acompanhamento do professor",
    body: "O próprio Felipe acompanha sua evolução e deixa observações para você saber como está indo e o que treinar.",
  },
];

export const STEPS = [
  "Escolha seu plano, mensal ou anual, e crie sua conta em menos de um minuto.",
  "Pague com Pix ou cartão. O acesso à sua área de aluno é liberado assim que o pagamento é aprovado.",
  "Nas aulas ao vivo, o Felipe coloca você em uma turma ou marca seus horários individuais.",
  "Pratique, faça os exercícios e acompanhe sua evolução com as observações do professor.",
];

export const FAQ = [
  {
    question: "Quais são as formas de pagamento?",
    answer:
      "Pix e cartão. O plano mensal é cobrado automaticamente todo mês; o anual é pago de uma vez, com 2 meses grátis.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim. No plano mensal você cancela a renovação quando quiser, sem multa, e mantém o acesso até o fim do período pago.",
  },
  {
    question: "E se eu não gostar?",
    answer:
      "Você tem 7 dias de garantia. Se não for para você, é só pedir no WhatsApp e devolvemos 100% do valor.",
  },
  {
    question: "Eu sou iniciante. Consigo acompanhar?",
    answer:
      "Sim. As aulas são organizadas por nível, do zero ao avançado, e o foco é conversar desde o começo.",
  },
  {
    question: "Quando saem as aulas novas?",
    answer: "Toda semana são liberadas 2 aulas novas na plataforma.",
  },
  {
    question: "Posso assistir pelo celular?",
    answer: "Sim. A plataforma funciona no celular, tablet e computador, a qualquer hora.",
  },
  {
    question: "Como funcionam as aulas ao vivo?",
    answer:
      "São turmas em grupo ou aulas individuais, com conversação em tempo real e correção na hora. Os horários ficam no seu calendário dentro da plataforma.",
  },
  {
    question: "Posso combinar a plataforma com as aulas ao vivo?",
    answer:
      "Pode. Muitos alunos usam a plataforma para estudar no seu ritmo e as aulas ao vivo para praticar a fala.",
  },
  {
    question: "Já tentei aprender antes e não consegui. Vai ser diferente?",
    answer:
      "O English+ foi criado justamente para quem travou no jeito tradicional: menos regra solta, mais conversa e acompanhamento de perto.",
  },
];
