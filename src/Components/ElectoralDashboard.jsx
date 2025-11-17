import React, { useState, useEffect, useCallback } from 'react';
import { css, css2, css3, css4, css5, css6, css7, css8 } from '@/Utils/ElectoralDashboard/css'
import API from '@/Utils/ElectoralDashboard/ElectoralApi'

// ==================== LOADING SPINNER ====================
const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div style={{
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
);

// ==================== ERROR MESSAGE ====================
const ErrorMessage = ({ message, onRetry }) => (
    <div style={{
        padding: '20px',
        backgroundColor: '#fee2e2',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        margin: '20px 0',
        textAlign: 'center'
    }}>
        <p style={{ color: '#dc2626', marginBottom: '10px' }}>{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                Reintentar
            </button>
        )}
    </div>
);

// ==================== SEARCH BAR ====================
export const SearchBar = ({ placeholder = "Buscar... por curp, dirección, teléfono, nombre", onSearch, loading }) => {
    const [value, setValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e) => {
        setValue(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    return (
        <>
            <style>{css}</style>
            <div className={`search-container ${isFocused ? 'focused' : ''}`}>
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="search-input"
                    disabled={loading}
                />
                {loading && <span style={{ marginLeft: '10px' }}>Buscando...</span>}
            </div>
        </>
    );
};

// ==================== STAT CARD ====================
export const StatCard = ({ title, value, subtitle, trend, iconType }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isPositive = trend && trend > 0;

    const getIcon = () => {
        switch (iconType) {
            case 'map':
                return (
                    <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                );
            case 'users':
                return (
                    <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                );
            case 'usercheck':
                return (
                    <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'chart':
                return (
                    <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <style>{css3}</style>
            <div
                className="stat-card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="stat-header">
                    <span className="stat-title">{title}</span>
                    {getIcon()}
                </div>
                <div className="stat-value">{value || '0'}</div>
                <div className="stat-footer">
                    <span className="stat-subtitle">{subtitle}</span>
                    {trend !== undefined && trend !== null && (
                        <div className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>
                            <svg className={`stat-trend-icon ${isPositive ? 'positive' : 'negative'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span>{isPositive ? '+' : ''}{trend} este mes</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// ==================== STATE CARD ====================
export const StateCard = ({ stateName, delegations, families, persons }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <style>{css4}</style>
            <div
                className="state-card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <h3 className="state-name">{stateName}</h3>
                <div className="state-details">
                    <p className="state-detail">{delegations || 0} delegación/alcaldía(s)</p>
                    <p className="state-detail">{families || 0} familia(s) · {persons || 0} persona(s)</p>
                </div>
            </div>
        </>
    );
};

// ==================== MONTHLY SUMMARY CHART ====================
export const MonthlySummaryChart = ({ data }) => {
    const [hoveredMonth, setHoveredMonth] = useState(null);

    const monthlyData = data || [];
    const maxValue = Math.max(...monthlyData.map(d => Math.max(d.familias || 0, d.personas || 0, d.votos || 0)), 100);
    const yAxisSteps = [0, Math.round(maxValue * 0.25), Math.round(maxValue * 0.5), Math.round(maxValue * 0.75), maxValue];

    return (
        <>
            <style>{css2}</style>
            <div className="monthly-chart-container">
                <h3 className="monthly-chart-title">Resumen Mensual</h3>
                {monthlyData.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                        No hay datos disponibles
                    </div>
                ) : (
                    <>
                        <div className="chart-main">
                            <div className="y-axis">
                                {yAxisSteps.map((step, index) => (
                                    <div key={index} className="y-axis-label">{step}</div>
                                ))}
                            </div>
                            <div className="chart-content">
                                <div className="chart-wrapper">
                                    <div className="grid-lines">
                                        {yAxisSteps.map((step, index) => (
                                            <div
                                                key={index}
                                                className="grid-line"
                                                style={{ bottom: `${(step / maxValue) * 100}%` }}
                                            />
                                        ))}
                                    </div>
                                    {monthlyData.map((data, index) => (
                                        <div
                                            key={index}
                                            className="month-group"
                                            onMouseEnter={() => setHoveredMonth(index)}
                                            onMouseLeave={() => setHoveredMonth(null)}
                                        >
                                            {hoveredMonth === index && (
                                                <div className="hover-line" />
                                            )}
                                            <div className="bars-container">
                                                <div
                                                    className="bar familias"
                                                    style={{ height: `${((data.familias || 0) / maxValue) * 100}%` }}
                                                />
                                                <div
                                                    className="bar personas"
                                                    style={{ height: `${((data.personas || 0) / maxValue) * 100}%` }}
                                                />
                                                <div
                                                    className="bar votos"
                                                    style={{ height: `${((data.votos || 0) / maxValue) * 100}%` }}
                                                />
                                            </div>
                                            <span className="month-label">{data.month}</span>
                                            {hoveredMonth === index && (
                                                <div className="tooltip">
                                                    <div className="tooltip-title">{data.month}</div>
                                                    <div className="tooltip-row familias">
                                                        <span className="tooltip-label">Familias:</span>
                                                        <span className="tooltip-value">{data.familias || 0}</span>
                                                    </div>
                                                    <div className="tooltip-row personas">
                                                        <span className="tooltip-label">Personas:</span>
                                                        <span className="tooltip-value">{data.personas || 0}</span>
                                                    </div>
                                                    <div className="tooltip-row votos">
                                                        <span className="tooltip-label">Votos:</span>
                                                        <span className="tooltip-value">{data.votos || 0}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <div className="legend-color familias"></div>
                                <span>Familias</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color personas"></div>
                                <span>Personas</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color votos"></div>
                                <span>Votos</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

// ==================== RECENT ACTIVITY ====================
export const RecentActivity = ({ activities }) => {
    return (
        <>
            <style>{css5}</style>
            <div className="activity-container">
                <h3 className="activity-title">Actividad Reciente</h3>
                {!activities || activities.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                        No hay actividad reciente
                    </div>
                ) : (
                    <div className="activity-list">
                        {activities.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <svg className="activity-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                                </svg>
                                <div className="activity-content">
                                    <p className="activity-text">{activity.title}</p>
                                    <p className="activity-time">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

// ==================== DELEGATION CARD ====================
export const DelegationCard = ({ name, colonies, families, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <style>{css6}</style>
            <div
                className="delegation-card"
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="delegation-content">
                    <h3 className="delegation-name">{name}</h3>
                    <div className="delegation-info">
                        <p className="delegation-detail">{colonies || 0} colonia(s)</p>
                        <p className="delegation-detail">{families || 0} familia(s)</p>
                    </div>
                </div>
                <svg className="delegation-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </>
    );
};

// ==================== STATE DETAIL VIEW ====================
export const StateDetailView = ({ stateId, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stateData, setStateData] = useState(null);

    // Función estable para cargar datos
    const loadStateData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await API.getStateById(stateId);

            if (result.success) {
                setStateData(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError("Error al cargar datos del estado");
        } finally {
            setLoading(false); // <-- esto SIEMPRE debe ir en finally
        }
    }, [stateId]); // Dependencia correcta

    // Efecto seguro y estable
    useEffect(() => {
        loadStateData();
    }, [loadStateData]);

    // Renderizado condicional
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={loadStateData} />;
    if (!stateData) return <ErrorMessage message="No se encontraron datos del estado" />;


    return (
        <>
            <style>{css7}</style>
            <div>
                <a className="back-link" onClick={onBack} style={{ cursor: 'pointer' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver al Dashboard
                </a>

                <div className="state-header">
                    <h1 className="state-title">{stateData.name} ({stateData.code})</h1>
                    <p className="state-subtitle">Delegaciones/Alcaldías y Colonias</p>
                </div>

                <div className="dashboard-stats-grid">
                    <StatCard
                        title="Colonias"
                        value={stateData.colonies}
                        subtitle="Colonias registradas"
                        trend={stateData.coloniesTrend}
                        iconType="map"
                    />
                    <StatCard
                        title="Familias Registradas"
                        value={stateData.families}
                        subtitle="Total de familias"
                        trend={stateData.familiesTrend}
                        iconType="users"
                    />
                    <StatCard
                        title="Personas Empadronadas"
                        value={stateData.persons}
                        subtitle="Total de personas"
                        trend={stateData.personsTrend}
                        iconType="usercheck"
                    />
                    <StatCard
                        title="Cobertura"
                        value={stateData.coverage}
                        subtitle="Empadronamiento"
                        trend={stateData.coverageTrend}
                        iconType="chart"
                    />
                </div>

                <div className="delegations-grid">
                    {stateData.delegations && stateData.delegations.map((delegation, index) => (
                        <DelegationCard
                            key={index}
                            name={delegation.name}
                            colonies={delegation.colonies}
                            families={delegation.families}
                            onClick={() => alert(`Ver detalles de ${delegation.name}`)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

// ==================== DASHBOARD PRINCIPAL ====================
const ElectoralDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedState, setSelectedState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados para datos de la API
    const [stats, setStats] = useState([]);
    const [states, setStates] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [activities, setActivities] = useState([]);

    // Cargar datos iniciales
    useEffect(() => {
        loadDashboardData();
    }, []);

    // Búsqueda con debounce
    useEffect(() => {
        if (searchTerm.length >= 3) {
            const timer = setTimeout(() => {
                performSearch(searchTerm);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchTerm]);

    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Llamadas paralelas a todas las APIs
            const [statsResult, statesResult, monthlyResult, activityResult] = await Promise.all([
                API.getGeneralStats(),
                API.getAllStates(),
                API.getMonthlySummary(),
                API.getRecentActivity()
            ]);

            if (statsResult.success) setStats(statsResult.data);
            if (statesResult.success) setStates(statsResult.data);
            if (monthlyResult.success) setMonthlyData(monthlyResult.data);
            if (activityResult.success) setActivities(activityResult.data);

            // Si alguna falló, mostrar error
            if (!statsResult.success || !statesResult.success) {
                setError('Error al cargar algunos datos del dashboard');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const performSearch = async (term) => {
        setSearchLoading(true);
        const result = await API.search(term);
        setSearchLoading(false);

        if (result.success) {
            // Aquí puedes manejar los resultados de búsqueda
            // Por ejemplo, mostrar un modal o redirigir
            console.log('Resultados de búsqueda:', result.data);
        } else {
            console.error('Error en búsqueda:', result.error);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <style>{css8}</style>
            <div className="dashboard-container">
                <SearchBar
                    placeholder="Buscar por CURP, dirección, teléfono, nombre..."
                    onSearch={setSearchTerm}
                    loading={searchLoading}
                />

                {error && <ErrorMessage message={error} onRetry={loadDashboardData} />}

                {selectedState ? (
                    <StateDetailView
                        stateId={selectedState}
                        onBack={() => setSelectedState(null)}
                    />
                ) : (
                    <>
                        <div className="dashboard-header">
                            <h1 className="dashboard-title">Dashboard Electoral</h1>
                            <p className="dashboard-subtitle">
                                Sistema de Gestión Electoral por Estados, Delegaciones y Colonias
                            </p>
                        </div>

                        <div className="dashboard-stats-grid">
                            {Array.isArray(stats) && stats.map((stat, index) => (
                                <StatCard
                                    key={index}
                                    title={stat.title}
                                    value={stat.value}
                                    subtitle={stat.subtitle}
                                    trend={stat.trend}
                                    iconType={stat.iconType}
                                />
                            ))}

                        </div>

                        <h2 className="dashboard-section-title">Estados</h2>

                        <div className="dashboard-states-grid">
                            {Array.isArray(states) && states.map((state, index) => (
                                <div key={state.id || index} onClick={() => setSelectedState(state.id)}>
                                    <StateCard
                                        stateName={state.name}
                                        delegations={state.delegations}
                                        families={state.families}
                                        persons={state.persons}
                                    />
                                </div>
                            ))}
                        </div>


                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '32px' }}>
                            <MonthlySummaryChart data={monthlyData} />
                            <RecentActivity activities={activities} />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ElectoralDashboard;