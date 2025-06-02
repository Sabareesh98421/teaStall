import { HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HttpHandlerService } from '../core/http-handler.service';
interface audioTranscriptToBackend {
  body: string
}
// Declare the webkitSpeechRecognition for TypeScript
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any
  }
}

@Injectable({
  providedIn: 'root'
})
export class RecordAudioService {


  private stream: MediaStream | null = null;

  private wakerWord: string[] = ["make order", "make an order ", "order please"]; // either one of the input word have to said the wake word triggers the start function

  private restWord: string[] = ["done", "wait"]; // either one of the input word set the AI to rest a bit from taking order and the wakeWord is only way to wak the AI to work

  private isAiActive: boolean = false;

  private orderBuffer: string = "";
  private recognition: any = null

  private http = inject(HttpHandlerService);

  private isTranscriptReceived: boolean = false;

  constructor() { }

  async startRecording() {


    try {

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    catch (err) {
      console.error("error : ", err)
    }
    console.warn(this.stream)
    console.error(this.stream?.getTrackById(this.stream.id))
    if (!this.stream) {

      console.log("Microphone function needs to be enabled");

      throw new Error('Microphone permission denied or no audio input device');

    }

    console.log(this.stream.active);




    this.startRecognize()

  }

  private isWakeWord(transcript: string): boolean {

    return this.wakerWord.some((word) => transcript.includes(word.toLowerCase()));

  }

  private isRestWord(transcript: string): boolean {

    return this.restWord.some((word) => transcript.includes(word.toLowerCase()));

  }

  private wakeAI(transcript: string): void {
    this.sendTranscriptToAPI(transcript);
  }

  private startRecognize() {

    // const speechRecognition = (window as any).webkitSpeechRecognition;
    const speechRecognition: any = window.webkitSpeechRecognition || window.SpeechRecognition;

    if (!speechRecognition) {
      console.log("The Speech Recognition is not supported by the browser ");
      alert("Speech Recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }


    this.recognition = new speechRecognition();

    console.log(this.recognition)
    this.recognitionEventTestHandler();

    this.recognitionConfigs();

    this.recognition.start();

  }

  private recognitionEventTestHandler() {
    this.recognition.onerror = (e: any) => {
      console.error('Recognition error:', e)
      alert(`Speech recognition error: ${e.error}`);
      this.noSoundError(e, this.isTranscriptReceived);
    };

    this.recognition.onstart = () => console.log('Recognition started');
    this.recognition.onend = () => console.log('Recognition ended');
    this.recognition.onaudioend = () => {
      console.log('Audio ended,Restarting.....')
      this.recognition.start();
    };
    this.recognition.onspeechend = () => console.log('Speech ended');
  }

  private recognitionConfigs() {

    this.recognition.lang = "en-IN";

    this.recognition.continuous = true;

    this.recognition.onresult = this.recognitionOnResult.bind(this);

  }

  private recognitionOnResult(events: any) {
    for (let i = events.resultIndex; i < events.results.length; i++) {

      const transcript = events.results[i][0].transcript.trim().toLowerCase();
      this.isTranscriptReceived = true
      console.log("recognized : ", this.orderBuffer);

      if (this.isRestWord(transcript)) {

        console.log("Rest word detected - AI paused");

        this.isAiActive = false;
        this.orderBuffer = "";
        return; // stop processing further for now

      }

      if (this.isWakeWord(transcript) && !this.isAiActive) {
        console.log(` the wake word ' ${transcript} ' is detected Ready to order sir`)
        // this.wakeAI(transcript) Establish the connection with socket
        this.orderBuffer = "";
        continue;
      }

      // wait for the previous Request complete;

      if (this.isAiActive) {
        this.orderBuffer += (this.orderBuffer ? " " : "") + transcript;
        // send to the socket
      }

    }

  }
  private sendTranscriptToAPI(transcript: string) {

    this.isAiActive = true;
    const data: audioTranscriptToBackend = {
      body: transcript
    }
    Object.freeze(data);
    console.dir(data.body)
    this.isAiActive = true;
    // this.http.post<audioTranscriptToBackend>('/api/ai', data).subscribe({
    //   next: (response: any) => {
    //     console.log('AI Response:', response);
    //     this.isAiActive = false;
    //   },
    //   error: (error) => {
    //     console.error('Error sending to AI:', error);
    //     this.isAiActive = false;
    //   }
    // });
  }

  private noSoundError(eve: any, receivedTranscript: boolean) {
    if (eve.error === "no-speech") {
      setTimeout(() => {
        if (!receivedTranscript) {
          alert("No speech detected. Please try speaking louder or closer to the mic.");
        }
        receivedTranscript = false; // reset for next session
        this.recognition.start();   // restart listening
      }, 500); // short delay to see if transcript arrives
    }
  }
}

