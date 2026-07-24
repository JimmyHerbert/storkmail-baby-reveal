"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Scene = "splash" | "inbox" | "decode" | "final";

const cleanName = (value: string) => {
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed ? trimmed.slice(0, 32) : "";
};

export default function Home() {
  const [scene, setScene] = useState<Scene>("splash");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const replayTimerRef = useRef<number | null>(null);

  const stopClock = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    startRef.current = null;
  }, []);

  const resetInbox = useCallback(() => {
    stopClock();
    setElapsed(0);
    setScene("inbox");
  }, [stopClock]);

  const beginReveal = useCallback(() => {
    if (scene !== "inbox") return;
    const started = performance.now();
    startRef.current = started;
    setElapsed(0);
    setScene("decode");

    const tick = (now: number) => {
      const next = now - started;
      setElapsed(next);
      if (next < 12000) {
        if (next >= 10000) setScene("final");
        frameRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
        setElapsed(12000);
        setScene("final");
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [scene]);

  const submitName = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = cleanName(name);
    if (!next) {
      setError("Please enter your first name to receive the delivery.");
      return;
    }
    setError("");
    setName(next);
    setScene("inbox");
  };

  useEffect(() => () => stopClock(), [stopClock]);

  const beginReplayHold = () => {
    if (scene !== "final" || elapsed < 12000) return;
    replayTimerRef.current = window.setTimeout(resetInbox, 2000);
  };

  const cancelReplayHold = () => {
    if (replayTimerRef.current !== null) window.clearTimeout(replayTimerRef.current);
    replayTimerRef.current = null;
  };

  const seconds = elapsed;
  const opening = scene === "decode" && seconds < 3000;
  const verified = scene === "decode" && seconds >= 3000;
  const clue = verified && seconds >= 3000;
  const codes = verified && seconds >= 4500;
  const codeText = seconds < 5000 ? "42" : seconds < 5500 ? "42  ·  4F" : "42  ·  4F  ·  59";
  const decoded = seconds < 6800 ? "B   _   _" : seconds < 7600 ? "B   O   _" : "B   O   Y";
  const wipeProgress = Math.min(1, Math.max(0, (seconds - 8500) / 1500));
  const revealProgress = Math.min(1, Math.max(0, (seconds - 10000) / 2000));

  return (
    <main className="stork-app" aria-label="StorkMail baby reveal">
      {scene === "splash" && (
        <section className="splash scene" aria-labelledby="splash-title">
          <div className="stamp">STORKMAIL <span>SM—027</span></div>
          <div className="splash-center">
            <p className="eyebrow">A PRIORITY DELIVERY IS WAITING</p>
            <h1 id="splash-title">Type your first name</h1>
            <p className="splash-copy">The stork has a message for you from Kim &amp; Jim.</p>
            <form onSubmit={submitName} noValidate>
              <label htmlFor="first-name">First name</label>
              <input
                id="first-name"
                value={name}
                onChange={(event) => { setName(event.target.value); setError(""); }}
                autoComplete="given-name"
                autoCapitalize="words"
                maxLength={32}
                placeholder="Your first name"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "name-error" : undefined}
              />
              <button className="primary-button" type="submit">RECEIVE DELIVERY <span aria-hidden="true">↗</span></button>
              {error && <p className="form-error" id="name-error" role="alert">{error}</p>}
            </form>
          </div>
          <p className="splash-foot">HANDLE WITH CARE <span>•</span> FEBRUARY 2027</p>
        </section>
      )}

      {scene === "inbox" && (
        <section className="inbox scene" aria-labelledby="inbox-title">
          <header className="inbox-header">
            <div><div className="brand">STORKMAIL</div><div className="micro">PRIORITY DELIVERY // SM—027</div></div>
            <div className="badge">1 NEW</div>
          </header>
          <div className="rule" />
          <article className="mail-card">
            <div className="mail-meta"><span>TO</span><strong>{name.toUpperCase()}</strong></div>
            <div className="mail-meta"><span>FROM</span><strong>THE STORK</strong></div>
            <div className="rule" />
            <h1 id="inbox-title">YOU HAVE A<br className="mobile-break" /> NEW MESSAGE</h1>
            <div className="card-bottom"><span className="micro">MESSAGE STATUS // UNOPENED</span><button className="open-button" onClick={beginReveal}>OPEN MESSAGE</button></div>
          </article>
          <p className="micro inbox-foot">AIR DELIVERY // HANDLE WITH CARE</p>
        </section>
      )}

      {scene === "decode" && (
        <section className={`decode scene ${opening ? "is-opening" : "is-verified"}`} aria-live="polite">
          <header className="decode-header"><div className="decode-brand">STORKMAIL // SECURE CHANNEL</div><div className="micro white">LINK VERIFIED</div></header>
          <div className="auth-track"><div className="auth-fill" style={{ width: `${Math.min(100, Math.max(0, (seconds - 1000) / 20))}%` }} /></div>
          <p className="decode-status">SECURE CHANNEL // {opening ? (seconds < 1000 ? "ESTABLISHING" : "AUTHENTICATING") : seconds < 4500 ? "VERIFIED" : seconds < 6000 ? "RECEIVING" : "DECRYPTING"}</p>
          <div className={`clue ${clue ? "show" : ""}`}><span className="micro">ETA</span><strong>FEBRUARY 2027</strong></div>
          <div className={`payload ${codes ? "show" : ""}`}><strong>{codeText}</strong><span>{decoded}</span></div>
          <p className="decode-foot micro">42 / 4F / 59 // HEX DELIVERY MANIFEST</p>
          {wipeProgress > 0 && <div className="wipe" style={{ width: `${wipeProgress * 100}%` }} />}
        </section>
      )}

      {scene === "final" && (
        <section className="final scene" onPointerDown={beginReplayHold} onPointerUp={cancelReplayHold} onPointerCancel={cancelReplayHold} onPointerLeave={cancelReplayHold} aria-label="Baby announcement">
          <div className="final-border" />
          <div className="final-top micro">STORKMAIL // DELIVERY CONFIRMED</div>
          <div className="final-copy" style={{ opacity: revealProgress }}>
            <p className="personal-line">SPECIAL DELIVERY FOR {name.toUpperCase()}</p>
            <h1>IT’S A BOY</h1>
            <p className="support">BABY HERBERT <span>•</span> ARRIVING FEBRUARY 2027</p>
          </div>
          <p className="final-footer micro">PRIORITY DELIVERY // KIM + JIM</p>
          <p className="replay-hint micro">PRESS AND HOLD TO REPLAY</p>
        </section>
      )}
    </main>
  );
}
