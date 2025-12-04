// src/components/Common/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status, size = 'sm', className = '' }) => {
  const styles = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    active: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
    draft: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    default: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  };

  const style = styles[status?.toLowerCase()] || styles.default;
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-xs' : size === 'sm' ? 'px-2.5 py-0.5 text-sm' : 'px-3 py-1 text-base';

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClass} ${className}`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default StatusBadge;