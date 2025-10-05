'use client';

import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeContext } from './ThemeContext';

const TITLE = 'Cloud Web App – Assignment 1';
const STUDENT_NO = 'S22216628';

export default function Header() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const pages = [
    { href: '/', label: 'Tabs' },
    { href: '/escape-room', label: 'Escape Room' },
    { href: '/coding-races', label: 'Coding Races' },
    { href: '/court-room', label: 'Court Room' },
    { href: '/about', label: 'About' },
  ];

 
  const cookieSet = (k: string, v: string) =>
    (document.cookie = `${k}=${encodeURIComponent(v)};path=/;max-age=31536000`);
  const cookieGet = (k: string) =>
    document.cookie
      .split('; ')
      .find(p => p.startsWith(k + '='))
      ?.split('=')[1];

  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (location.pathname === '/') {
      const last = cookieGet('lastPage');
      if (last && decodeURIComponent(last) !== '/') {
        router.push(decodeURIComponent(last));
      }
    }
    
  }, []);

  
  useEffect(() => {
    if (pathname) cookieSet('lastPage', pathname);
    
  }, [pathname]);

  return (
    <header>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: '0.5rem 1rem',
          }}
        >
          <span style={{ fontWeight: 600, justifySelf: 'start' }}>
            Student No: {STUDENT_NO}
          </span>
          <h1 style={{ margin: 0, justifySelf: 'center', textAlign: 'center' }}>
            {TITLE}
          </h1>
          <span style={{ justifySelf: 'end' }} /> 
        </div>

       
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.5rem 1rem',
            borderTop: '1px solid var(--border)',
          }}
        >
          <nav aria-label="Main navigation" style={{ flexGrow: 1 }}>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
              }}
            >
              {pages.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      textDecoration: 'none',
                      color: 'var(--fg)',
                      borderBottom:
                        pathname === href ? '2px solid var(--accent)' : 'none',
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <label style={{ marginRight: '1rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={() => toggleTheme()}
              style={{ marginRight: '0.25rem' }}
            />
            Dark Mode
          </label>

          <button
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobileMenu"
            onClick={() => setMenuOpen(v => !v)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                display: 'block',
                width: 20,
                height: 2,
                background: 'var(--fg)',
                margin: '4px 0',
                transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none',
                transition: 'transform 0.3s',
              }}
            />
            <span
              style={{
                display: 'block',
                width: 20,
                height: 2,
                background: 'var(--fg)',
                margin: '4px 0',
                opacity: menuOpen ? 0 : 1,
                transition: 'opacity 0.3s',
              }}
            />
            <span
              style={{
                display: 'block',
                width: 20,
                height: 2,
                background: 'var(--fg)',
                margin: '4px 0',
                transform: menuOpen ? 'rotate(-45deg) translate(6px,-6px)' : 'none',
                transition: 'transform 0.3s',
              }}
            />
          </button>
        </div>
      </div>

      
      {menuOpen && (
        <div
          id="mobileMenu"
          style={{
            borderTop: '1px solid var(--border)',
            padding: '0.5rem 1rem',
            background: 'var(--bg)',
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {pages.map(({ href, label }) => (
              <li key={href} style={{ marginBottom: '0.5rem' }}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{ textDecoration: 'none', color: 'var(--fg)' }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
