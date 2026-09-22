export interface AnswerOption {
  id: string;
  position: number;
  label: string;
}

export interface Question {
  id: string;
  position: number;
  text: string;
  allowMultiple: boolean;
  options: AnswerOption[];
}

/** A question the way the database returns it, together with its answers. */
export interface QuestionRow {
  id: string;
  position: number;
  text: string;
  allow_multiple: boolean;
  answer_options: AnswerOption[];
}
