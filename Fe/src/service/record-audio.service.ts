// import { HttpResponse } from '@angular/common/http';
import { inject, Injectable, NgZone } from '@angular/core';
import { HttpHandlerService } from '../core/http-handler.service';
interface audioTranscriptToBackend {
  body: string,
  audio: Blob
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

  // NgZone instance named ZoneOut because browser APIs cause Angular to 'zone out'.
  // We manually bring control back inside Angular zone using ZoneOut.run().
  private ZoneOut = inject(NgZone);

  private stream: MediaStream | null = null;

  // either one of the input word have to said the wake word triggers the start function
  private wakerWord: string[] = ["make order", "ஆர்டர் செய்", "make an order", "order please"];

  // either one of the input word set the AI to rest a bit from taking order and the wakeWord is only way to wak the AI to work
  private restWord: string[] = ["done", "ஓகே", "wait", "Rest"];

  // these words are used to confirm the order
  private wordsConfirmToOrder: string[] = ["yes", "ஆம்", "confirm", "okay", "sure", "next order"];

  private isAiActive: boolean = false;

  private audioBlob: Blob | null = null;

  private mediaRecorder: MediaRecorder | null = null;

  private orderBuffer: string = "";

  private recognition: any = null

  // private http = inject(HttpHandlerService);

  private isTranscriptReceived: boolean = false;

  constructor() { }

  async startRecording() {

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.ZoneOut.run(async () => {
        this.stream = stream;
      })
    }
    catch (err) {
      console.error("error : ", err)
    }
    // console.warn(this.stream)
    // console.error(this.stream?.getTrackById(this.stream.id))
    if (!this.stream) {

      console.log("Microphone function needs to be enabled");

      throw new Error('Microphone permission denied or no audio input device');

    }

    console.log(this.stream.active);

    this.startRecognize()

  }

  private isWakeWord(transcript: string): boolean {

    return this.wakerWord.some((word) => transcript.includes(word.normalize("NFC").toLowerCase()));

  }

  private isRestWord(transcript: string): boolean {

    return this.restWord.some((word) => transcript.includes(word.normalize("NFC").toLowerCase()));

  }

  private isConfirmOrderSword(transcript: string) {
    return this.wordsConfirmToOrder.some((word) => transcript.includes(word.normalize("NFC").toLowerCase()));
  }
  private wakeAI(transcript: string, audioBlob: Blob): void {
    if (!this.isConfirmOrderSword(transcript)) {
      return console.log("The order is not confirmed, please confirm the order by saying 'yes', 'confirm', 'okay', 'sure' or 'next order'.");
    }
    this.ZoneOut.run(() => {
      this.recordTheOrder()
      this.sendTranscriptToAPI(transcript, audioBlob);

    });
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

    console.log(this.recognition);

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

    this.recognition.lang = "ta-IN";

    this.recognition.continuous = true;

    this.ZoneOut.run(() => {

      this.recognition.onresult = this.recognitionOnResult.bind(this);

    })

  }

  private recognitionOnResult(events: any) {

    for (let i = events.resultIndex; i < events.results.length; i++) {

      const transcript = events.results[i][0].transcript.normalize("NFC").trim().toLowerCase();
      // Normalize the transcript to NFC form

      this.isTranscriptReceived = true

      console.log("Transcript received:", transcript);
      console.log("recognized : ", this.orderBuffer);

      this.AiStateHandler(transcript)
    }

  }
  private async recordTheOrder() {

    this.stopMediaRecording(); // stop any previous recording if active

    const recorder = new MediaRecorder(this.stream!);

    this.ZoneOut.run(() => {
      this.mediaRecorder = recorder;
      this.mediaRecorder.start();
      this.mediaRecorder.ondataavailable = this.handleMediaRecorderOndataAvailable.bind(this);
      console.log("Recording started");
    })

  }

  private handleMediaRecorderOndataAvailable(event: BlobEvent) {

    this.audioBlob = event.data;

    console.log("Audio data available, sending to API...");

    this.sendTranscriptToAPI(this.orderBuffer, this.audioBlob);

    this.orderBuffer = ""; // reset the order buffer after sending

  }

  private stopMediaRecording() {

    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {

      this.mediaRecorder.stop();

      console.log("Recording stopped");

    } else {

      console.warn("No active recording to stop");

    }
  }




  private sendTranscriptToAPI(transcript: string, audioBlob: Blob) {

    this.isAiActive = true;
    const data: audioTranscriptToBackend = {
      body: transcript,
      audio: audioBlob
    }
    Object.freeze(data);
    console.dir(data.body)
    this.isAiActive = true;

    // updated To socket Connection
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





  private AiStateHandler(transcript: string) {
    alert("AiStateHandler called with transcript: " + transcript);

    console.log("Checking isRestWord:", this.isRestWord(transcript));
    console.log("Checking isAiActive:", this.isAiActive);
    console.log("Checking isWakeWord:", this.isWakeWord(transcript));
    console.log("Checking isConfirmOrderSword:", this.isConfirmOrderSword(transcript));
    // copy the content from teh for loop to make the the method more readable
    if (this.isRestWord(transcript) && this.isAiActive) {
      alert(transcript + " - AI is now resting");
      console.log("Rest word detected - AI paused");
      this.isAiActive = false;
      this.orderBuffer = "";
      return; // stop processing further for now

    }

    if (this.isWakeWord(transcript) && !this.isAiActive) {
      // this isn't logging
      console.log(` the wake word ' ${transcript} ' is detected Ready to order sir`)
      this.isAiActive = true;
      // this.wakeAI(transcript) Establish the connection with socket
      return
    }

    if (this.isConfirmOrderSword(transcript)) {
      alert("isConfirmOrderSword called")
      // must make the order weather the AI is not active or active, no matter what
      console.log(`Order confirmed with transcript: ${transcript}`);
      this.wakeAI(transcript, this.audioBlob!);
      return; // skip further processing after confirming the order
    }

    if (this.isConfirmOrderSword(transcript) && this.isRestWord(transcript)) {
      alert("hello from isConfirmOrderSword and isRestWord")
      this.stopMediaRecording();
      this.isAiActive = false;
      this.orderBuffer = ""; // reset the order buffer
      this.audioBlob = null; // reset the audio blob
      console.log("Order confirmed and AI is resting, stopping recording.");
    }
    // wait for the previous Request complete;

    if (this.isAiActive) {
      console.log(`AI is active, processing transcript: ${transcript}`);
      this.orderBuffer += (this.orderBuffer ? " " : "") + transcript;
      // send to the socket
    }

  }
}
