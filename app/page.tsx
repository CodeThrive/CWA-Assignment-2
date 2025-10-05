'use client';
import TabBuilder from './components/TabBuilder';

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <h2>Welcome</h2>
      <p>Use this tool to build tabbed content. You can add up to 15 tabs and generate copy-paste-ready HTML and JS.</p>
      <div style={{ flex: 1, minHeight: 0 }}>
        <TabBuilder />
      </div>
    </div>
  );
}