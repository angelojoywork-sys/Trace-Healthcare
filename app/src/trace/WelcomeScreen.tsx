import { Button } from "@/components/ui/button";

export function WelcomeScreen({ onLog }: { onLog: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 px-5 pt-6 pb-5">
      <header className="flex items-center justify-between font-mono text-xs tracking-widest uppercase">
        <span>Trace</span>
        <span className="text-muted-foreground">Ireland</span>
      </header>

      <div className="bracket flex flex-1 flex-col items-center justify-center gap-10 px-6 py-8 text-center">
        <div
          aria-hidden="true"
          className="size-28 animate-pulse motion-reduce:animate-none"
          style={{
            borderRadius: "44% 56% 52% 48% / 48% 44% 56% 52%",
            background: "radial-gradient(circle at 40% 35%, #2b5f5a, #12302e 70%)",
            boxShadow: "0 0 48px rgba(100,255,218,0.45)",
          }}
        />
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl leading-tight font-light">Remember<br />every visit.</h1>
          <p className="mx-auto max-w-[28ch] text-muted-foreground">Log symptoms, doctors and prescriptions in one place.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button size="lg" className="h-12 rounded-sm font-mono tracking-widest uppercase" onClick={onLog}>Log symptom</Button>
        <Button size="lg" variant="outline" disabled aria-describedby="google-note" className="h-12 rounded-sm font-mono tracking-widest uppercase">
          Continue with Google
        </Button>
        <p id="google-note" className="text-center text-xs text-muted-foreground">Google back-up is coming soon. Your symptom notes stay on this phone.</p>
      </div>
    </div>
  );
}
