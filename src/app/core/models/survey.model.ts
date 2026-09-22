import { CATEGORIES } from '../constants/poll.constants';

export type Category = (typeof CATEGORIES)[number];

export interface Survey {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  endDate: Date | null;
  createdAt: Date;
}

/** A survey the way the database returns it. */
export interface SurveyRow {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  end_date: string | null;
  created_at: string;
}
