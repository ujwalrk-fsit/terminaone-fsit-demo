import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { opportunities } from '../data/sample';
import { Card, Empty } from '../components/Shell';
import { toggle, type RootState } from '../store';

export default function Watchlist() {
  const watch = useSelector((s: RootState) => s.watch);
  const dispatch = useDispatch();
  const list = opportunities.filter((o) => watch.ids.includes(o._id));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-strong)' }}>Watchlist</h1>
      {list.length === 0 ? <Empty text="Watchlist empty. Add from any opportunity page." /> :
        <div className="grid gap-4 md:grid-cols-3">{list.map((o) => (
          <Card key={o._id}><Link to={`/opportunities/${o._id}`} className="font-bold">{o.name}</Link>
          <div className="text-xs">{o.sector} · {o.tsgPrice ? `$${o.tsgPrice}` : 'Price N/A'}</div>
          <button className="mt-1 text-xs underline" onClick={() => dispatch(toggle(o._id))}>Remove</button></Card>
        ))}</div>}
    </div>
  );
}
