import React, { useState } from 'react';

// ==================== SEARCH BAR ====================
export const SearchBar = ({ placeholder = "Buscar...", onSearch }) => {
    const [value, setValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e) => {
        setValue(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    const css = `
    .search-container {
      position: relative;
      margin-bottom: 32px;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: box-shadow 0.2s ease;
    }

    .search-container.focused {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      pointer-events: none;
      width: 20px;
      height: 20px;
    }
    
    .search-input {
      width: 100%;
      padding: 14px 16px 14px 48px;
      border: none;
      font-size: 15px;
      outline: none;
      color: #1f2937;
      background-color: transparent;
      box-sizing: border-box;
    }
    
    .search-input::placeholder {
      color: #9ca3af;
    }
  `;

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
                />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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

    const css = `
    .stat-card {
      background-color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
      transform: translateY(0);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .stat-title {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }
    
    .stat-icon {
      color: #d1d5db;
      width: 24px;
      height: 24px;
    }
    
    .stat-value {
      font-size: 36px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
    }
    
    .stat-footer {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .stat-subtitle {
      font-size: 13px;
      color: #9ca3af;
    }
    
    .stat-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      font-weight: 500;
    }

    .stat-trend.positive {
      color: #10b981;
    }

    .stat-trend.negative {
      color: #ef4444;
    }
    
    .stat-trend-icon {
      width: 14px;
      height: 14px;
      transition: transform 0.2s ease;
    }

    .stat-trend-icon.positive {
      transform: none;
    }

    .stat-trend-icon.negative {
      transform: rotate(180deg);
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div
                className="stat-card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="stat-header">
                    <span className="stat-title">{title}</span>
                    {getIcon()}
                </div>
                <div className="stat-value">{value}</div>
                <div className="stat-footer">
                    <span className="stat-subtitle">{subtitle}</span>
                    {trend && (
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

    const css = `
    .state-card {
      background-color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
      transform: translateY(0);
    }

    .state-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .state-name {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 16px;
      margin-top: 0;
    }
    
    .state-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .state-detail {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div
                className="state-card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <h3 className="state-name">{stateName}</h3>
                <div className="state-details">
                    <p className="state-detail">{delegations} delegación/alcaldía(s)</p>
                    <p className="state-detail">{families} familia(s) · {persons} persona(s)</p>
                </div>
            </div>
        </>
    );
};

// ==================== MONTHLY SUMMARY CHART ====================
export const MonthlySummaryChart = () => {
    const [hoveredMonth, setHoveredMonth] = useState(null);

    const monthlyData = [
        { month: 'Ene', familias: 450, personas: 1200, votos: 1050 },
        { month: 'Feb', familias: 520, personas: 1380, votos: 1100 },
        { month: 'Mar', familias: 480, personas: 1300, votos: 1050 },
        { month: 'Abr', familias: 580, personas: 1650, votos: 1200 },
        { month: 'May', familias: 520, personas: 1580, votos: 1250 },
        { month: 'Jun', familias: 700, personas: 1800, votos: 1400 }
    ];

    const maxValue = 1800;
    const yAxisSteps = [0, 450, 900, 1350, 1800];

    const css = `
    .monthly-chart-container {
      background-color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .monthly-chart-title {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 24px 0;
    }

    .chart-main {
      display: flex;
      gap: 12px;
    }

    .y-axis {
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-between;
      height: 300px;
      padding-right: 12px;
      border-right: 1px solid #e5e7eb;
    }

    .y-axis-label {
      font-size: 11px;
      color: #9ca3af;
      text-align: right;
    }

    .chart-content {
      flex: 1;
      position: relative;
    }

    .chart-wrapper {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 300px;
      border-bottom: 2px solid #e5e7eb;
      position: relative;
    }

    .grid-lines {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 2px;
      pointer-events: none;
    }

    .grid-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #f3f4f6;
    }

    .month-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .bars-container {
      display: flex;
      gap: 4px;
      align-items: flex-end;
      height: 288px;
      margin-bottom: 8px;
      position: relative;
    }

    .bar {
      width: 20px;
      border-radius: 4px 4px 0 0;
      transition: opacity 0.2s ease;
      cursor: pointer;
      position: relative;
    }

    .bar.familias {
      background-color: #1e3a8a;
    }

    .bar.personas {
      background-color: #60a5fa;
    }

    .bar.votos {
      background-color: #1e40af;
    }

    .month-label {
      font-size: 13px;
      color: #6b7280;
      margin-top: 8px;
    }

    .hover-line {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
      background-color: rgba(96, 165, 250, 0.1);
      pointer-events: none;
      z-index: 0;
    }

    .tooltip {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      white-space: nowrap;
      z-index: 10;
    }

    .tooltip-title {
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .tooltip-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      font-size: 13px;
      margin-bottom: 4px;
    }

    .tooltip-label {
      font-weight: 500;
    }

    .tooltip-value {
      color: #111827;
      font-weight: 600;
    }

    .tooltip-row.familias .tooltip-label {
      color: #1e3a8a;
    }

    .tooltip-row.personas .tooltip-label {
      color: #60a5fa;
    }

    .tooltip-row.votos .tooltip-label {
      color: #1e40af;
    }

    .chart-legend {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 20px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #6b7280;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 3px;
    }

    .legend-color.familias {
      background-color: #1e3a8a;
    }

    .legend-color.personas {
      background-color: #60a5fa;
    }

    .legend-color.votos {
      background-color: #1e40af;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="monthly-chart-container">
                <h3 className="monthly-chart-title">Resumen Mensual</h3>
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
                                            style={{ height: `${(data.familias / maxValue) * 100}%` }}
                                        />
                                        <div
                                            className="bar personas"
                                            style={{ height: `${(data.personas / maxValue) * 100}%` }}
                                        />
                                        <div
                                            className="bar votos"
                                            style={{ height: `${(data.votos / maxValue) * 100}%` }}
                                        />
                                    </div>
                                    <span className="month-label">{data.month}</span>
                                    {hoveredMonth === index && (
                                        <div className="tooltip">
                                            <div className="tooltip-title">{data.month}</div>
                                            <div className="tooltip-row familias">
                                                <span className="tooltip-label">Familias :</span>
                                                <span className="tooltip-value">{data.familias}</span>
                                            </div>
                                            <div className="tooltip-row personas">
                                                <span className="tooltip-label">Personas :</span>
                                                <span className="tooltip-value">{data.personas}</span>
                                            </div>
                                            <div className="tooltip-row votos">
                                                <span className="tooltip-label">Votos :</span>
                                                <span className="tooltip-value">{data.votos}</span>
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
            </div>
        </>
    );
};

// ==================== RECENT ACTIVITY ====================
export const RecentActivity = () => {
    const activities = [
        {
            title: 'Nueva familia registrada en Zona 5',
            time: 'hace 2 horas'
        },
        {
            title: 'Actualización de datos de persona en Colonia Centro',
            time: 'hace 4 horas'
        },
        {
            title: 'Reporte generado: Estadísticas de Zona 3',
            time: 'hace 1 día'
        },
        {
            title: 'Familia eliminada de Zona 1',
            time: 'hace 2 días'
        }
    ];

    const css = `
    .activity-container {
      background-color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .activity-title {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 20px 0;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      transition: background-color 0.2s ease;
    }

    .activity-item:hover {
      background-color: #f9fafb;
    }

    .activity-icon {
      width: 20px;
      height: 20px;
      color: #6b7280;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .activity-content {
      flex: 1;
    }

    .activity-text {
      font-size: 14px;
      color: #111827;
      margin: 0 0 4px 0;
      line-height: 1.5;
    }

    .activity-time {
      font-size: 12px;
      color: #9ca3af;
      margin: 0;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="activity-container">
                <h3 className="activity-title">Actividad Reciente</h3>
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
            </div>
        </>
    );
};

// ==================== DELEGATION CARD ====================
export const DelegationCard = ({ name, colonies, families, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    const css = `
    .delegation-card {
      background-color: white;
      padding: 20px 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
      transform: translateY(0);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .delegation-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .delegation-content {
      flex: 1;
    }

    .delegation-name {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .delegation-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .delegation-detail {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .delegation-arrow {
      color: #3b82f6;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div
                className="delegation-card"
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="delegation-content">
                    <h3 className="delegation-name">{name}</h3>
                    <div className="delegation-info">
                        <p className="delegation-detail">{colonies} colonia(s)</p>
                        <p className="delegation-detail">{families} familia(s)</p>
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
export const StateDetailView = ({ stateData, onBack }) => {
    const css = `
    .back-link {
      color: #3b82f6;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: #2563eb;
    }

    .state-header {
      margin-bottom: 32px;
    }

    .state-title {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .state-subtitle {
      font-size: 15px;
      color: #6b7280;
      margin: 0;
    }

    .delegations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 16px;
      margin-top: 32px;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div>
                <a className="back-link" onClick={onBack}>
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
                    {stateData.delegations.map((delegation, index) => (
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

// ==================== DASHBOARD ====================
const ElectoralDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedState, setSelectedState] = useState(null);
    

    const stats = [
        {
            title: 'Colonias',
            value: '7',
            subtitle: 'Colonias registradas',
            trend: 5,
            iconType: 'map'
        },
        {
            title: 'Familias Registradas',
            value: '10',
            subtitle: 'Total de familias',
            trend: 42,
            iconType: 'users'
        },
        {
            title: 'Personas Empadronadas',
            value: '36',
            subtitle: 'Total de personas',
            trend: 118,
            iconType: 'usercheck'
        },
        {
            title: 'Cobertura',
            value: '89%',
            subtitle: 'Empadronamiento',
            trend: 3,
            iconType: 'chart'
        }
    ];

    const states = [
        {
            name: 'Ciudad de México',
            code: 'CDMX',
            delegations: 2,
            families: 7,
            persons: 24,
            colonies: 4,
            familiesTrend: 42,
            personsTrend: 118,
            coloniesTrend: 5,
            coverage: '89%',
            coverageTrend: 3,
            delegationsList: [
                { name: 'Cuauhtémoc', colonies: 2, families: 5 },
                { name: 'Benito Juárez', colonies: 2, families: 2 }
            ]
        },
        {
            name: 'Estado de México',
            code: 'EDOMEX',
            delegations: 2,
            families: 2,
            persons: 8,
            colonies: 2,
            familiesTrend: 20,
            personsTrend: 50,
            coloniesTrend: 2,
            coverage: '75%',
            coverageTrend: 2,
            delegationsList: [
                { name: 'Naucalpan', colonies: 1, families: 1 },
                { name: 'Tlalnepantla', colonies: 1, families: 1 }
            ]
        },
        {
            name: 'Jalisco',
            code: 'JAL',
            delegations: 1,
            families: 1,
            persons: 4,
            colonies: 1,
            familiesTrend: 10,
            personsTrend: 25,
            coloniesTrend: 1,
            coverage: '80%',
            coverageTrend: 1,
            delegationsList: [
                { name: 'Guadalajara', colonies: 1, families: 1 }
            ]
        }
    ];

    const css = `
    .dashboard-container {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
      background-color: #f9fafb;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }
    }
    
    .dashboard-header {
      margin-bottom: 32px;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        margin-bottom: 24px;
      }
    }
    
    .dashboard-title {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    @media (max-width: 768px) {
      .dashboard-title {
        font-size: 24px;
      }
    }
    
    .dashboard-subtitle {
      font-size: 15px;
      color: #6b7280;
      margin: 0;
    }

    @media (max-width: 768px) {
      .dashboard-subtitle {
        font-size: 14px;
      }
    }
    
    .dashboard-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 48px;
    }

    @media (max-width: 768px) {
      .dashboard-stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        margin-bottom: 32px;
      }
    }
    
    .dashboard-section-title {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 24px;
      margin-top: 16px;
    }

    @media (max-width: 768px) {
      .dashboard-section-title {
        font-size: 20px;
        margin-bottom: 16px;
      }
    }
    
    .dashboard-states-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
    }

    @media (max-width: 768px) {
      .dashboard-states-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .dashboard-charts-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
      margin-top: 32px;
    }

    @media (max-width: 1024px) {
      .dashboard-charts-container {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="dashboard-container">
                <SearchBar
                    placeholder="Buscar por CURP, dirección, teléfono, nombre..."
                    onSearch={setSearchTerm}
                />

                {selectedState ? (
                    <StateDetailView
                        stateData={{
                            ...selectedState,
                            delegations: selectedState.delegationsList
                        }}
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
                            {stats.map((stat, index) => (
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
                            {states.map((state, index) => (
                                <div key={index} onClick={() => setSelectedState(state)}>
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
                            <MonthlySummaryChart />
                            <RecentActivity />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ElectoralDashboard;