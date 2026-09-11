import React from 'react';

export default function Card({ children, className = '', style = {}, onClick = null, ...props }) {
  return (
    <div
      className={`smriti-card ${className}`.trim()}
      style={style}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
