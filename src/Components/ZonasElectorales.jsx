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

// ==================== COVERAGE BAR ====================
export const CoverageBar = ({ percentage }) => {
    const css = `
    .coverage-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .coverage-bar-container {
      flex: 1;
      max-width: 120px;
      height: 8px;
      background-color: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .coverage-bar {
      height: 100%;
      background-color: #3b82f6;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .coverage-percentage {
      font-weight: 600;
      color: #374151;
      min-width: 40px;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="coverage-cell">
                <div className="coverage-bar-container">
                    <div
                        className="coverage-bar"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="coverage-percentage">{percentage}%</span>
            </div>
        </>
    );
};

// ==================== ACTION BUTTONS ====================
export const ActionButtons = ({ onEdit, onDelete }) => {
    const css = `
    .actions-cell {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      padding: 6px 8px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn.edit {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .action-btn.edit:hover {
      background-color: #bfdbfe;
    }

    .action-btn.delete {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .action-btn.delete:hover {
      background-color: #fecaca;
    }

    .action-icon {
      width: 16px;
      height: 16px;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="actions-cell">
                <button className="action-btn edit" onClick={onEdit}>
                    <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button className="action-btn delete" onClick={onDelete}>
                    <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </>
    );
};

// ==================== TABLE ====================
export const Table = ({ columns, data, onEdit, onDelete }) => {
    const css = `
    .table-container {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead {
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .data-table th {
      padding: 16px 20px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    @media (max-width: 768px) {
      .data-table th {
        padding: 12px 16px;
        font-size: 11px;
      }
    }

    .data-table tbody tr {
      border-bottom: 1px solid #f3f4f6;
      transition: background-color 0.15s ease;
    }

    .data-table tbody tr:hover {
      background-color: #f9fafb;
    }

    .data-table tbody tr:last-child {
      border-bottom: none;
    }

    .data-table td {
      padding: 16px 20px;
      font-size: 14px;
      color: #1f2937;
    }

    @media (max-width: 768px) {
      .data-table td {
        padding: 12px 16px;
        font-size: 13px;
      }
    }

    .results-footer {
      padding: 16px 20px;
      background-color: #f9fafb;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .results-footer {
        padding: 12px 16px;
        font-size: 13px;
      }
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="table-container">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {columns.map((column, index) => (
                                    <th key={index}>{column.header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {columns.map((column, colIndex) => (
                                        <td key={colIndex}>
                                            {column.render ? column.render(row, rowIndex) : row[column.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="results-footer">
                    Mostrando {data.length} de {data.length} colonias
                </div>
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
      margin-bottom: 24px;
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

// ==================== ZONAS ELECTORALES ====================
const ZonasElectorales = () => {
    const [selectedState, setSelectedState] = useState('all');
    const [selectedDelegation, setSelectedDelegation] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const colonias = [
        {
            id: 1,
            name: 'Centro',
            delegation: 'Cuauhtémoc',
            state: 'Ciudad de México',
            cp: '06500',
            families: 3,
            persons: 12,
            coverage: 54
        },
        {
            id: 2,
            name: 'Santa María la Redonda',
            delegation: 'Cuauhtémoc',
            state: 'Ciudad de México',
            cp: '06520',
            families: 2,
            persons: 5,
            coverage: 41
        },
        {
            id: 3,
            name: 'Narvarte Oriente',
            delegation: 'Benito Juárez',
            state: 'Ciudad de México',
            cp: '03023',
            families: 1,
            persons: 4,
            coverage: 20
        },
        {
            id: 4,
            name: 'Del Valle',
            delegation: 'Benito Juárez',
            state: 'Ciudad de México',
            cp: '03100',
            families: 1,
            persons: 3,
            coverage: 27
        },
        {
            id: 5,
            name: 'Las Américas',
            delegation: 'Ecatepec de Morelos',
            state: 'Estado de México',
            cp: '55070',
            families: 1,
            persons: 5,
            coverage: 35
        },
        {
            id: 6,
            name: 'Metropolitana',
            delegation: 'Nezahualcóyotl',
            state: 'Estado de México',
            cp: '57500',
            families: 1,
            persons: 3,
            coverage: 76
        },
        {
            id: 7,
            name: 'Chapultepec',
            delegation: 'Guadalajara',
            state: 'Jalisco',
            cp: '44610',
            families: 1,
            persons: 4,
            coverage: 26
        }
    ];

    const states = [...new Set(colonias.map(c => c.state))];
    const delegations = [...new Set(colonias.map(c => c.delegation))];

    const filteredColonias = colonias.filter(colonia => {
        const matchesState = selectedState === 'all' || colonia.state === selectedState;
        const matchesDelegation = selectedDelegation === 'all' || colonia.delegation === selectedDelegation;
        const matchesSearch = searchTerm === '' ||
            colonia.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            colonia.delegation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            colonia.cp.includes(searchTerm);

        return matchesState && matchesDelegation && matchesSearch;
    });

    const tableColumns = [
        { header: 'Colonia', accessor: 'name' },
        { header: 'Delegación', accessor: 'delegation' },
        { header: 'Estado', accessor: 'state' },
        { header: 'C.P.', accessor: 'cp' },
        { header: 'Familias', accessor: 'families' },
        { header: 'Personas', accessor: 'persons' },
        {
            header: 'Cobertura',
            render: (row) => <CoverageBar percentage={row.coverage} />
        },
        {
            header: 'Acciones',
            render: (row) => (
                <ActionButtons
                    onEdit={() => alert(`Editar ${row.name}`)}
                    onDelete={() => alert(`Eliminar ${row.name}`)}
                />
            )
        }
    ];

    const css = `
    .zonas-container {
      padding: 32px;
      max-width: 1600px;
      margin: 0 auto;
      background-color: #f9fafb;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    @media (max-width: 768px) {
      .zonas-container {
        padding: 16px;
      }
    }

    .filters-section {
      display: grid;
      grid-template-columns: 1fr 1fr 1.5fr;
      gap: 20px;
      margin-bottom: 32px;
    }

    @media (max-width: 1024px) {
      .filters-section {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 768px) {
      .filters-section {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="zonas-container">
                <PageHeader
                    icon={
                        <svg className="page-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    }
                    title="Zonas Electorales"
                    subtitle="Gestión de zonas electorales y colonias"
                />

                <div className="filters-section">
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
                        placeholder="Todas las delegaciones"
                    />

                    <FilterSearchInput
                        label="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Colonia..."
                    />
                </div>

                <Table
                    columns={tableColumns}
                    data={filteredColonias}
                />
            </div>
        </>
    );
};

export default ZonasElectorales;