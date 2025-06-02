// // global dependency config file at project root
// interface SpeechRecognition extends EventTarget {
//   lang: string;
//   continuous: boolean;
//   interimResults: boolean;
//   start(): void;
//   stop(): void;
//   onresult: ((event: any) => void) | null;
//   onerror: ((event: any) => void) | null;
//   onend: (() => void) | null;
// }

// declare var SpeechRecognition: {
//   prototype: SpeechRecognition;
//   new (): SpeechRecognition;
// };

// declare var webkitSpeechRecognition: {
//   prototype: SpeechRecognition;
//   new (): SpeechRecognition;
// };

// declare global {
//   interface Window {
//     SpeechRecognition?: typeof SpeechRecognition;
//     webkitSpeechRecognition?: typeof SpeechRecognition;
//   }
// }

// // Needed to make this a module and allow augmenting globals
// export {};
