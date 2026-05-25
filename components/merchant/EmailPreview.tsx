import { type Prospect } from "@/lib/merchants";

export default function EmailPreview({
  prospect,
  subject,
  body,
}: {
  prospect: Prospect;
  subject: string;
  body: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-white">
      <div className="border-b border-hairline bg-canvas px-4 py-2.5 text-[12px] text-muted">
        <div><span className="font-semibold text-ink-2">To:</span> {prospect.contact.owner} &lt;{prospect.contact.email}&gt;</div>
        <div><span className="font-semibold text-ink-2">From:</span> partners@groupee.co</div>
        <div className="mt-0.5 text-[14px] font-bold text-ink">{subject}</div>
      </div>
      <pre className="whitespace-pre-wrap px-4 py-3 font-sans text-[13px] leading-relaxed text-ink-2">{body}</pre>
    </div>
  );
}
