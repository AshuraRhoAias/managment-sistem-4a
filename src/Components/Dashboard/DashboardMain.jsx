/**
 * ============================================
 * COMPONENTE: Dashboard Main
 * Dashboard principal con estadísticas y actividad
 * ============================================
 */

'use client';

import React, { useEffect, useState } from 'react';
import ElectoralApi from '@/Utils/ElectoralDashboard/ElectoralApi';
import StatsCard from './StatsCard';
import ActivityList from './ActivityList';
import Alert from '../UI/Alert';

const DashboardMain = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener estadísticas
      const statsResult = await ElectoralApi.getGeneralStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      } else {
        setError('Error al cargar estadísticas');
      }

      // Obtener actividad reciente
      const activityResult = await ElectoralApi.getRecentActivity();
      if (activityResult.success) {
        setActivity(activityResult.data);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} />}

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Estados"
          value={stats?.estados || 0}
          color="blue"
          loading={loading}
          icon={
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z"
                clipRule="evenodd"
              />
            </svg>
          }
        />

        <StatsCard
          title="Total Delegaciones"
          value={stats?.delegaciones || 0}
          color="green"
          loading={loading}
          icon={
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          }
        />

        <StatsCard
          title="Total Familias"
          value={stats?.familias || 0}
          color="purple"
          loading={loading}
          trend={stats?.nuevasFamilias > 0 ? 'up' : null}
          trendValue={`+${stats?.nuevasFamilias || 0} este mes`}
          icon={
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          }
        />

        <StatsCard
          title="Total Personas"
          value={stats?.personas || 0}
          color="indigo"
          loading={loading}
          trend={stats?.nuevasPersonas > 0 ? 'up' : null}
          trendValue={`+${stats?.nuevasPersonas || 0} este mes`}
          icon={
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          }
        />
      </div>

      {/* Estadísticas Secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Colonias"
          value={stats?.colonias || 0}
          color="yellow"
          loading={loading}
          icon={
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                clipRule="evenodd"
              />
            </svg>
          }
        />

        <StatsCard
          title="Votantes Potenciales"
          value={stats?.votantes || 0}
          color="green"
          loading={loading}
          icon={
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          }
        />

        <StatsCard
          title="Nuevos este Mes"
          value={`${stats?.nuevasFamilias || 0} familias`}
          color="red"
          loading={loading}
          icon={
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
          }
        />
      </div>

      {/* Actividad Reciente */}
      <ActivityList activities={activity} loading={loading} />
    </div>
  );
};

export default DashboardMain;
