type OutputPanelProps = {
  summary: string;
  recapture: string;
};

export default function OutputPanel({ summary, recapture }: OutputPanelProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-zinc-950/70 p-6">
      <p className="text-base leading-7 text-zinc-100">{summary}</p>

      <p className="mt-6 text-lg font-semibold text-gold">
        Estimated recapture: {recapture}
      </p>

      <a
        href="https://www.josephvoelbel.com/ai-operations/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block text-gold underline underline-offset-4 hover:text-[#d7b966]"
      >
        Want to see this built for your team?
      </a>
    </section>
  );
}
