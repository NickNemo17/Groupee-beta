import { NextResponse } from "next/server";
import { cappedString } from "@/lib/validate";
import { rateLimit } from "@/lib/ratelimit";

// Renders the agent's spoken pitch as audio via ElevenLabs TTS so you can HEAR
// the call in-browser. No Twilio / real dialing — that needs consent + DNC and
// is out of scope for this demo. Without ELEVENLABS_API_KEY, the UI shows the
// transcript only.

// Default public ElevenLabs voice ("Rachel"). Override with ELEVENLABS_VOICE_ID.
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

export async function GET() {
  // Lets the client check availability before showing a Play button.
  return NextResponse.json({ available: Boolean(process.env.ELEVENLABS_API_KEY) });
}

export async function POST(req: Request) {
  if (!rateLimit(req, "voice", 12)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return NextResponse.json({ available: false }, { status: 200 });
  }

  const body = await req.json().catch(() => ({}));
  const text = cappedString(body.text, 1200);
  if (!text) {
    return NextResponse.json({ error: "missing or oversized text" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: { stability: 0.4, similarity_boost: 0.8 },
        }),
      }
    );

    if (!res.ok || !res.body) {
      return NextResponse.json({ error: "tts failed", status: res.status }, { status: 502 });
    }

    return new Response(res.body, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "tts error" }, { status: 502 });
  }
}
