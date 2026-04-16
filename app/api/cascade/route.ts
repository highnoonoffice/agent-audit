import OpenAI from "openai";
import { NextResponse } from "next/server";
import { CASCADE_SYSTEM_PROMPT } from "@/lib/prompt";

type Owner = "human" | "ai" | "hybrid";
type Attention = "low" | "medium" | "high";

type CascadeStep = {
  id: number;
  label: string;
  owner: Owner;
  attention: Attention;
  notes: string;
};

type CascadeHandoff = {
  from: number;
  to: number;
  type: string;
};

type CascadeResponse = {
  steps: CascadeStep[];
  handoffs: CascadeHandoff[];
  summary: string;
  recapture: string;
};

const VALID_OWNERS: Owner[] = ["human", "ai", "hybrid"];
const VALID_ATTENTION: Attention[] = ["low", "medium", "high"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateCascadeResponse(payload: unknown): payload is CascadeResponse {
  if (!isRecord(payload)) return false;

  const { steps, handoffs, summary, recapture } = payload;

  if (!Array.isArray(steps) || !Array.isArray(handoffs)) return false;
  if (typeof summary !== "string" || typeof recapture !== "string") return false;
  if (steps.length === 0 || steps.length > 8) return false;

  const stepsValid = steps.every((step) => {
    if (!isRecord(step)) return false;

    return (
      typeof step.id === "number" &&
      Number.isInteger(step.id) &&
      typeof step.label === "string" &&
      step.label.trim().length > 0 &&
      typeof step.owner === "string" &&
      VALID_OWNERS.includes(step.owner as Owner) &&
      typeof step.attention === "string" &&
      VALID_ATTENTION.includes(step.attention as Attention) &&
      typeof step.notes === "string"
    );
  });

  if (!stepsValid) return false;

  const handoffsValid = handoffs.every((handoff) => {
    if (!isRecord(handoff)) return false;

    return (
      typeof handoff.from === "number" &&
      Number.isInteger(handoff.from) &&
      typeof handoff.to === "number" &&
      Number.isInteger(handoff.to) &&
      typeof handoff.type === "string"
    );
  });

  return handoffsValid;
}

export async function POST(request: Request) {
  try {
    const { process: processText } = (await request.json()) as { process?: string };

    if (!processText || processText.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a fuller process description." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Server missing OPENAI_API_KEY." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: CASCADE_SYSTEM_PROMPT },
        { role: "user", content: processText },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Model returned an empty response." },
        { status: 502 }
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Model returned invalid JSON." },
        { status: 502 }
      );
    }

    if (!validateCascadeResponse(parsed)) {
      return NextResponse.json(
        { error: "Model output did not match required schema." },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("/api/cascade error", error);
    return NextResponse.json(
      { error: "Unable to map process right now. Please try again." },
      { status: 500 }
    );
  }
}
