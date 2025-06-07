import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RecordAudioService } from '../service/record-audio.service';
import { HttpHandlerService } from '@core/http-handler.service';
import { environment } from '@env/environment.development';
// import { RecordAudioService } from '@service/record-audio.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  title = 'teaSpot';
  private readonly apiUrl = environment.apiUrl;
  private recordAudio = inject(RecordAudioService)
  private http = inject(HttpHandlerService);
  protected serverStatusMessage: string = "";
  //  I don't need of constructor here because I am using the inject function to get the RecordAudioService instance
  ngOnInit(): void {
    this.http.get<{ welcome: string }>(this.apiUrl).subscribe((res) => {
      console.log(res.welcome);
      this.serverStatusMessage = res.welcome;
    })
    // this.startRecording();
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
