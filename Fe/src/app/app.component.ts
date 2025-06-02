import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RecordAudioService } from '../service/record-audio.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'teaSpot';
  private recordAudio = inject(RecordAudioService)
  constructor() {

    this.startRecording();

  }
  async startRecording() {
    try {

      await this.recordAudio.startRecording()

    }
    catch (err) {
      console.error("error : ", err)
    }
  }

}
