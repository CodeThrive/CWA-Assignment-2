'use client';
import { useState, useEffect } from 'react';

interface Tab {
  id: number;
  label: string;
  content: string;
}

const MAX_TABS = 15;
const STORAGE_KEY = 'cwa-tabs';
const ACTIVE_KEY = 'cwa-active';

export default function TabBuilder() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, label: 'Step 1', content: '' }]);
  const [active, setActive] = useState(1);
  const [output, setOutput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: Tab[] = JSON.parse(saved);
        if (parsed.length) setTabs(parsed);
      } catch {}
    }
    const a = localStorage.getItem(ACTIVE_KEY);
    if (a) setActive(Number(a) || 1);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, String(active));
  }, [active]);

  const addTab = () => {
    if (tabs.length >= MAX_TABS) return;
    const nextId = tabs[tabs.length - 1].id + 1;
    setTabs([...tabs, { id: nextId, label: `Step ${nextId}`, content: '' }]);
    setActive(nextId);
  };

  const removeTab = (id: number) => {
    if (tabs.length <= 1) return;
    const filtered = tabs.filter(t => t.id !== id);
    setTabs(filtered);
    if (active === id && filtered.length) setActive(filtered[0].id);
  };

  const update = (id: number, key: 'label' | 'content', value: string) => {
    setTabs(tabs.map(t => (t.id === id ? { ...t, [key]: value } : t)));
  };

  const esc = (s: string) =>
    s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const generate = () => {
    const buttons = tabs
      .map(
        (t, i) =>
          `<button id="btn${i}" onclick="showTab(${i})" style="padding:4px 8px;margin:2px;border:1px solid #999;background:#f5f5f5;">${esc(
            t.label
          )}</button>`
      )
      .join('');

    const panels = tabs
      .map(
        (t, i) =>
          `<div id="tab${i}" style="display:${i === 0 ? 'block' : 'none'};border:1px solid #999;padding:10px;margin-top:4px;">${esc(
            t.content
          ).replace(/\n/g, '<br/>')}</div>`
      )
      .join('');

    const script = `
<script>
function showTab(i){
  var n=${tabs.length};
  for(var k=0;k<n;k++){
    document.getElementById('tab'+k).style.display = (k===i) ? 'block' : 'none';
  }
}
</script>`;
    const htmlDoc =
      '<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Tabs</title></head>' +
      '<body style="font-family:Arial,Helvetica,sans-serif;margin:16px;">' +
      buttons +
      panels +
      script +
      '</body></html>';

    setOutput(htmlDoc);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr 1fr',
        gap: '1rem',
        width: '100%',
        height: '100%',
        minHeight: 0,
      }}
    >
      
      <div style={{ border: '1px solid var(--border)', padding: '0.5rem', borderRadius: 4 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Tabs Headers
          <button
            onClick={addTab}
            disabled={tabs.length >= MAX_TABS}
            style={{
              padding: '0 6px',
              cursor: tabs.length >= MAX_TABS ? 'not-allowed' : 'pointer',
              background: 'var(--bg)',
              color: 'var(--fg)',
              border: '1px solid var(--border)',
              borderRadius: 3,
            }}
          >
            [+]
          </button>
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {tabs.map(tab => (
            <li key={tab.id} style={{ marginBottom: '0.5rem' }}>
              <button
                onClick={() => setActive(tab.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '4px 8px',
                  border: active === tab.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--fg)',
                  borderRadius: 3,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      
      <div style={{ border: '1px solid var(--border)', padding: '0.5rem', borderRadius: 4 }}>
        <h3>Tabs Content</h3>
        {tabs.map(tab =>
          tab.id === active ? (
            <div key={tab.id}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Label
                <input
                  type="text"
                  value={tab.label}
                  onChange={e => update(tab.id, 'label', e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '0.25rem',
                    padding: '4px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                    border: '1px solid var(--border)',
                    borderRadius: 3,
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                Content
                <textarea
                  value={tab.content}
                  onChange={e => update(tab.id, 'content', e.target.value)}
                  style={{
                    width: '100%',
                    height: 150,
                    marginTop: '0.25rem',
                    padding: '4px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                    border: '1px solid var(--border)',
                    borderRadius: 3,
                    resize: 'vertical',
                  }}
                />
              </label>
              <button
                onClick={() => removeTab(tab.id)}
                disabled={tabs.length <= 1}
                style={{
                  cursor: tabs.length <= 1 ? 'not-allowed' : 'pointer',
                  background: 'var(--bg)',
                  color: 'var(--fg)',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  padding: '4px 8px',
                }}
              >
                Remove Tab
              </button>
            </div>
          ) : null
        )}
      </div>

      
      <div style={{ border: '1px solid var(--border)', padding: '0.5rem', borderRadius: 4 }}>
        <h3>Output</h3>
        <textarea
          readOnly
          value={output}
          rows={10}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            whiteSpace: 'pre',
            overflowWrap: 'break-word',
            background: 'var(--bg)',
            color: 'var(--fg)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            padding: '4px',
          }}
        />
        <br />
        <button
          onClick={generate}
          style={{
            marginTop: '0.5rem',
            background: 'var(--bg)',
            color: 'var(--fg)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            padding: '4px 8px',
            cursor: 'pointer',
          }}
        >
          Generate Code
        </button>
      </div>
    </div>
  );
}
