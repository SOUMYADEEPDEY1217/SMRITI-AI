import React from 'react';

export default function Badge({ label, type = 'info', className = '' }) {
  const norm = (type || 'info').toLowerCase();
  let badgeClass = 'badge-medium';

  if (norm === 'easy' || norm === 'stable' || norm === 'active' || norm === 'improving') {
    badgeClass = 'badge-easy';
  } else if (norm === 'hard' || norm === 'review needed' || norm === 'high attention') {
    badgeClass = 'badge-hard';
  } else if (norm === 'medium' || norm === 'warning') {
    badgeClass = 'badge-medium';
  } else {
    badgeClass = 'badge-all';
  }

  return (
    <span className={`badge ${badgeClass} ${className}`.trim()}>
      {label}
    </span>
  );
}
