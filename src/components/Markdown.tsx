// Minimal markdown preview (headings, bold, lists, paragraphs). No extra dep by design.
export function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/).map((b, i) => {
    if (b.startsWith('# ')) return <h1 key={i} className="text-xl font-bold">{b.slice(2)}</h1>;
    if (b.startsWith('## ')) return <h2 key={i} className="text-lg font-bold">{b.slice(3)}</h2>;
    const lines = b.split('\n');
    if (lines.every((l) => l.startsWith('- '))) {
      return <ul key={i} className="list-disc pl-5">{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
    }
    const inline = (s: string) => {
      const parts = s.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((p, k) => (p.startsWith('**') ? <b key={k}>{p.slice(2, -2)}</b> : <span key={k}>{p}</span>));
    };
    return <p key={i} className="text-sm leading-6">{inline(b)}</p>;
  });
  return <div className="space-y-2">{blocks}</div>;
}
