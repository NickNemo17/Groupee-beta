"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { getProspect } from "@/lib/merchants";
import { computeEconomics, qualify, valueScore, type PitchResult } from "@/lib/pitch";
import { archetypeFor } from "@/lib/archetypes";
import { useMerchant } from "@/lib/merchantStore";
import StageBadge from "@/components/merchant/StageBadge";
import ScoreMeter from "@/components/merchant/ScoreMeter";
import ValueScoreCard from "@/components/merchant/ValueScoreCard";
import EconomicsTable from "@/components/merchant/EconomicsTable";
import EmailPreview from "@/components/merchant/EmailPreview";
import CallPanel from "@/components/merchant/CallPanel";

export default function ProspectWorkspace() {
  const { id } = useParams<{ id: string }>();
  const prospect = getProspect(id);
  const { stageOf, setStage, pitches, savePitch, consent, logConsent, emailApproved, approveEmail } = useMerchant();
  const [generating, setGenerating] = useState(false);
  const [callDone, setCallDone] = useState(false);

  if (!prospect) {
    return (
      <div className="grid h-dvh place-items-center text-muted">
        <div className="text-center">
          <p>Prospect not found.</p>
          <Link href="/merchant" className="mt-2 inline-block text-accent-dark">← Pipeline</Link>
        </div>
      </div>
    );
  }

  const econ = computeEconomics(prospect);
  const qual = qualify(prospect);
  const value = valueScore(prospect, econ);
  const arc = archetypeFor(prospect.category);
  const blocked = value.verdict === "Hold"; // below the consumer value floor
  const pitch: PitchResult | undefined = pitches[id];
  const stage = stageOf(id);
  const approved = emailApproved[id];
  const consentAt = consent[id];

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/merchant-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as PitchResult;
      savePitch(id, data);
      if (stage === "Discovered") setStage(id, "Qualified");
    } catch {}
    setGenerating(false);
  };

  return (
    <div className="px-6 py-6 lg:px-8">
      <Link href="/merchant" className="text-[13px] text-muted hover:text-ink-2">← Pipeline</Link>

      <header className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[24px] font-extrabold tracking-tight text-ink">{prospect.name}</h1>
            <StageBadge stage={stage} />
            <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">
              {arc.label} · Mechanic {arc.mechanic}
            </span>
          </div>
          <p className="text-[13px] text-muted">
            {prospect.category} · {prospect.neighborhood} · ★ {prospect.rating} ({prospect.reviewCount.toLocaleString()} reviews)
          </p>
        </div>
        <div className="text-right text-[12px] text-muted">
          <p className="font-semibold text-ink-2">{prospect.contact.owner}</p>
          <p>{prospect.contact.email}</p>
          <p>{prospect.contact.phone}</p>
        </div>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
        {/* left rail: what the supply graph found */}
        <div className="space-y-4">
          <div className="rounded-xl border border-hairline bg-white p-4">
            <h3 className="text-[14px] font-bold text-ink">Signals gathered</h3>
            <p className="mb-2 text-[11px] text-muted">
              {prospect.sources.join(" · ")} · refreshed {prospect.lastRefresh}
            </p>
            <ul className="space-y-2">
              {prospect.signals.map((s, i) => (
                <li key={i} className="flex gap-2 text-[13px] leading-snug text-ink-2">
                  <span className="text-accent">◆</span>
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-lg bg-canvas px-3 py-2 text-[12px] text-ink-2">
              <span className="font-semibold">Slow window:</span> {prospect.offPeakWindow} · ~{prospect.offPeakUtilizationPct}% full
            </div>
          </div>
          <ScoreMeter qual={qual} />
          <ValueScoreCard value={value} />
        </div>

        {/* right: the workflow */}
        <div className="space-y-5">
          {/* Step 1 — proposal */}
          <Step n={1} title="Reasoned proposal — “make it even”">
            {!pitch ? (
              <button
                onClick={generate}
                disabled={generating}
                className="rounded-btn bg-accent px-4 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
              >
                {generating ? "Agent is drafting…" : "✦ Generate proposal"}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-dark">
                    {pitch.source === "claude" ? "Claude-generated" : "Template (add ANTHROPIC_API_KEY for live)"}
                  </span>
                  <button onClick={generate} className="text-[12px] text-muted hover:text-ink-2">regenerate</button>
                </div>
                <p className="text-[13px] leading-relaxed text-ink-2">{pitch.summary}</p>
                <EconomicsTable e={econ} />
                <div className="rounded-xl border border-dashed border-accent/40 bg-accent-soft/50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-dark">Group-sampler offer</p>
                  <p className="text-[13px] text-ink-2">{pitch.offerLine}</p>
                </div>
              </div>
            )}
          </Step>

          {/* Step 2 — email */}
          {pitch && (
            <Step n={2} title="Outreach email — human approves the send">
              <EmailPreview prospect={prospect} subject={pitch.emailSubject} body={pitch.emailBody} />
              <div className="mt-3 flex items-center gap-3">
                {!approved ? (
                  <button
                    onClick={() => {
                      approveEmail(id);
                      if (stage === "Discovered" || stage === "Qualified") setStage(id, "Proposal sent");
                    }}
                    className="rounded-btn bg-ink px-4 py-2.5 text-[14px] font-semibold text-white"
                  >
                    Approve &amp; send
                  </button>
                ) : (
                  <span className="text-[13px] font-semibold text-accent-dark">✓ Sent · CAN-SPAM compliant (opt-out included)</span>
                )}
              </div>
            </Step>
          )}

          {/* Step 3 — consent gate */}
          {approved && (
            <Step n={3} title="Voice call — consent-gated (TCPA)">
              {!consentAt ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-[13px] text-amber-800">
                    An AI voice call needs the merchant&apos;s prior express consent. Log it before the agent can dial.
                  </p>
                  <button
                    onClick={() => {
                      logConsent(id);
                      setStage(id, "Call booked");
                    }}
                    className="mt-3 rounded-btn bg-amber-600 px-4 py-2 text-[13px] font-semibold text-white"
                  >
                    Merchant replied: ✅ OK to call
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-[12px] text-accent-dark">
                    ✓ Consent logged {new Date(consentAt).toLocaleString()} · DNC-scrubbed
                  </p>
                  <CallPanel prospect={prospect} talkingPoints={pitch!.talkingPoints} onComplete={() => setCallDone(true)} />
                </>
              )}
            </Step>
          )}

          {/* Step 4 — onboard */}
          {callDone && stage !== "Onboarded" && (
            <Step n={4} title="Outcome — value gate">
              <div className="rounded-xl border border-hairline bg-white p-4">
                <p className="text-[13px] text-ink-2">Call transcript logged to CRM. Merchant agreed to a 72-hour deal launch.</p>
                {blocked ? (
                  <div className="mt-3 rounded-lg bg-rose-50 px-4 py-3">
                    <p className="text-[13px] font-semibold text-rose-700">
                      Below the consumer value floor (score {value.score}) — this deal can&apos;t reach the Groupee feed.
                    </p>
                    <p className="mt-1 text-[12px] text-rose-700/90">{value.lever}</p>
                    <p className="mt-1 text-[12px] text-ink-2">
                      We&apos;d rather show users nothing than something that isn&apos;t worth their time. Pass, or renegotiate the terms.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mt-2 text-[12px] text-accent-dark">
                      ✓ Value score {value.score} ({value.verdict}) — clears the feed floor.
                    </p>
                    <button
                      onClick={() => setStage(id, "Onboarded")}
                      className="mt-3 rounded-btn bg-accent px-4 py-2.5 text-[14px] font-semibold text-white"
                    >
                      Onboard → publish to feed →
                    </button>
                  </>
                )}
              </div>
            </Step>
          )}
          {stage === "Onboarded" && (
            <div className="rounded-xl bg-accent-soft px-4 py-4 text-center">
              <p className="text-[15px] font-bold text-accent-dark">🎉 {prospect.name} onboarded</p>
              <p className="text-[12px] text-ink-2">Deal ships in 72 hours · merchant keeps their customer data · fair from day one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[12px] font-bold text-white">{n}</span>
        <h2 className="text-[15px] font-bold text-ink">{title}</h2>
      </div>
      <div className="pl-8">{children}</div>
    </section>
  );
}
