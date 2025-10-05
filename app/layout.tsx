import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { ThemeProvider } from './components/ThemeContext';
import type { ReactNode } from 'react';


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="layout">
        <ThemeProvider>
          <Header />
          <main className="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}