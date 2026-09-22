import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SurveyDialogService } from './core/services/survey-dialog.service';
import { CreateSurveyComponent } from './features/create-survey/create-survey.component';

@Component({
  imports: [RouterOutlet, CreateSurveyComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly dialogState = inject(SurveyDialogService);
}
