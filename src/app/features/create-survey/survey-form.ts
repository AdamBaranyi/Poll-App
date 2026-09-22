import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';

import {
  MAX_ANSWER_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_QUESTION_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_ANSWERS,
  MIN_TEXT_LENGTH,
} from '../../core/constants/poll.constants';
import { SurveyDraft } from '../../core/models/survey-draft.model';
import { Category } from '../../core/models/survey.model';
import { notInPast, requiredText } from '../../core/utils/form-validators';

export type AnswerControl = FormControl<string>;

export type QuestionForm = FormGroup<{
  text: FormControl<string>;
  allowMultiple: FormControl<boolean>;
  answers: FormArray<AnswerControl>;
}>;

export type SurveyForm = FormGroup<{
  title: FormControl<string>;
  category: FormControl<string>;
  endDate: FormControl<string>;
  description: FormControl<string>;
  questions: FormArray<QuestionForm>;
}>;

/** Builds an empty answer field. */
export function createAnswer(builder: NonNullableFormBuilder): AnswerControl {
  return builder.control('', [requiredText, Validators.maxLength(MAX_ANSWER_LENGTH)]);
}

/** Builds an empty question with the two answers that every question needs. */
export function createQuestion(builder: NonNullableFormBuilder): QuestionForm {
  return builder.group({
    text: builder.control('', [
      requiredText,
      Validators.minLength(MIN_TEXT_LENGTH),
      Validators.maxLength(MAX_QUESTION_LENGTH),
    ]),
    allowMultiple: builder.control(false),
    answers: builder.array(Array.from({ length: MIN_ANSWERS }, () => createAnswer(builder))),
  });
}

/** Builds the empty form for a new survey with one question. */
export function createSurveyForm(builder: NonNullableFormBuilder): SurveyForm {
  return builder.group({
    title: builder.control('', [
      requiredText,
      Validators.minLength(MIN_TEXT_LENGTH),
      Validators.maxLength(MAX_TITLE_LENGTH),
    ]),
    category: builder.control('', Validators.required),
    endDate: builder.control('', notInPast),
    description: builder.control('', Validators.maxLength(MAX_DESCRIPTION_LENGTH)),
    questions: builder.array([createQuestion(builder)]),
  });
}

/** Turns the filled in form into a new survey that ends at the end of the chosen day. */
export function toSurveyDraft(form: SurveyForm): SurveyDraft {
  const value = form.getRawValue();
  return {
    title: value.title.trim(),
    category: value.category as Category,
    endDate: value.endDate ? new Date(`${value.endDate}T23:59:59`) : null,
    description: value.description.trim() || null,
    questions: value.questions.map((question) => ({
      text: question.text.trim(),
      allowMultiple: question.allowMultiple,
      answers: question.answers.map((answer) => answer.trim()),
    })),
  };
}
