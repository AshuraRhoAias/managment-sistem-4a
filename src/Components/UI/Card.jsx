/**
 * ============================================
 * COMPONENTE REUTILIZABLE: Card
 * Tarjeta con header, footer y variantes
 * ============================================
 */

import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  variant = 'default',
  padding = 'default',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg',
    gradient: 'bg-gradient-to-br from-blue-50 to-white border border-blue-100',
    dark: 'bg-gray-800 text-white border border-gray-700',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`rounded-xl overflow-hidden ${variants[variant]} ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className={`border-b border-gray-200 ${paddings[padding]}`}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}

      <div className={paddings[padding]}>{children}</div>

      {footer && (
        <div className={`border-t border-gray-200 bg-gray-50 ${paddings[padding]}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
