import { Category } from './survey.model';

export interface QuestionDraft {
  text: string;
  allowMultiple: boolean;
  answers: string[];
}

/** A new survey the way the form fills it in. */
export interface SurveyDraft {
  title: string;
  category: Category;
  endDate: Date | null;
  description: string | null;
  questions: QuestionDraft[];
}

/** A new survey the way it is sent to the database. */
export interface SurveyInsert {
  title: string;
  category: Category;
  end_date: string | null;
  description: string | null;
}

/** A new question the way it is sent to the database. */
export interface QuestionInsert {
  survey_id: string;
  position: number;
  text: string;
  allow_multiple: boolean;
}

/** A new answer the way it is sent to the database. */
export interface AnswerInsert {
  question_id: string;
  position: number;
  label: string;
}
