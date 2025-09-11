import { SpeechServiceConfig } from "@/types";

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class SpeechService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private config: SpeechServiceConfig;
  private isListening = false;
  private onResultCallback?: (result: string) => void;
  private onErrorCallback?: (error: string) => void;
  private onEndCallback?: () => void;

  constructor(config?: Partial<SpeechServiceConfig>) {
    this.config = {
      language: 'en-US',
      rate: 1,
      pitch: 1,
      volume: 1,
      ...config
    };

    if (typeof window !== 'undefined') {
      this.initializeServices();
    }
  }

  private initializeServices() {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.config.language;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        this.onResultCallback?.(result);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech was detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone was found. Please check your microphone settings.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred during speech recognition.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        this.onErrorCallback?.(errorMessage);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onEndCallback?.();
      };
    }

    // Initialize Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }

  public startListening(
    onResult: (result: string) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): boolean {
    if (!this.recognition || this.isListening) {
      return false;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onEndCallback = onEnd;

    try {
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch (error) {
      this.isListening = false;
      this.onErrorCallback?.('Failed to start speech recognition');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        const error = 'Speech synthesis not supported';
        onError?.(error);
        reject(new Error(error));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.config.rate;
      utterance.pitch = this.config.pitch;
      utterance.volume = this.config.volume;
      utterance.lang = this.config.language;

      // Try to use a more natural voice if available
      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && 
        (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Natural'))
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else if (this.config.voiceURI) {
        const voice = voices.find(v => v.voiceURI === this.config.voiceURI);
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
        resolve();
      };

      utterance.onerror = (event: any) => {
        const error = `Speech synthesis error: ${event.error}`;
        onError?.(error);
        reject(new Error(error));
      };

      this.synthesis.speak(utterance);
    });
  }

  public stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  public updateConfig(newConfig: Partial<SpeechServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Global instance
let speechServiceInstance: SpeechService | null = null;

export const getSpeechService = (config?: Partial<SpeechServiceConfig>): SpeechService => {
  if (!speechServiceInstance) {
    speechServiceInstance = new SpeechService(config);
  }
  return speechServiceInstance;
};