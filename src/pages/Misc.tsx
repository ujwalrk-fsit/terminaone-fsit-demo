import { Link } from 'react-router-dom';
import { Card } from '../components/Shell';
import { Markdown } from '../components/Markdown';
import { articles } from '../data/sample';

export function Insights() {
  const pub = articles.filter((a) => a.status === 'published');
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-strong)' }}>Insights</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {pub.map((a) => <Card key={a._id}><Link to={`/insights/${a._id}`} className="font-bold">{a.title}</Link><div className="text-xs">{a.category}</div></Card>)}
      </div>
    </div>
  );
}

export function InsightDetail({ id }: { id: string }) {
  const a = articles.find((x) => x._id === id);
  if (!a) return <div>Not found.</div>;
  return <div className="space-y-3"><h1 className="text-2xl font-extrabold">{a.title}</h1><Markdown text={a.bodyMarkdown} /></div>;
}

export function SimpleAuth({ title, text }: { title: string; text: string }) {
  return <div className="mx-auto max-w-md space-y-3"><h1 className="text-2xl font-extrabold">{title}</h1><Card><p className="text-sm">{text}</p><div className="mt-2 text-sm"><Link to="/auth/login" className="underline">Back to login</Link></div></Card></div>;
}
