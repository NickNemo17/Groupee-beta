export const metadata = { title: "Groupee Partner Studio — Compliance" };

const RULES = [
  {
    channel: "Email (CAN-SPAM)",
    status: "Default channel",
    tone: "ok",
    points: [
      "No prior consent required for a first cold email.",
      "Every send carries a working one-click opt-out and truthful sender identity.",
      "Outreach runs on a dedicated domain, separate from transactional/brand mail.",
    ],
  },
  {
    channel: "Voice (TCPA)",
    status: "Consent-gated",
    tone: "warn",
    points: [
      "An AI voice counts as an “artificial or prerecorded voice” — it requires prior express written consent.",
      "The agent only dials after the merchant has explicitly said yes; consent is timestamped and logged.",
      "Phone lists are scrubbed against the National Do-Not-Call registry before any call.",
    ],
  },
  {
    channel: "Human-in-the-loop",
    status: "Always",
    tone: "ok",
    points: [
      "Agents source, qualify, and draft; a human approves every send and owns negotiation.",
      "Opt-outs are honored within 10 business days and propagate across channels.",
    ],
  },
];

export default function CompliancePage() {
  return (
    <div className="px-6 py-6 lg:px-8">
      <header className="mb-5">
        <h1 className="text-[24px] font-extrabold tracking-tight text-ink">Compliance</h1>
        <p className="max-w-2xl text-[13px] text-muted">
          Fair to merchants means fair in how we reach them. Email-first, voice only on consent, a
          human on every send.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {RULES.map((r) => (
          <div key={r.channel} className="rounded-xl border border-hairline bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-ink">{r.channel}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  r.tone === "warn" ? "bg-amber-50 text-amber-700" : "bg-accent-soft text-accent-dark"
                }`}
              >
                {r.status}
              </span>
            </div>
            <ul className="space-y-2">
              {r.points.map((pt, i) => (
                <li key={i} className="flex gap-2 text-[12px] leading-snug text-ink-2">
                  <span className="text-accent">•</span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-5 max-w-2xl text-[12px] text-muted">
        Real outbound dialing (Twilio + DNC scrubbing + signed consent capture) is intentionally out of
        scope for this beta — the consent gate in each prospect&apos;s workspace represents that flow.
      </p>
    </div>
  );
}
