import React from 'react';

export type BadgeStatus = 'success' | 'progress' | 'danger' | 'warning' | 'info' | 'draft' | string;

interface StatusBadgeProps {
  status: string;
  variant?: BadgeStatus;
  className?: string;
}

export default function StatusBadge({ status, variant, className = '' }: StatusBadgeProps) {
  const resolvedVariant = variant || status.toLowerCase();

  let colorClasses = 'text-neutral-600 dark:text-text-secondary border-neutral-200/50 dark:border-white/10';
  let gradientStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(148,163,184,.12), rgba(148,163,184,.06))',
  };

  if (resolvedVariant.includes('approved') || resolvedVariant.includes('completed')) {
    colorClasses = 'text-[#059669] dark:text-emerald-400 border-[rgba(16,185,129,0.14)] dark:border-[rgba(16,185,129,0.1)]';
    gradientStyle = {
      background: 'linear-gradient(180deg, rgba(16,185,129,.18), rgba(16,185,129,.10))',
    };
  } else if (resolvedVariant.includes('processed') || resolvedVariant.includes('success')) {
    colorClasses = 'text-[#059669] dark:text-emerald-400 border-[rgba(16,185,129,0.14)] dark:border-[rgba(16,185,129,0.1)]';
    gradientStyle = {
      background: 'linear-gradient(180deg, rgba(16,185,129,.16), rgba(16,185,129,.08))',
    };
  } else if (resolvedVariant.includes('progress') || resolvedVariant.includes('scanning') || resolvedVariant.includes('extracting') || resolvedVariant.includes('rendering')) {
    colorClasses = 'text-[#2563EB] dark:text-blue-400 border-[rgba(37,99,235,0.14)] dark:border-[rgba(37,99,235,0.1)]';
    gradientStyle = {
      background: 'linear-gradient(180deg, rgba(37,99,235,.16), rgba(37,99,235,.08))',
    };
  } else if (resolvedVariant.includes('danger') || resolvedVariant.includes('halted') || resolvedVariant.includes('failed') || resolvedVariant.includes('exception')) {
    colorClasses = 'text-[#E11D48] dark:text-rose-400 border-[rgba(244,63,94,0.14)] dark:border-[rgba(244,63,94,0.1)]';
    gradientStyle = {
      background: 'linear-gradient(180deg, rgba(244,63,94,.16), rgba(244,63,94,.08))',
    };
  } else if (resolvedVariant.includes('review')) {
    colorClasses = 'text-[#EA580C] dark:text-orange-400 border-[rgba(249,115,22,0.14)] dark:border-[rgba(249,115,22,0.1)]';
    gradientStyle = {
      background: 'linear-gradient(180deg, rgba(249,115,22,.16), rgba(249,115,22,.08))',
    };
  } else if (resolvedVariant.includes('draft') || resolvedVariant.includes('warning')) {
    colorClasses = 'text-[#D97706] dark:text-amber-400 border-[rgba(245,158,11,0.14)] dark:border-[rgba(245,158,11,0.1)]';
    gradientStyle = {
      background: 'linear-gradient(180deg, rgba(245,158,11,.16), rgba(245,158,11,.08))',
    };
  }

  return (
    <span
      className={`inline-flex items-center px-3 h-7 rounded-full text-[12px] tracking-wide font-semibold uppercase border transition-premium select-none ${colorClasses} ${className}`}
      style={gradientStyle}
    >
      {status}
    </span>
  );
}

