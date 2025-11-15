import React, { useState } from 'react';

// ==================== INPUT FIELD ====================
export const InputField = ({ label, type = "text", value, onChange, placeholder, disabled = false }) => {
    const css = `
    .input-field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .input-field-label {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .input-field-input {
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      color: #1f2937;
      background-color: ${disabled ? '#f9fafb' : '#ffffff'};
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      outline: none;
    }

    .input-field-input:hover:not(:disabled) {
      border-color: #9ca3af;
    }

    .input-field-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .input-field-input:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="input-field-group">
                <label className="input-field-label">{label}</label>
                <input
                    type={type}
                    className="input-field-input"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                />
            </div>
        </>
    );
};

// ==================== BUTTON PRIMARY ====================
export const ButtonPrimary = ({ children, onClick, disabled = false }) => {
    const css = `
    .btn-primary {
      padding: 10px 20px;
      background-color: #1e40af;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.1s ease;
      outline: none;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #1e3a8a;
    }

    .btn-primary:active:not(:disabled) {
      transform: scale(0.98);
    }

    .btn-primary:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <button className="btn-primary" onClick={onClick} disabled={disabled}>
                {children}
            </button>
        </>
    );
};

// ==================== SECTION CARD ====================
export const SectionCard = ({ icon, title, children }) => {
    const css = `
    .section-card {
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
    }

    .section-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .section-card-icon {
      width: 20px;
      height: 20px;
      color: #3b82f6;
    }

    .section-card-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="section-card">
                <div className="section-card-header">
                    {icon}
                    <h3 className="section-card-title">{title}</h3>
                </div>
                {children}
            </div>
        </>
    );
};

// ==================== OPTION BUTTON ====================
export const OptionButton = ({ children, onClick }) => {
    const css = `
    .option-btn {
      width: 100%;
      padding: 12px 16px;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      color: #374151;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s ease, border-color 0.2s ease;
      margin-bottom: 8px;
    }

    .option-btn:hover {
      background-color: #f9fafb;
      border-color: #d1d5db;
    }

    .option-btn:active {
      background-color: #f3f4f6;
    }

    .option-btn:last-child {
      margin-bottom: 0;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <button className="option-btn" onClick={onClick}>
                {children}
            </button>
        </>
    );
};

// ==================== CHECKBOX OPTION ====================
export const CheckboxOption = ({ label, checked, onChange }) => {
    const css = `
    .checkbox-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .checkbox-option:last-child {
      border-bottom: none;
    }

    .checkbox-option-label {
      font-size: 14px;
      color: #374151;
      cursor: pointer;
      user-select: none;
    }

    .checkbox-option-input {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #3b82f6;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="checkbox-option">
                <label className="checkbox-option-label" htmlFor={label}>
                    {label}
                </label>
                <input
                    type="checkbox"
                    id={label}
                    className="checkbox-option-input"
                    checked={checked}
                    onChange={onChange}
                />
            </div>
        </>
    );
};

// ==================== PAGE HEADER WITH SEARCH ====================
export const PageHeaderWithSearch = ({ icon, title, subtitle, searchPlaceholder }) => {
    const css = `
    .page-header-search {
      margin-bottom: 32px;
    }

    .search-box {
      position: relative;
      margin-bottom: 24px;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: #9ca3af;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 10px 14px 10px 42px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      color: #1f2937;
      background-color: #f9fafb;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s ease, background-color 0.2s ease;
    }

    .search-input:focus {
      background-color: white;
      border-color: #3b82f6;
    }

    .search-input::placeholder {
      color: #9ca3af;
    }

    .header-title-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      width: 24px;
      height: 24px;
      color: #3b82f6;
    }

    .header-text {
      flex: 1;
    }

    .header-title {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .header-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="page-header-search">
                <div className="search-box">
                    <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        className="search-input"
                        placeholder={searchPlaceholder}
                    />
                </div>
                <div className="header-title-section">
                    {icon}
                    <div className="header-text">
                        <h1 className="header-title">{title}</h1>
                        <p className="header-subtitle">{subtitle}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

// ==================== DEMO: PÁGINA DE CONFIGURACIÓN ====================
const ConfiguracionPage = () => {
    const [usuario, setUsuario] = useState('admin@inelectoral.mx');
    const [nombreCompleto, setNombreCompleto] = useState('Administrador Sistema Electoral');
    const [alertasRegistro, setAlertasRegistro] = useState(true);
    const [reportesSemanales, setReportesSemanales] = useState(true);
    const [actualizaciones, setActualizaciones] = useState(false);

    const css = `
    .config-container {
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      background-color: #f9fafb;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    @media (max-width: 768px) {
      .config-container {
        padding: 16px;
      }
    }
  `;

    return (
        <>
            <style>{css}</style>
            <div className="config-container">
                <PageHeaderWithSearch
                    icon={
                        <svg className="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                    title="Configuración"
                    subtitle="Gestión de preferencias y opciones del sistema"
                    searchPlaceholder="Buscar por CURP, dirección, teléfono, nombre..."
                />

                <SectionCard
                    icon={
                        <svg className="section-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                    title="Cuenta"
                >
                    <InputField
                        label="Usuario"
                        type="email"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        placeholder="correo@ejemplo.com"
                    />
                    <InputField
                        label="Nombre Completo"
                        value={nombreCompleto}
                        onChange={(e) => setNombreCompleto(e.target.value)}
                        placeholder="Tu nombre completo"
                    />
                    <ButtonPrimary onClick={() => alert('Perfil actualizado')}>
                        Actualizar Perfil
                    </ButtonPrimary>
                </SectionCard>

                <SectionCard
                    icon={
                        <svg className="section-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    }
                    title="Seguridad"
                >
                    <OptionButton onClick={() => alert('Cambiar contraseña')}>
                        Cambiar Contraseña
                    </OptionButton>
                    <OptionButton onClick={() => alert('Configurar 2FA')}>
                        Autenticación de Dos Factores
                    </OptionButton>
                    <OptionButton onClick={() => alert('Ver sesiones activas')}>
                        Sesiones Activas
                    </OptionButton>
                </SectionCard>

                <SectionCard
                    icon={
                        <svg className="section-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    }
                    title="Notificaciones"
                >
                    <CheckboxOption
                        label="Alertas de Nuevo Registro"
                        checked={alertasRegistro}
                        onChange={(e) => setAlertasRegistro(e.target.checked)}
                    />
                    <CheckboxOption
                        label="Reportes Semanales"
                        checked={reportesSemanales}
                        onChange={(e) => setReportesSemanales(e.target.checked)}
                    />
                    <CheckboxOption
                        label="Actualizaciones del Sistema"
                        checked={actualizaciones}
                        onChange={(e) => setActualizaciones(e.target.checked)}
                    />
                </SectionCard>
            </div>
        </>
    );
};

export default ConfiguracionPage;