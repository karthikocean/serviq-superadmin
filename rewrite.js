const fs = require('fs');

const file = 'src/components/SuperAdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// The replacement logic:
// 1. Find `  return (\n    <>\n` and prepend `renderPerformanceModal`
// 2. Find `{viewingPerfRestId && (` block and replace it with `{renderPerformanceModal()}`

const renderPerfCode = `  const renderPerformanceModal = () => {
    if (!viewingPerfRestId) return null;
    const viewedRest = restaurants.find(r => r.id === viewingPerfRestId);
    if (!viewedRest) return null;

    const seedMap = {
      'R-01': { grossSales: 384200, orders: 1205, speed: '9.8 min', startersRatio: 32, mainsRatio: 48, drinksRatio: 12, dessertsRatio: 8 },
      'R-02': { grossSales: 129500, orders: 492, speed: '7.2 min', startersRatio: 18, mainsRatio: 32, drinksRatio: 44, dessertsRatio: 6 },
      'R-03': { grossSales: 592000, orders: 1845, speed: '14.5 min', startersRatio: 42, mainsRatio: 30, drinksRatio: 22, dessertsRatio: 6 },
      'R-04': { grossSales: 243100, orders: 904, speed: '11.2 min', startersRatio: 15, mainsRatio: 68, drinksRatio: 12, dessertsRatio: 5 },
      'R-05': { grossSales: 189000, orders: 742, speed: '8.5 min', startersRatio: 10, mainsRatio: 20, drinksRatio: 15, dessertsRatio: 55 },
    };
    const defaultPerf = { grossSales: 150000, orders: 500, speed: '10.0 min', startersRatio: 25, mainsRatio: 45, drinksRatio: 20, dessertsRatio: 10 };
    const perf = seedMap[viewedRest.id] || defaultPerf;

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(9, 13, 22, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px'
      }} onClick={() => setViewingPerfRestId(null)}>
        <div className="menu-edit-panel animate-fade-in" style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '36px',
          width: '90%', maxWidth: '850px', boxShadow: 'var(--shadow-lg)', position: 'relative', top: 'auto'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: 'var(--primary)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900' }}>PERFORMANCE ANALYTICS</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>{viewedRest.name} ({viewedRest.id})</h3>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem', padding: '4px' }} onClick={() => setViewingPerfRestId(null)}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Simulated Revenue</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>₹{perf.grossSales.toLocaleString()}</h3>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>↑ 14.2% MoM Growth</span>
              </div>
              <div style={{ padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Simulated Tickets</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>{perf.orders.toLocaleString()}</h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '700' }}>Average Ticket: ₹{Math.round(perf.grossSales / perf.orders)}</span>
              </div>
              <div style={{ padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>KDS Preparation Speed</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#10b981', margin: 0 }}>{perf.speed}</h3>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>Optimal Efficiency Rate</span>
              </div>
            </div>
            <div style={{ padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-main)' }}>Daily Sales Peak Velocity</h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Simulated Peak Capacity</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px', padding: '10px 0' }}>
                {[
                  { hr: '11am', val: 20 }, { hr: '1pm', val: perf.orders > 1000 ? 92 : 74, highlight: true }, { hr: '3pm', val: 40 },
                  { hr: '5pm', val: 30 }, { hr: '7pm', val: 65 }, { hr: '9pm', val: perf.orders > 1000 ? 98 : 88, highlight: true }, { hr: '11pm', val: 45 }
                ].map((bar, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45px', gap: '6px' }}>
                    <div style={{ width: '100%', height: \`\${bar.val}px\`, background: bar.highlight ? 'linear-gradient(180deg, var(--primary) 0%, var(--primary-hover) 100%)' : 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', transition: 'height 0.3s' }}></div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>{bar.hr}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
              <div style={{ padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-main)' }}>Dish Category Share</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { name: 'Starters', pct: perf.startersRatio, color: 'var(--primary)' }, { name: 'Mains', pct: perf.mainsRatio, color: '#3b82f6' },
                    { name: 'Drinks', pct: perf.drinksRatio, color: '#10b981' }, { name: 'Desserts', pct: perf.dessertsRatio, color: '#f59e0b' }
                  ].map((cat, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-main)' }}>{cat.name}</span><span style={{ color: cat.color }}>{cat.pct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: \`\${cat.pct}%\`, height: '100%', background: cat.color, borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '20px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-main)' }}>Top Performing Menu Items</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { rank: '1', name: 'Paneer Tikka', category: 'Starters', value: '430 orders', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=60&auto=format&fit=crop&q=60' },
                    { rank: '2', name: 'Chicken Biryani', category: 'Mains', value: '382 orders', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=60&auto=format&fit=crop&q=60' },
                    { rank: '3', name: 'Masala Dosa', category: 'Mains', value: '298 orders', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=60&auto=format&fit=crop&q=60' }
                  ].map((dish, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: idx < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>#{dish.rank}</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden' }}><img src={dish.image} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                        <div><span style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{dish.name}</span><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{dish.category}</span></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{dish.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button className="btn-black" style={{ padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }} onClick={() => setViewingPerfRestId(null)}>Close Analytics Deck</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
`;

content = content.replace('  return (\n    <>\n', renderPerfCode);

// Regex to replace the entire viewingPerfRestId block.
// We know it starts with \`{viewingPerfRestId && (\` and ends with \`})()\n      )}\`.
const perfModalStartIdx = content.indexOf('{viewingPerfRestId && (\\n        (() => {');
const perfModalEndIdx = content.indexOf('})()\\n      )}', perfModalStartIdx) + 14;

if (perfModalStartIdx !== -1 && perfModalEndIdx !== -1) {
  content = content.substring(0, perfModalStartIdx) + '{renderPerformanceModal()}' + content.substring(perfModalEndIdx);
  fs.writeFileSync(file, content);
  fs.writeFileSync('script_status.txt', 'SUCCESS');
} else {
  // Let's try alternative string replace
  const match1 = content.match(/\\{viewingPerfRestId && \\([\\s\\S]*?\\}\\)\\(\\)\\n\\s*\\)\\}/);
  if (match1) {
    content = content.replace(match1[0], '{renderPerformanceModal()}');
    fs.writeFileSync(file, content);
    fs.writeFileSync('script_status.txt', 'SUCCESS');
  } else {
    fs.writeFileSync('script_status.txt', 'FAILED TO FIND BLOCK');
  }
}
