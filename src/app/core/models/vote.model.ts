export interface Vote {
  id: string;
  questionId: string;
  optionId: string;
}

/** A vote the way the database returns it. */
export interface VoteRow {
  id: string;
  question_id: string;
  option_id: string;
}

/** A new vote the way it is sent to the database. */
export interface VoteInsert {
  survey_id: string;
  question_id: string;
  option_id: string;
  submission_id: string;
}

/** The chosen answer ids of every question, by question id. */
export type Answers = Record<string, string[]>;
