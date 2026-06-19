import React from 'react';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  hasFilter?: boolean;
}

export default function PageShell({ children, className = '', hasFilter = false }: PageShellProps) {
  return (
    <main 
      className={`flex-1 transition-premium pl-[84px] pt-[76px] min-h-screen bg-bg-primary text-text-primary ${
        hasFilter ? 'pl-[320px]' : ''
      } ${className}`}
    >
      {children}
    </main>
  );
}
