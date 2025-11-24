import React from 'react';

const GlassCard = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div 
      className={`
        glass rounded-2xl p-6 
        ${hoverEffect ? 'glass-hover cursor-pointer' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
