import React, { useState } from 'react';
import ElectoralApi from '@/Utils/ElectoralDashboard/ElectoralApi';
import useApiData from '@/hooks/useApiData';
import DataState from '@/Components/DataState';

// ==================== COMPONENTES REUTILIZABLES ====================

const SearchBar = ({ placeholder }) => {
    return (
        <div style={{
            position: 'relative',
            marginBottom: '32px'
        }}>
            <svg style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: '#9ca3af',
                pointerEvents: 'none'
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
                type="text"
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: '10px 14px 10px 42px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#1f2937',
                    backgroundColor: '#f9fafb',
                    outline: 'none',
                    boxSizing: 'border-box'
                }}
            />
        </div>
    );
};

const PageTitle = ({ icon, title, subtitle }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px'
        }}>
            {icon}
            <div style={{ flex: 1 }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#111827',
                    margin: '0 0 4px 0'
                }}>{title}</h1>
                <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0
                }}>{subtitle}</p>
            </div>
        </div>
    );
};

const FilterCard = ({ children }) => {
    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px'
        }}>
            <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 20px 0'
            }}>Filtros de Reporte</h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                alignItems: 'end'
            }}>
                {children}
            </div>
        </div>
    );
};

const FilterDropdown = ({ label, value, onChange, options }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
            }}>{label}</label>
            <select
                value={value}
                onChange={onChange}
                style={{
                    padding: '10px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#1f2937',
                    backgroundColor: '#f9fafb',
                    cursor: 'pointer',
                    outline: 'none'
                }}
            >
                {options.map((opt, idx) => (
                    <option key={idx} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
};

const GenerateButton = ({ onClick, children = 'Generar Reporte' }) => {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '10px 24px',
                backgroundColor: '#1e40af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
            }}
        >
            {children}
        </button>
    );
};

const PrintButton = () => {
    const handlePrint = () => {
        // Crear un iframe oculto para imprimir solo el reporte
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';

        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow.document;
        const reportContent = document.getElementById('printable-report');

        if (reportContent) {
            iframeDoc.open();
            iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Reporte Electoral</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                padding: 20px;
                background: white;
              }
              @media print {
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            ${reportContent.innerHTML}
          </body>
        </html>
      `);
            iframeDoc.close();

            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 100);
            }, 250);
        }
    };

    return (
        <button
            onClick={handlePrint}
            style={{
                position: 'fixed',
                bottom: '32px',
                right: '32px',
                padding: '12px 24px',
                backgroundColor: '#1e40af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 1000
            }}
            className="no-print"
        >
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Reporte
        </button>
    );
};

const ReportHeader = () => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '32px 0',
            borderBottom: '2px solid #e5e7eb',
            marginBottom: '32px'
        }}>
            <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 4px 0'
            }}>Instituto Nacional Electoral</h2>
            <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: '4px 0'
            }}>Sistema de Gestión Electoral</p>
            <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                margin: '16px 0 4px 0'
            }}>Reporte Electoral - Ciudad de México</h3>
            <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: '4px 0'
            }}>Generado el {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
        </div>
    );
};

const StatCard = ({ label, value, color = 'blue' }) => {
    const colors = {
        blue: { bg: '#eff6ff', text: '#1e40af' },
        green: { bg: '#f0fdf4', text: '#15803d' },
        yellow: { bg: '#fefce8', text: '#a16207' },
        purple: { bg: '#faf5ff', text: '#7e22ce' }
    };

    return (
        <div style={{
            backgroundColor: colors[color].bg,
            border: `1px solid ${colors[color].bg}`,
            borderRadius: '8px',
            padding: '20px'
        }}>
            <p style={{
                fontSize: '13px',
                color: '#6b7280',
                margin: '0 0 8px 0'
            }}>{label}</p>
            <h3 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: colors[color].text,
                margin: 0
            }}>{value}</h3>
        </div>
    );
};

const FamilyCard = ({ family }) => {
    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px',
            pageBreakInside: 'avoid'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f3f4f6'
            }}>
                <div>
                    <h4 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 4px 0'
                    }}>Familia: {family.name}</h4>
                    <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        margin: '2px 0'
                    }}>Jefe de Familia: {family.head}</p>
                    <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        margin: '2px 0'
                    }}>Colonia: {family.colony}</p>
                </div>
                <span style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    fontWeight: '600'
                }}>{family.members.length} personas</span>
            </div>

            <div style={{
                fontSize: '13px',
                color: '#374151',
                marginBottom: '16px',
                lineHeight: '1.6'
            }}>
                <strong>Dirección Completa:</strong><br />
                {family.address}
            </div>

            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
            }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                        <th style={{
                            padding: '10px 12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#6b7280',
                            borderBottom: '1px solid #e5e7eb'
                        }}>#</th>
                        <th style={{
                            padding: '10px 12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#6b7280',
                            borderBottom: '1px solid #e5e7eb'
                        }}>Nombre</th>
                        <th style={{
                            padding: '10px 12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#6b7280',
                            borderBottom: '1px solid #e5e7eb'
                        }}>CURP</th>
                        <th style={{
                            padding: '10px 12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#6b7280',
                            borderBottom: '1px solid #e5e7eb'
                        }}>Edad</th>
                        <th style={{
                            padding: '10px 12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#6b7280',
                            borderBottom: '1px solid #e5e7eb'
                        }}>Género</th>
                        <th style={{
                            padding: '10px 12px',
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#6b7280',
                            borderBottom: '1px solid #e5e7eb'
                        }}>¿Vota?</th>
                    </tr>
                </thead>
                <tbody>
                    {family.members.map((member, idx) => (
                        <tr key={idx}>
                            <td style={{
                                padding: '10px 12px',
                                color: '#374151',
                                borderBottom: idx === family.members.length - 1 ? 'none' : '1px solid #f3f4f6'
                            }}>{idx + 1}</td>
                            <td style={{
                                padding: '10px 12px',
                                color: '#374151',
                                borderBottom: idx === family.members.length - 1 ? 'none' : '1px solid #f3f4f6'
                            }}>{member.name}</td>
                            <td style={{
                                padding: '10px 12px',
                                color: '#374151',
                                borderBottom: idx === family.members.length - 1 ? 'none' : '1px solid #f3f4f6'
                            }}>{member.curp}</td>
                            <td style={{
                                padding: '10px 12px',
                                color: '#374151',
                                borderBottom: idx === family.members.length - 1 ? 'none' : '1px solid #f3f4f6'
                            }}>{member.age}</td>
                            <td style={{
                                padding: '10px 12px',
                                color: '#374151',
                                borderBottom: idx === family.members.length - 1 ? 'none' : '1px solid #f3f4f6'
                            }}>{member.gender}</td>
                            <td style={{
                                padding: '10px 12px',
                                color: '#374151',
                                borderBottom: idx === family.members.length - 1 ? 'none' : '1px solid #f3f4f6'
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    backgroundColor: member.votes === 'Sí' ? '#d1fae5' : member.votes === 'No' ? '#fee2e2' : '#fef3c7',
                                    color: member.votes === 'Sí' ? '#065f46' : member.votes === 'No' ? '#991b1b' : '#92400e'
                                }}>
                                    {member.votes}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #f3f4f6'
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px'
                }}>
                    <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 4px 0'
                    }}>Votantes +18</p>
                    <strong style={{
                        fontSize: '18px',
                        color: '#111827'
                    }}>{family.summary.voters}</strong>
                </div>
                <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px'
                }}>
                    <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 4px 0'
                    }}>Cumplirán 18</p>
                    <strong style={{
                        fontSize: '18px',
                        color: '#111827'
                    }}>{family.summary.turning18}</strong>
                </div>
                <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px'
                }}>
                    <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: '0 0 4px 0'
                    }}>En 2 años</p>
                    <strong style={{
                        fontSize: '18px',
                        color: '#111827'
                    }}>{family.summary.in2years}</strong>
                </div>
            </div>
        </div>
    );
};

const ReportFooter = () => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '24px 0',
            marginTop: '32px',
            borderTop: '1px solid #e5e7eb',
            fontSize: '12px',
            color: '#6b7280'
        }}>
            <p style={{ margin: '4px 0' }}>Este reporte contiene información confidencial del sistema electoral.</p>
            <p style={{ margin: '4px 0' }}>Generado automáticamente - INE Sistema Electoral</p>
        </div>
    );
};

// ==================== PÁGINA PRINCIPAL ====================
const GenerarReportesPage = () => {
    const [selectedState, setSelectedState] = useState('all');
    const [selectedDelegation, setSelectedDelegation] = useState('all');
    const [selectedColony, setSelectedColony] = useState('all');
    const [showReport, setShowReport] = useState(false);
    const [report, setReport] = useState(null);
    const [generating, setGenerating] = useState(false);

    const { data: filterData, loading, error, reload } = useApiData(ElectoralApi.getReportFilters);

    const all = (label) => ({ value: 'all', label });
    const estadoOptions = [all('Todos los estados'), ...(filterData?.estados || [])];
    const delegacionOptions = [
        all('Todas las delegaciones'),
        ...(filterData?.delegaciones || []).filter(d => selectedState === 'all' || d.parent === selectedState)
    ];
    const coloniaOptions = [
        all('Todas las colonias'),
        ...(filterData?.colonias || []).filter(c => {
            if (selectedDelegation !== 'all') return c.parent === selectedDelegation;
            if (selectedState === 'all') return true;
            return delegacionOptions.some(d => d.value === c.parent);
        })
    ];

    const handleStateChange = (value) => {
        setSelectedState(value);
        setSelectedDelegation('all');
        setSelectedColony('all');
    };

    const handleDelegationChange = (value) => {
        setSelectedDelegation(value);
        setSelectedColony('all');
    };

    const handleGenerate = async () => {
        setGenerating(true);
        const result = await ElectoralApi.getReport({
            estadoId: selectedState,
            delegacionId: selectedDelegation,
            coloniaId: selectedColony
        });
        setGenerating(false);

        if (!result.success) {
            alert(result.error);
            return;
        }
        setReport(result.data);
        setShowReport(true);
    };

    const familiesData = report?.families || [];
    const totalPersons = report?.totals.persons || 0;
    const totalVoters = report?.totals.voters || 0;
    const totalTurning18 = report?.totals.turning18 || 0;
    const totalIn2Years = report?.totals.in2years || 0;

    return (
        <>
            <style>{`
        @media print {
          body {
            background-color: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

            <div style={{
                padding: '32px',
                maxWidth: '1400px',
                margin: '0 auto',
                backgroundColor: '#f9fafb',
                minHeight: '100vh',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
                <div className="no-print">
                    <SearchBar placeholder="Buscar por CURP, dirección, teléfono, nombre..." />

                    <PageTitle
                        icon={
                            <svg style={{ width: '28px', height: '28px', color: '#111827' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                        }
                        title="Generar Reportes Imprimibles"
                        subtitle="Selecciona un área para generar un reporte detallado"
                    />

                    <DataState loading={loading} error={error} onRetry={reload}>
                        <FilterCard>
                            <FilterDropdown
                                label="Estado"
                                value={selectedState}
                                onChange={(e) => handleStateChange(e.target.value)}
                                options={estadoOptions}
                            />
                            <FilterDropdown
                                label="Delegación/Alcaldía"
                                value={selectedDelegation}
                                onChange={(e) => handleDelegationChange(e.target.value)}
                                options={delegacionOptions}
                            />
                            <FilterDropdown
                                label="Colonia"
                                value={selectedColony}
                                onChange={(e) => setSelectedColony(e.target.value)}
                                options={coloniaOptions}
                            />
                            {!showReport && (
                                <GenerateButton onClick={handleGenerate}>
                                    {generating ? 'Generando...' : 'Generar Reporte'}
                                </GenerateButton>
                            )}
                        </FilterCard>
                    </DataState>
                </div>

                {showReport && (
                    <>
                        <div className="no-print" style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            <GenerateButton onClick={() => setShowReport(false)}>
                                ← Volver a Filtros
                            </GenerateButton>
                        </div>

                        <div id="printable-report">
                            <ReportHeader />

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                textAlign: 'center',
                                gap: '20px',
                                marginBottom: '32px'
                            }}>
                                <StatCard label="Total de Personas" value={totalPersons} color="blue" />
                                <StatCard label="Votantes +18 años" value={totalVoters} color="green" />
                                <StatCard label="Cumplirán 18 próx. año" value={totalTurning18} color="yellow" />
                                <StatCard label="Cumplirán 18 en 2 años" value={totalIn2Years} color="purple" />
                            </div>

                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#111827',
                                margin: '32px 0 20px 0'
                            }}>Desglose por Familias</h3>

                            {familiesData.length === 0 && (
                                <p style={{ color: '#6b7280' }}>No hay familias registradas en el área seleccionada.</p>
                            )}
                            {familiesData.map((family) => (
                                <FamilyCard key={family.id} family={family} />
                            ))}

                            <ReportFooter />
                        </div>

                        <PrintButton />
                    </>
                )}
            </div>
        </>
    );
};

export default GenerarReportesPage;