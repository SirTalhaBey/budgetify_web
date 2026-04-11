import React from 'react';

const Logo = ({ size = 24, className = '' }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="6" y="16" width="52" height="32" rx="10" stroke="currentColor" strokeWidth="4" />
      <path d="M42 24h16v16H42a8 8 0 1 1 0-16Z" stroke="currentColor" strokeWidth="4" />
      <circle cx="47" cy="32" r="2.8" fill="currentColor" />
    </svg>
  );
};

export default Logo;
