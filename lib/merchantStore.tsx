"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PROSPECTS, type Stage } from "./merchants";
import { type PitchResult } from "./pitch";

interface MerchantState {
  stages: Record<string, Stage>; // prospectId -> stage (overrides seed)
  consent: Record<string, string>; // prospectId -> ISO timestamp of logged consent
  pitches: Record<string, PitchResult>; // cached generated pitch per prospect
  emailApproved: Record<string, boolean>;
}

interface Ctx extends MerchantState {
  stageOf: (id: string) => Stage;
  setStage: (id: string, stage: Stage) => void;
  logConsent: (id: string) => void;
  savePitch: (id: string, pitch: PitchResult) => void;
  approveEmail: (id: string) => void;
}

const KEY = "groupee-merchant-v1";
const MerchantContext = createContext<Ctx | null>(null);

const seedStages = (): Record<string, Stage> =>
  Object.fromEntries(PROSPECTS.map((p) => [p.id, p.stage]));

export function MerchantProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MerchantState>({
    stages: seedStages(),
    consent: {},
    pitches: {},
    emailApproved: {},
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<MerchantState>;
        setState((s) => ({
          stages: { ...s.stages, ...(saved.stages ?? {}) },
          consent: saved.consent ?? {},
          pitches: saved.pitches ?? {},
          emailApproved: saved.emailApproved ?? {},
        }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {}
    }
  }, [state, hydrated]);

  const stageOf = (id: string) => state.stages[id] ?? "Discovered";
  const setStage = (id: string, stage: Stage) =>
    setState((s) => ({ ...s, stages: { ...s.stages, [id]: stage } }));
  const logConsent = (id: string) =>
    setState((s) => ({ ...s, consent: { ...s.consent, [id]: new Date().toISOString() } }));
  const savePitch = (id: string, pitch: PitchResult) =>
    setState((s) => ({ ...s, pitches: { ...s.pitches, [id]: pitch } }));
  const approveEmail = (id: string) =>
    setState((s) => ({ ...s, emailApproved: { ...s.emailApproved, [id]: true } }));

  return (
    <MerchantContext.Provider
      value={{ ...state, stageOf, setStage, logConsent, savePitch, approveEmail }}
    >
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const ctx = useContext(MerchantContext);
  if (!ctx) throw new Error("useMerchant must be used within MerchantProvider");
  return ctx;
}
