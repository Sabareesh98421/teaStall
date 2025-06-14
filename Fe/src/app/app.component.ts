// app.component.ts
import { Component, inject, OnInit, Signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpHandlerService } from '@core/http-handler.service';
import { environment } from '@env/environment.development';
import { RecordAudioService } from '@service/Audio/record-audio.service';
import { tryCatchSynthesizer } from '@sharedUtils/utils';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  title = 'teaSpot';
  transcript!: Signal<string>;
  private readonly apiUrl = environment.baseUrl;
  private recordAudio: RecordAudioService = inject(RecordAudioService)
  private http = inject(HttpHandlerService);
  protected serverStatusMessage: string = "";
  //  I don't need of constructor here because I am using the inject function to get the RecordAudioService instance
  ngOnInit(): void {
    // new TryCatchSynthesizer(this.get).run();
    tryCatchSynthesizer(this.get.bind(this), {
      errMessage: "Failed to fetch server status",
      isAsync: false
    }).run();

    this.startRecording();
  }
  async startRecording() {
    try {

      await this.recordAudio.startRecording()
      this.transcript = this.recordAudio.transcriptSignal;
    }
    catch (err) {
      console.error("error : ", err)
    }
  }

  private get() {

    this.http.get<{ welcome: string }>(this.apiUrl).subscribe((res) => {

      console.log(res.welcome);
      this.serverStatusMessage = res.welcome;

    })

  }
}

