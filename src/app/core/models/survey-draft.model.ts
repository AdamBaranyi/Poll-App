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

/** A new question the way create_survey expects it. */
export interface NewQuestion {
  text: string;
  allow_multiple: boolean;
  answers: string[];
}

/** A new survey the way create_survey expects it: survey, questions and answers in one piece. */
export interface NewSurvey {
  title: string;
  category: Category;
  end_date: string | null;
  description: string | null;
  questions: NewQuestion[];
}
