import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    /** Loads the home page only when it is opened. */
    loadComponent: () =>
      import('./features/home/home.component').then((file) => file.HomeComponent),
    title: 'Poll App',
  },
  {
    path: 'survey/:id',
    /** Loads the detail view only when a survey is opened. */
    loadComponent: () =>
      import('./features/survey-detail/survey-detail.component').then(
        (file) => file.SurveyDetailComponent,
      ),
    title: 'Survey | Poll App',
  },
  { path: '**', redirectTo: '' },
];
