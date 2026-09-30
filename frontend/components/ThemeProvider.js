'use client';
import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', storedTheme);
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
