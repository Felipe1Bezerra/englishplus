export interface VocabularyItem {
  term: string;
  definition: string;
  example: string;
}

export interface LessonSection {
  heading: string;
  body: string;
  examples: string[];
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

/** The body of a lesson. Quiz answers must never be sent to a student unchecked. */
export interface LessonContent {
  sections: LessonSection[];
  vocabulary: VocabularyItem[];
  quiz: QuizQuestion[];
}

export type Role = "teacher" | "student";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
