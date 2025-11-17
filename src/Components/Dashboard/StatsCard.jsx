/**
 * ============================================
 * COMPONENTE: StatsCard
 * Tarjeta de estadísticas para dashboard
 * ============================================
 */

import React from 'react';
import Card from '../UI/Card';

const StatsCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  color = 'blue',
  loading = false,
}) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
