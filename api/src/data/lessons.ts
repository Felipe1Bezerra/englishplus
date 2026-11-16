import type { LessonContent } from "../types.js";

interface SeedLesson extends LessonContent {
  slug: string;
  title: string;
  level: string;
  topic: string;
  minutes: number;
  summary: string;
}

/** Starter lessons, copied into the database the first time the API starts. */
export const lessons: SeedLesson[] = [
  {
    slug: "ordering-at-a-restaurant",
    title: "Ordering at a restaurant",
    level: "A2",
    topic: "Speaking",
    minutes: 10,
    summary:
      "The phrases you need from sitting down to paying the bill, and how to sound polite while using them.",
    sections: [
      {
        heading: "Asking for what you want",
        body: "“I want” is correct English, but it can sound too direct in a restaurant. Use “I'd like” or “Could I have” instead.",
        examples: [
          "I'd like the chicken soup, please.",
          "Could I have a glass of water?",
          "Can we see the menu, please?",
        ],
      },
      {
        heading: "Asking questions about the food",
        body: "Servers expect questions, so ask before you order. These two patterns work for almost anything on the menu.",
        examples: [
          "What do you recommend?",
          "Does this have nuts in it?",
          "Is the fish fresh today?",
        ],
      },
      {
        heading: "Finishing your meal",
        body: "In many countries the server will not bring the bill until you ask for it. In American English it is “the check”.",
        examples: ["Could we have the bill, please?", "Can I pay by card?"],
      },
    ],
    vocabulary: [
      {
        term: "starter",
        definition: "a small dish you eat before the main course",
        example: "We shared a starter of grilled vegetables.",
      },
      {
        term: "main course",
        definition: "the largest dish of a meal",
        example: "For my main course, I'll have the pasta.",
      },
      {
        term: "tip",
        definition: "extra money you give for good service",
        example: "We left a tip because the service was great.",
      },
    ],
    quiz: [
      {
        prompt: "Which sentence is the most polite way to order?",
        options: ["I want a coffee.", "Give me a coffee.", "I'd like a coffee, please."],
        answerIndex: 2,
        explanation: "“I'd like” plus “please” is the standard polite way to order.",
      },
      {
        prompt: "You have finished eating. What do you say?",
        options: [
          "Could we have the bill, please?",
          "Could we have the menu, please?",
          "Could we have a starter, please?",
        ],
        answerIndex: 0,
        explanation: "The bill (or “check” in the US) is what you ask for when you want to pay.",
      },
      {
        prompt: "Which word means “extra money for good service”?",
        options: ["bill", "tip", "course"],
        answerIndex: 1,
        explanation: "A tip is the extra money you leave for the staff.",
      },
    ],
  },
  {
    slug: "present-perfect-vs-past-simple",
    title: "Present perfect or past simple?",
    level: "B1",
    topic: "Grammar",
    minutes: 15,
    summary:
      "One asks when it happened, the other asks whether it matters now. Learn to choose between them with confidence.",
    sections: [
      {
        heading: "Past simple: a finished time",
        body: "Use the past simple when the event belongs to a finished time. You either say when, or the listener already knows.",
        examples: [
          "I visited London in 2019.",
          "She called me yesterday.",
          "We didn't go out last night.",
        ],
      },
      {
        heading: "Present perfect: connected to now",
        body: "Use the present perfect when the time is not stated or not finished. The result or the experience is what matters.",
        examples: [
          "I've visited London twice.",
          "She has already called me.",
          "We haven't gone out this week.",
        ],
      },
      {
        heading: "Signal words",
        body: "Some time expressions point to one tense. “Yesterday”, “ago” and “last year” take the past simple. “Yet”, “already”, “ever” and “so far” usually take the present perfect.",
        examples: [
          "I finished the report two hours ago.",
          "Have you finished the report yet?",
        ],
      },
    ],
    vocabulary: [
      {
        term: "already",
        definition: "before now, often sooner than expected",
        example: "I've already eaten, thanks.",
      },
      {
        term: "yet",
        definition: "until now; used in questions and negatives",
        example: "He hasn't replied yet.",
      },
      {
        term: "so far",
        definition: "up to this point in time",
        example: "We've had three meetings so far this week.",
      },
    ],
    quiz: [
      {
        prompt: "Choose the correct sentence.",
        options: [
          "I have seen that film last week.",
          "I saw that film last week.",
          "I've saw that film last week.",
        ],
        answerIndex: 1,
        explanation: "“Last week” is a finished time, so it takes the past simple.",
      },
      {
        prompt: "“___ you ever ___ sushi?”",
        options: ["Did / eaten", "Have / ate", "Have / eaten"],
        answerIndex: 2,
        explanation: "“Ever” asks about life experience, so use the present perfect: have + past participle.",
      },
      {
        prompt: "“She ___ here since 2020.” She still works here.",
        options: ["has worked", "worked", "works"],
        answerIndex: 0,
        explanation: "“Since 2020” with a situation that continues today needs the present perfect.",
      },
      {
        prompt: "Which time expression goes with the past simple?",
        options: ["yet", "two days ago", "so far"],
        answerIndex: 1,
        explanation: "“Ago” always points to a finished moment in the past.",
      },
    ],
  },
  {
    slug: "phrasal-verbs-at-work",
    title: "Phrasal verbs at work",
    level: "B1",
    topic: "Vocabulary",
    minutes: 12,
    summary:
      "Native speakers rarely “postpone” a meeting; they put it off. Learn the verbs you will actually hear in the office.",
    sections: [
      {
        heading: "Planning and scheduling",
        body: "These verbs come up whenever people arrange their work. Each one has a more formal single-word equivalent.",
        examples: [
          "Let's put off the meeting until Friday. (postpone)",
          "Can you set up a call with the client? (arrange)",
          "I need to go over the numbers first. (review)",
        ],
      },
      {
        heading: "Working with other people",
        body: "These verbs describe how people support each other, and what happens when plans change.",
        examples: [
          "I'll follow up with Maria tomorrow.",
          "Could you fill in for me on Monday?",
          "The deal fell through at the last minute.",
        ],
      },
    ],
    vocabulary: [
      {
        term: "put off",
        definition: "to delay something until later",
        example: "We put off the launch by two weeks.",
      },
      {
        term: "go over",
        definition: "to check or review something carefully",
        example: "Let's go over the slides before the meeting.",
      },
      {
        term: "fall through",
        definition: "to fail to happen as planned",
        example: "Our plans fell through because of the budget.",
      },
    ],
    quiz: [
      {
        prompt: "“We need to ___ the launch until next quarter.”",
        options: ["put off", "fill in", "go over"],
        answerIndex: 0,
        explanation: "“Put off” means to delay something.",
      },
      {
        prompt: "“The deal fell through.” What happened?",
        options: ["It was signed.", "It did not happen.", "It was reviewed."],
        answerIndex: 1,
        explanation: "When a plan falls through, it fails to happen.",
      },
      {
        prompt: "“Let's ___ the contract together before we sign it.”",
        options: ["set up", "go over", "put off"],
        answerIndex: 1,
        explanation: "“Go over” means to check something carefully.",
      },
    ],
  },
  {
    slug: "writing-polite-emails",
    title: "Writing polite emails",
    level: "B2",
    topic: "Writing",
    minutes: 15,
    summary:
      "Soften requests, disagree without offending, and end a message so people actually reply.",
    sections: [
      {
        heading: "Softening a request",
        body: "A direct command can sound rude in English, even between colleagues. Past forms and “would” create polite distance.",
        examples: [
          "I was wondering if you could send me the file.",
          "Would you mind reviewing this by Thursday?",
          "It would be great if you could join the call.",
        ],
      },
      {
        heading: "Disagreeing politely",
        body: "Recognise the other person's view first, then introduce yours. Avoid a bare “you are wrong”.",
        examples: [
          "I see your point, but I'm not sure that will work.",
          "I may be mistaken, but I think the figures have changed.",
        ],
      },
      {
        heading: "Closing the message",
        body: "End with one clear next step, then a closing that fits the relationship.",
        examples: [
          "Please let me know by Friday if this works for you.",
          "Looking forward to hearing from you.",
          "Kind regards,",
        ],
      },
    ],
    vocabulary: [
      {
        term: "to follow up",
        definition: "to contact someone again about something discussed",
        example: "I'm following up on our conversation last week.",
      },
      {
        term: "attached",
        definition: "sent together with an email",
        example: "Please find the report attached.",
      },
      {
        term: "at your earliest convenience",
        definition: "as soon as you reasonably can; a formal phrase",
        example: "Please reply at your earliest convenience.",
      },
    ],
    quiz: [
      {
        prompt: "Which request is the most polite?",
        options: [
          "Send me the file today.",
          "I was wondering if you could send me the file today.",
          "You have to send me the file today.",
        ],
        answerIndex: 1,
        explanation: "“I was wondering if” uses a past form to soften the request.",
      },
      {
        prompt: "Which is the best way to disagree with a client?",
        options: [
          "That's wrong.",
          "You didn't understand the figures.",
          "I see your point, but I think the figures have changed.",
        ],
        answerIndex: 2,
        explanation: "It acknowledges their view before introducing yours.",
      },
      {
        prompt: "“Would you mind ___ this by Thursday?”",
        options: ["to review", "reviewing", "review"],
        answerIndex: 1,
        explanation: "“Would you mind” is always followed by the -ing form.",
      },
    ],
  },
];
