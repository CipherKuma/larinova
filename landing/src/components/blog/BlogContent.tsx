import type { BlogSection } from "@/data/blog-posts";

function Paragraph({ content }: { content: string }) {
  return (
    <p className="text-[15px] leading-relaxed text-muted-foreground">
      {content}
    </p>
  );
}

function Heading({ content, level }: { content: string; level: 2 | 3 }) {
  const Tag = level === 2 ? "h2" : "h3";
  const styles =
    level === 2
      ? "mt-10 mb-4 font-display text-2xl font-bold text-foreground"
      : "mt-8 mb-3 font-display text-xl font-bold text-foreground";

  return <Tag className={styles}>{content}</Tag>;
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
          <span className="text-muted-foreground">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Quote({ content }: { content: string }) {
  return (
    <blockquote className="my-6 border-l-2 border-primary/40 pl-5">
      <p className="text-[15px] italic leading-relaxed text-foreground/80">
        {content}
      </p>
    </blockquote>
  );
}

function Callout({
  content,
  variant = "info",
}: {
  content: string;
  variant: "info" | "warning" | "tip";
}) {
  const variantStyles = {
    info: "border-blue-500/20 bg-blue-500/5 text-blue-300/80",
    warning: "border-amber-500/20 bg-amber-500/5 text-amber-300/80",
    tip: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300/80",
  };

  const labels = { info: "Note", warning: "Warning", tip: "Tip" };

  return (
    <div className={`my-6 rounded-lg border p-4 ${variantStyles[variant]}`}>
      <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-widest opacity-70">
        {labels[variant]}
      </p>
      <p className="text-[14px] leading-relaxed">{content}</p>
    </div>
  );
}

export function BlogContent({ sections }: { sections: BlogSection[] }) {
  return (
    <div className="space-y-5">
      {sections.map((section, i) => {
        switch (section.type) {
          case "paragraph":
            return <Paragraph key={i} content={section.content!} />;
          case "heading":
            return (
              <Heading
                key={i}
                content={section.content!}
                level={section.level ?? 2}
              />
            );
          case "list":
            return <List key={i} items={section.items!} />;
          case "quote":
            return <Quote key={i} content={section.content!} />;
          case "callout":
            return (
              <Callout
                key={i}
                content={section.content!}
                variant={section.variant ?? "info"}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
