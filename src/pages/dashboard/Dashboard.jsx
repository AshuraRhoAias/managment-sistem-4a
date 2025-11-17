import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reportsAPI } from '../../services/api';
import Button from '../../components/common/Button';

/**
 * ============================================
 * PÁGINA: DASHBOARD
 * Panel principal con estadísticas
 * ============================================
 */

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await reportsAPI.getGeneral();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-gray-600 mt-2">
          Panel de control del sistema electoral
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Estados"
          value={stats?.resumen?.total_estados || 0}
          icon="📍"
          color="blue"
        />
        <StatCard
          title="Delegaciones"
          value={stats?.resumen?.total_delegaciones || 0}
          icon="🏛️"
          color="green"
        />
        <StatCard
          title="Familias"
          value={stats?.resumen?.total_familias || 0}
          icon="👨‍👩‍👧‍👦"
          color="purple"
        />
        <StatCard
          title="Personas"
          value={stats?.resumen?.total_personas || 0}
          icon="👥"
          color="orange"
        />
      </div>

      {/* Votantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estadísticas de Votantes
          </h3>
          <div className="space-y-3">
            <StatRow
              label="Total de Votantes"
              value={stats?.votantes?.total || 0}
            />
            <StatRow
              label="Con INE Vigente"
              value={stats?.votantes?.con_ine_vigente || 0}
              valueColor="text-green-600"
            />
            <StatRow
              label="Sin INE"
              value={stats?.votantes?.sin_ine || 0}
              valueColor="text-red-600"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución por Género
          </h3>
          <div className="space-y-3">
            <StatRow
              label="Masculino"
              value={stats?.votantes?.por_genero?.M || 0}
              valueColor="text-blue-600"
            />
            <StatRow
              label="Femenino"
              value={stats?.votantes?.por_genero?.F || 0}
              valueColor="text-pink-600"
            />
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="primary" size="md">
            Nueva Persona
          </Button>
          <Button variant="success" size="md">
            Nueva Familia
          </Button>
          <Button variant="outline" size="md">
            Exportar Datos
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de tarjeta de estadística
 */
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`${colors[color]} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de fila de estadística
 */
const StatRow = ({ label, value, valueColor = 'text-gray-900' }) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-lg font-semibold ${valueColor}`}>
        {value.toLocaleString()}
      </span>
    </div>
  );
};

export default Dashboard;
