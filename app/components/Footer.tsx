'use client';

export default function Footer() {
  const now = new Date();
  const dateString = now.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <footer className="text-center py-3 border-top" role="contentinfo">
      <small>© {now.getFullYear()} Faris Khalil · S22216628 · {dateString}</small>
    </footer>
  );
}