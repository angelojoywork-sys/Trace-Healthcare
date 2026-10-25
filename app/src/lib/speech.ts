import { useEffect, useRef, useState } from "react";

// The Web Speech API is not in TypeScript's DOM lib; type the bits we use.
interface SpeechResultEvent {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

function getCtor(): (new () => Recognition) | undefined {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as (new () => Recognition) | undefined;
}

export const speechSupported = () => typeof window !== "undefined" && !!getCtor();

/**
 * Dictation into a text field. On-device or browser-vendor speech service, depending on browser;
 * Trace itself never uploads audio.
 */
export function useDictation(onText: (finalText: string) => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<Recognition | null>(null);
  const cb = useRef(onText);
  cb.current = onText;

  useEffect(() => () => rec.current?.stop(), []);

  function start() {
    const Ctor = getCtor();
    if (!Ctor) {
      setError("Voice isn't supported in this browser. Try Chrome or Safari, or type instead.");
      return;
    }
    const r = new Ctor();
    r.lang = "en-IE";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) cb.current(res[0].transcript.trim());
        else live += res[0].transcript;
      }
      setInterim(live);
    };
    r.onerror = (e) => {
      setError(e.error === "not-allowed" ? "Microphone permission was blocked." : "Voice stopped. You can type instead.");
    };
    r.onend = () => {
      setListening(false);
      setInterim("");
    };
    rec.current = r;
    setError(null);
    r.start();
    setListening(true);
  }

  function stop() {
    rec.current?.stop();
  }

  return { listening, interim, error, start, stop, toggle: () => (listening ? stop() : start()) };
}
