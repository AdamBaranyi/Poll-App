import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { SurveyDetailComponent } from './features/survey-detail/survey-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Poll App' },
  { path: 'survey/:id', component: SurveyDetailComponent, title: 'Survey | Poll App' },
  { path: '**', redirectTo: '' },
];
