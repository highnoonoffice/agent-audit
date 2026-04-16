"use client";

import { FormEvent, useState } from "react";
import OutputPanel from "@/components/OutputPanel";
import WorkflowDiagram from "@/components/WorkflowDiagram";

type Owner = "human" | "ai" | "hybrid";
type Attention = "low" | "medium" | "high";

type Step = {
  id: number;
  label: string;
  owner: Owner;
  attention: Attention;
  notes: string;
};

type Handoff = {
  from: number;
  to: number;
  type: string;
};

type CascadeData = {
  steps: Step[];
  handoffs: Handoff[];
  summary: string;
  recapture: string;
};

export default function Home() {
  const [processText, setProcessText] = useState("");
  const [data, setData] = useState<CascadeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cascade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ process: processText }),
      });

      const payload = (await response.json()) as CascadeData & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to map process.");
      }

      setData(payload);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white sm:px-8 lg:px-14">
      <div className="mx-auto w-full max-w-7xl">
        <section className="mb-10">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Describe your process. See it with agents.
          </h1>
          <p className="mt-4 max-w-3xl text-base text-zinc-400 sm:text-lg">
            Paste in any business workflow. We&apos;ll map which steps AI owns, which stay human,
            and what you get back.
          </p>
        </section>

        <section className="rounded-xl border border-white/10 bg-zinc-950/60 p-5 sm:p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <textarea
              value={processText}
              onChange={(event) => setProcessText(event.target.value)}
              placeholder="Our SDRs research leads, write outreach, log to HubSpot, then follow up after 3 days if no reply..."
              className="h-44 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900/80 p-4 text-base text-white placeholder:text-zinc-500 outline-none transition focus:border-gold"
              required
              minLength={10}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-gold px-5 py-3 font-semibold text-black transition hover:bg-[#d8b75b] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Mapping..." : "Map This Process"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        </section>

        {data && (
          <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <WorkflowDiagram steps={data.steps} handoffs={data.handoffs} />
            <OutputPanel summary={data.summary} recapture={data.recapture} />
          </section>
        )}
      </div>
    </main>
  );
}
