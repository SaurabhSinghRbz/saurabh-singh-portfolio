import ScrambleText from "@/components/motion/ScrambleText";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  lede?: string;
};

export default function SectionHeading({ eyebrow, title, lede }: SectionHeadingProps) {
  return (
    <div className="mb-12">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
        <ScrambleText text={eyebrow} />
      </p>
      <h2 className="font-display text-3xl md:text-4xl text-ink text-balance">{title}</h2>
      {lede && <p className="mt-4 text-muted text-lg max-w-[62ch]">{lede}</p>}
    </div>
  );
}
