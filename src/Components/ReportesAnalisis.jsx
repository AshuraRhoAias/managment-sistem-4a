import React, { useState } from 'react';

// ==================== FILTER SELECT ====================
export const FilterSelect = ({ label, value, onChange, options, placeholder = "Seleccionar..." }) => {
    const css = `
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .filter-select {
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 15px;
      color: #1f2937;
      background-color: white;
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      outline: none;
    }

    .filter-select:hover {
      border-color: #9ca3af;
    }

    .filter-select:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="filter-group">
                <label className="filter-label">{label}</label>
                <select
                    className="filter-select"
                    value={value}
                    onChange={onChange}
                >
                    <option value="all">{placeholder}</option>
                    {options.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                    ))}
                </select>
            </div>
        </>
    );
};

// ==================== FILTER SEARCH INPUT ====================
export const FilterSearchInput = ({ label, value, onChange, placeholder = "Buscar..." }) => {
    const css = `
    .filter-group-search {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-label-search {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .search-input-wrapper {
      position: relative;
    }

    .search-icon-filter {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af;
      pointer-events: none;
      width: 20px;
      height: 20px;
    }

    .filter-search-input {
      width: 100%;
      padding: 12px 16px 12px 48px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 15px;
      color: #1f2937;
      background-color: white;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      outline: none;
      box-sizing: border-box;
    }

    .filter-search-input:hover {
      border-color: #9ca3af;
    }

    .filter-search-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .filter-search-input::placeholder {
      color: #9ca3af;
    }

    @media (max-width: 768px) {
      .filter-search-input {
        font-size: 16px;
      }
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="filter-group-search">
                <label className="filter-label-search">{label}</label>
                <div className="search-input-wrapper">
                    <svg className="search-icon-filter" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        className="filter-search-input"
                        placeholder={placeholder}
                        value={value}
                        onChange={onChange}
                    />
                </div>
            </div>
        </>
    );
};

// ==================== STAT CARD SIMPLE ====================
export const StatCardSimple = ({ label, value }) => {
    const css = `
    .stat-card-simple {
      background-color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card-simple:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .stat-card-label {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .stat-card-value {
      font-size: 36px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    @media (max-width: 768px) {
      .stat-card-simple {
        padding: 20px;
      }

      .stat-card-value {
        font-size: 32px;
      }
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="stat-card-simple">
                <p className="stat-card-label">{label}</p>
                <h3 className="stat-card-value">{value}</h3>
            </div>
        </>
    );
};

// ==================== PAGE HEADER ====================
export const PageHeader = ({ icon, title, subtitle }) => {
    const css = `
    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }

    @media (max-width: 768px) {
      .page-header {
        margin-bottom: 24px;
      }
    }

    .page-icon {
      width: 40px;
      height: 40px;
      color: #3b82f6;
    }

    .page-title-section {
      flex: 1;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 24px;
      }
    }

    .page-subtitle {
      font-size: 15px;
      color: #6b7280;
      margin: 0;
    }

    @media (max-width: 768px) {
      .page-subtitle {
        font-size: 14px;
      }
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="page-header">
                {icon}
                <div className="page-title-section">
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle">{subtitle}</p>
                </div>
            </div>
        </>
    );
};

// ==================== REPORTES Y ANÁLISIS ====================
const ReportesAnalisis = () => {
    const [selectedState, setSelectedState] = useState('all');
    const [selectedDelegation, setSelectedDelegation] = useState('all');
    const [selectedColony, setSelectedColony] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const familias = [
        {
            id: 1,
            name: 'González García',
            state: 'Ciudad de México',
            delegation: 'Cuauhtémoc',
            colony: 'Centro',
            jefe: 'Juan González López',
            persons: 4
        },
        {
            id: 2,
            name: 'López Martínez',
            state: 'Ciudad de México',
            delegation: 'Cuauhtémoc',
            colony: 'Centro',
            jefe: 'María López Mendoza',
            persons: 3
        },
        {
            id: 3,
            name: 'Rodríguez Santos',
            state: 'Ciudad de México',
            delegation: 'Cuauhtémoc',
            colony: 'Centro',
            jefe: 'Carlos Rodríguez Pérez',
            persons: 5
        },
        {
            id: 4,
            name: 'Hernández Ruiz',
            state: 'Ciudad de México',
            delegation: 'Cuauhtémoc',
            colony: 'Santa María la Redonda',
            jefe: 'Ana Hernández Cruz',
            persons: 2
        },
        {
            id: 5,
            name: 'Torres Jiménez',
            state: 'Ciudad de México',
            delegation: 'Cuauhtémoc',
            colony: 'Santa María la Redonda',
            jefe: 'Miguel Torres Jiménez',
            persons: 3
        },
        {
            id: 6,
            name: 'Díaz Álvarez',
            state: 'Ciudad de México',
            delegation: 'Benito Juárez',
            colony: 'Narvarte Oriente',
            jefe: 'Francisco Díaz Álvarez',
            persons: 4
        },
        {
            id: 7,
            name: 'Morales Castillo',
            state: 'Ciudad de México',
            delegation: 'Benito Juárez',
            colony: 'Del Valle',
            jefe: 'Gabriela Morales Castillo',
            persons: 3
        },
        {
            id: 8,
            name: 'Ramírez Flores',
            state: 'Estado de México',
            delegation: 'Ecatepec de Morelos',
            colony: 'Las Américas',
            jefe: 'Roberto Ramírez Flores',
            persons: 5
        },
        {
            id: 9,
            name: 'Sánchez Vega',
            state: 'Estado de México',
            delegation: 'Nezahualcóyotl',
            colony: 'Metropolitana',
            jefe: 'Laura Sánchez Vega',
            persons: 3
        },
        {
            id: 10,
            name: 'Pérez Guzmán',
            state: 'Jalisco',
            delegation: 'Guadalajara',
            colony: 'Chapultepec',
            jefe: 'Alberto Pérez Guzmán',
            persons: 4
        }
    ];

    const states = [...new Set(familias.map(f => f.state))];
    const delegations = [...new Set(familias.map(f => f.delegation))];
    const colonies = [...new Set(familias.map(f => f.colony))];

    const filteredFamilias = familias.filter(familia => {
        const matchesState = selectedState === 'all' || familia.state === selectedState;
        const matchesDelegation = selectedDelegation === 'all' || familia.delegation === selectedDelegation;
        const matchesColony = selectedColony === 'all' || familia.colony === selectedColony;
        const matchesSearch = searchTerm === '' ||
            familia.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            familia.jefe.toLowerCase().includes(searchTerm.toLowerCase()) ||
            familia.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
            familia.delegation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            familia.colony.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesState && matchesDelegation && matchesColony && matchesSearch;
    });

    const totalPersonas = filteredFamilias.reduce((sum, familia) => sum + familia.persons, 0);

    // Calcular personas por género (ejemplo con datos ficticios)
    const masculino = Math.floor(totalPersonas * 0.53);
    const femenino = totalPersonas - masculino;

    const css = `
    .reportes-container {
      padding: 32px;
      max-width: 1600px;
      margin: 0 auto;
      background-color: #f9fafb;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    @media (max-width: 768px) {
      .reportes-container {
        padding: 16px;
      }
    }

    .filters-card {
      background-color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 32px;
    }

    @media (max-width: 768px) {
      .filters-card {
        padding: 20px;
        margin-bottom: 24px;
      }
    }

    .filters-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 20px 0;
    }

    @media (max-width: 768px) {
      .filters-title {
        font-size: 16px;
        margin-bottom: 16px;
      }
    }

    .filters-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1.5fr;
      gap: 20px;
    }

    @media (max-width: 1024px) {
      .filters-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 768px) {
      .filters-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        margin-bottom: 24px;
      }
    }

    .table-container {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .table-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .reportes-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 1000px;
    }

    @media (max-width: 768px) {
      .reportes-table {
        min-width: 1200px;
      }
    }

    .reportes-table thead {
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .reportes-table th {
      padding: 16px 20px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    @media (max-width: 768px) {
      .reportes-table th {
        padding: 12px 16px;
        font-size: 11px;
      }
    }

    .reportes-table tbody tr {
      border-bottom: 1px solid #f3f4f6;
      transition: background-color 0.15s ease;
    }

    .reportes-table tbody tr:hover {
      background-color: #f9fafb;
    }

    .reportes-table tbody tr:last-child {
      border-bottom: none;
    }

    .reportes-table td {
      padding: 16px 20px;
      font-size: 14px;
      color: #1f2937;
    }

    @media (max-width: 768px) {
      .reportes-table td {
        padding: 12px 16px;
        font-size: 13px;
      }
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="reportes-container">
                <PageHeader
                    icon={
                        <svg className="page-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                    title="Reportes y Análisis"
                    subtitle="Reportes estadísticos y análisis electoral"
                />

                <div className="filters-card">
                    <h3 className="filters-title">Filtros de Reporte</h3>
                    <div className="filters-grid">
                        <FilterSelect
                            label="Estado"
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            options={states}
                            placeholder="Todos los estados"
                        />

                        <FilterSelect
                            label="Delegación/Alcaldía"
                            value={selectedDelegation}
                            onChange={(e) => setSelectedDelegation(e.target.value)}
                            options={delegations}
                            placeholder="Todas"
                        />

                        <FilterSelect
                            label="Colonia"
                            value={selectedColony}
                            onChange={(e) => setSelectedColony(e.target.value)}
                            options={colonies}
                            placeholder="Todas"
                        />

                        <FilterSearchInput
                            label="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Estado, delegación, colonia, familia..."
                        />
                    </div>
                </div>

                <div className="stats-grid">
                    <StatCardSimple
                        label="Familias"
                        value={filteredFamilias.length}
                    />
                    <StatCardSimple
                        label="Total Personas"
                        value={totalPersonas}
                    />
                    <StatCardSimple
                        label="Masculino"
                        value={masculino}
                    />
                    <StatCardSimple
                        label="Femenino"
                        value={femenino}
                    />
                </div>

                <div className="table-container">
                    <div className="table-wrapper">
                        <table className="reportes-table">
                            <thead>
                                <tr>
                                    <th>Familia</th>
                                    <th>Estado</th>
                                    <th>Delegación</th>
                                    <th>Colonia</th>
                                    <th>Jefe de Familia</th>
                                    <th>Personas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFamilias.map((familia) => (
                                    <tr key={familia.id}>
                                        <td>{familia.name}</td>
                                        <td>{familia.state}</td>
                                        <td>{familia.delegation}</td>
                                        <td>{familia.colony}</td>
                                        <td>{familia.jefe}</td>
                                        <td>{familia.persons}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportesAnalisis;