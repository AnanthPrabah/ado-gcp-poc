import React from 'react';

export default function BatchUploadIcon({ size = 20 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-3.9-4.5C17.6 6.3 14.5 4 11 4c-3.1 0-5.7 2-6.7 4.8C2.1 9.3 1 11.3 1 13.5 1 16.5 3.5 19 6.5 19" />
      <path d="M12 10v9" />
      <path d="M9.5 12.5L12 10l2.5 2.5" />
      <path d="M7 14v5" />
      <path d="M5.5 15.5L7 14l1.5 1.5" />
      <path d="M17 14v5" />
      <path d="M15.5 15.5L17 14l1.5 1.5" />
    </svg>
  );
}
