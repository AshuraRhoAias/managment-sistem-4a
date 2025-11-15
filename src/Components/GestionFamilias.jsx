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

// ==================== STATUS BADGE ====================
export const StatusBadge = ({ status }) => {
  const css = `
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
    }

    .status-badge.inactive {
      background-color: #f3f4f6;
      color: #6b7280;
    }

    .status-badge.active {
      background-color: #dcfce7;
      color: #166534;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <span className={`status-badge ${status === 'Activa' ? 'active' : 'inactive'}`}>
        {status}
      </span>
    </>
  );
};

// ==================== PERSON COUNT ====================
export const PersonCount = ({ count }) => {
  const css = `
    .person-count {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #3b82f6;
      font-weight: 500;
    }

    .person-icon {
      width: 18px;
      height: 18px;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="person-count">
        <svg className="person-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>{count}</span>
      </div>
    </>
  );
};

// ==================== ACTION BUTTONS FAMILIA ====================
export const ActionButtonsFamilia = ({ onView, onEdit, onDelete }) => {
  const css = `
    .actions-cell-familia {
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
    }

    @media (max-width: 768px) {
      .actions-cell-familia {
        gap: 6px;
      }
    }

    .action-btn-familia {
      padding: 6px 8px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .action-btn-familia {
        padding: 8px 10px;
      }
    }

    .action-btn-familia.view {
      background-color: #e0e7ff;
      color: #4338ca;
    }

    .action-btn-familia.view:hover {
      background-color: #c7d2fe;
    }

    .action-btn-familia.edit {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .action-btn-familia.edit:hover {
      background-color: #bfdbfe;
    }

    .action-btn-familia.delete {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .action-btn-familia.delete:hover {
      background-color: #fecaca;
    }

    .action-icon-familia {
      width: 16px;
      height: 16px;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="actions-cell-familia">
        <button className="action-btn-familia view" onClick={onView}>
          <svg className="action-icon-familia" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button className="action-btn-familia edit" onClick={onEdit}>
          <svg className="action-icon-familia" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button className="action-btn-familia delete" onClick={onDelete}>
          <svg className="action-icon-familia" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </>
  );
};

// ==================== PRIMARY BUTTON ====================
export const PrimaryButton = ({ label, icon, onClick }) => {
  const css = `
    .primary-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background-color: #1e40af;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
      white-space: nowrap;
    }

    @media (max-width: 768px) {
      .primary-button {
        width: 100%;
        justify-content: center;
        padding: 14px 24px;
      }
    }

    .primary-button:hover {
      background-color: #1e3a8a;
    }

    .primary-button-icon {
      width: 20px;
      height: 20px;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <button className="primary-button" onClick={onClick}>
        {icon}
        {label}
      </button>
    </>
  );
};

// ==================== MODAL ====================
export const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const css = `
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    @media (max-width: 768px) {
      .modal-overlay {
        padding: 0;
        align-items: flex-end;
      }
    }

    .modal-content {
      background-color: white;
      border-radius: 12px;
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
    }

    @media (max-width: 768px) {
      .modal-content {
        max-width: 100%;
        max-height: 95vh;
        border-radius: 12px 12px 0 0;
      }
    }

    .modal-header {
      background-color: #1e40af;
      color: white;
      padding: 24px 32px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    @media (max-width: 768px) {
      .modal-header {
        padding: 20px;
        border-radius: 12px 12px 0 0;
      }
    }

    .modal-title-section {
      flex: 1;
    }

    .modal-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 4px 0;
    }

    @media (max-width: 768px) {
      .modal-title {
        font-size: 20px;
      }
    }

    .modal-subtitle {
      font-size: 14px;
      opacity: 0.9;
      margin: 0;
    }

    @media (max-width: 768px) {
      .modal-subtitle {
        font-size: 13px;
      }
    }

    .modal-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .modal-close:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .modal-close-icon {
      width: 24px;
      height: 24px;
    }

    .modal-body {
      padding: 32px;
    }

    @media (max-width: 768px) {
      .modal-body {
        padding: 20px;
      }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </>
  );
};

// ==================== ADD MEMBER MODAL ====================
export const AddMemberModal = ({ onClose, onAdd }) => {
  const [newMember, setNewMember] = useState({
    name: '',
    curp: '',
    age: '',
    gender: '',
    phone: '',
    role: 'MIEMBRO'
  });

  const handleAdd = () => {
    if (!newMember.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    onAdd(newMember);
    onClose();
  };

  const css = `
    .add-member-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .add-member-modal-overlay {
        padding: 0;
        align-items: flex-end;
      }
    }

    .add-member-modal-content {
      background-color: white;
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: slideUp 0.3s ease;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .add-member-modal-content {
        max-width: 100%;
        max-height: 95vh;
        border-radius: 12px 12px 0 0;
        animation: slideFromBottom 0.3s ease;
      }

      @keyframes slideFromBottom {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }
    }

    .add-member-modal-header {
      background-color: #1e40af;
      color: white;
      padding: 24px 32px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    @media (max-width: 768px) {
      .add-member-modal-header {
        padding: 20px;
      }
    }

    .add-member-modal-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    @media (max-width: 768px) {
      .add-member-modal-title {
        font-size: 20px;
      }
    }

    .add-member-title-icon {
      width: 28px;
      height: 28px;
    }

    .add-member-modal-body {
      padding: 32px;
    }

    @media (max-width: 768px) {
      .add-member-modal-body {
        padding: 20px;
      }
    }

    .add-member-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .add-member-form-grid {
        grid-template-columns: 1fr;
      }
    }

    .add-member-helper-text {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 24px;
      font-size: 14px;
      color: #1e40af;
    }

    @media (max-width: 768px) {
      .add-member-helper-text {
        font-size: 13px;
      }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="add-member-modal-overlay" onClick={onClose}>
        <div className="add-member-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="add-member-modal-header">
            <h2 className="add-member-modal-title">
              <svg className="add-member-title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Agregar Nuevo Miembro
            </h2>
            <button className="modal-close" onClick={onClose}>
              <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="add-member-modal-body">
            <div className="add-member-helper-text">
              💡 Solo el nombre es obligatorio. Puedes completar el resto de la información después.
            </div>
            <div className="add-member-form-grid">
              <FormInput
                label="Nombre completo"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Nombre completo"
                required
              />
              <FormInput
                label="CURP"
                value={newMember.curp}
                onChange={(e) => setNewMember({ ...newMember, curp: e.target.value })}
                placeholder="CURP"
              />
              <FormInput
                label="Edad"
                type="number"
                value={newMember.age}
                onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                placeholder="Edad"
              />
              <FormInput
                label="Género"
                value={newMember.gender}
                onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                placeholder="Masculino/Femenino"
              />
              <FormInput
                label="Teléfono"
                type="tel"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                placeholder="Teléfono (opcional)"
              />
            </div>
            <FormButtons
              onCancel={onClose}
              onSave={handleAdd}
              saveLabel="Agregar Miembro"
            />
          </div>
        </div>
      </div>
    </>
  );
};

// ==================== FORM INPUT ====================
export const FormInput = ({ label, type = "text", value, onChange, placeholder, required = false }) => {
  const css = `
    .form-input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-input-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }

    .form-input-required {
      color: #ef4444;
      margin-left: 4px;
    }

    .form-input-field {
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 15px;
      color: #1f2937;
      background-color: white;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      outline: none;
    }

    .form-input-field:hover {
      border-color: #9ca3af;
    }

    .form-input-field:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input-field::placeholder {
      color: #9ca3af;
    }

    @media (max-width: 768px) {
      .form-input-field {
        font-size: 16px;
      }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="form-input-group">
        <label className="form-input-label">
          {label}
          {required && <span className="form-input-required">*</span>}
        </label>
        <input
          type={type}
          className="form-input-field"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      </div>
    </>
  );
};

// ==================== FORM BUTTONS ====================
export const FormButtons = ({ onCancel, onSave, saveLabel = "Guardar" }) => {
  const css = `
    .form-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    @media (max-width: 768px) {
      .form-buttons {
        flex-direction: column-reverse;
      }
    }

    .form-btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
      border: none;
    }

    @media (max-width: 768px) {
      .form-btn {
        width: 100%;
        padding: 14px 24px;
      }
    }

    .form-btn-cancel {
      background-color: white;
      color: #6b7280;
      border: 1px solid #d1d5db;
    }

    .form-btn-cancel:hover {
      background-color: #f9fafb;
    }

    .form-btn-save {
      background-color: #1e40af;
      color: white;
    }

    .form-btn-save:hover {
      background-color: #1e3a8a;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="form-buttons">
        <button className="form-btn form-btn-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button className="form-btn form-btn-save" onClick={onSave}>
          {saveLabel}
        </button>
      </div>
    </>
  );
};

// ==================== MEMBER FORM CARD ====================
export const MemberFormCard = ({ member, index, onChange, onRemove, isJefe }) => {
  const css = `
    .member-form-card {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      border: 1px solid #e5e7eb;
    }

    .member-form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 12px;
    }

    @media (max-width: 768px) {
      .member-form-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .member-form-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .member-remove-btn {
      padding: 6px 12px;
      background-color: #fee2e2;
      color: #991b1b;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    @media (max-width: 768px) {
      .member-remove-btn {
        width: 100%;
        padding: 10px 12px;
      }
    }

    .member-remove-btn:hover {
      background-color: #fecaca;
    }

    .member-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .member-form-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="member-form-card">
        <div className="member-form-header">
          <h4 className="member-form-title">
            {isJefe ? 'Jefe de Familia' : `Miembro ${index + 1}`}
          </h4>
          {!isJefe && (
            <button className="member-remove-btn" onClick={onRemove}>
              Eliminar
            </button>
          )}
        </div>
        <div className="member-form-grid">
          <FormInput
            label="Nombre completo"
            value={member.name}
            onChange={(e) => onChange({ ...member, name: e.target.value })}
            placeholder="Nombre completo"
            required
          />
          <FormInput
            label="CURP"
            value={member.curp}
            onChange={(e) => onChange({ ...member, curp: e.target.value })}
            placeholder="CURP"
            required
          />
          <FormInput
            label="Edad"
            type="number"
            value={member.age}
            onChange={(e) => onChange({ ...member, age: e.target.value })}
            placeholder="Edad"
            required
          />
          <FormInput
            label="Género"
            value={member.gender}
            onChange={(e) => onChange({ ...member, gender: e.target.value })}
            placeholder="Masculino/Femenino"
            required
          />
          <FormInput
            label="Teléfono"
            type="tel"
            value={member.phone}
            onChange={(e) => onChange({ ...member, phone: e.target.value })}
            placeholder="Teléfono"
          />
        </div>
      </div>
    </>
  );
};

// ==================== FAMILY EDIT MODAL ====================
export const FamilyEditModal = ({ family, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: family.name,
    address: family.address,
    delegation: family.delegation,
    colony: family.colony,
    state: family.state,
    status: family.status,
    members: [...family.members]
  });
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const handleMemberChange = (index, updatedMember) => {
    const newMembers = [...formData.members];
    newMembers[index] = updatedMember;
    setFormData({ ...formData, members: newMembers });
  };

  const handleAddMember = (newMember) => {
    // Encontrar el índice del jefe de familia
    const jefeIndex = formData.members.findIndex(m => m.role === 'JEFE DE FAMILIA');

    // Insertar el nuevo miembro después del jefe de familia
    const newMembers = [...formData.members];
    newMembers.splice(jefeIndex + 1, 0, newMember);

    setFormData({
      ...formData,
      members: newMembers
    });
  };

  const handleRemoveMember = (index) => {
    const newMembers = formData.members.filter((_, i) => i !== index);
    setFormData({ ...formData, members: newMembers });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const css = `
    .edit-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    @media (max-width: 768px) {
      .edit-form-grid {
        grid-template-columns: 1fr;
      }
    }

    .edit-members-section {
      margin-top: 32px;
    }

    .edit-members-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 12px;
    }

    @media (max-width: 768px) {
      .edit-members-header {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .edit-members-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .add-member-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 16px;
      background-color: #dbeafe;
      color: #1e40af;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    @media (max-width: 768px) {
      .add-member-btn {
        width: 100%;
        padding: 12px 16px;
      }
    }

    .add-member-btn:hover {
      background-color: #bfdbfe;
    }

    .add-member-icon {
      width: 16px;
      height: 16px;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="modal-header">
        <div className="modal-title-section">
          <h2 className="modal-title">Editar Familia {family.name}</h2>
          <p className="modal-subtitle">Modificar información de la familia</p>
        </div>
        <button className="modal-close" onClick={onClose}>
          <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="modal-body">
        <div className="edit-form-grid">
          <FormInput
            label="Nombre de familia"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Apellido familiar"
            required
          />
          <FormInput
            label="Dirección"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Dirección completa"
            required
          />
          <FormInput
            label="Estado"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="Estado"
            required
          />
          <FormInput
            label="Delegación/Alcaldía"
            value={formData.delegation}
            onChange={(e) => setFormData({ ...formData, delegation: e.target.value })}
            placeholder="Delegación"
            required
          />
          <FormInput
            label="Colonia"
            value={formData.colony}
            onChange={(e) => setFormData({ ...formData, colony: e.target.value })}
            placeholder="Colonia"
            required
          />
        </div>

        <div className="edit-members-section">
          <div className="edit-members-header">
            <h3 className="edit-members-title">Miembros de la Familia</h3>
            <button className="add-member-btn" onClick={() => setShowAddMemberModal(true)}>
              <svg className="add-member-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Miembro
            </button>
          </div>

          {formData.members.map((member, index) => (
            <MemberFormCard
              key={index}
              member={member}
              index={index}
              onChange={(updatedMember) => handleMemberChange(index, updatedMember)}
              onRemove={() => handleRemoveMember(index)}
              isJefe={member.role === 'JEFE DE FAMILIA'}
            />
          ))}
        </div>

        <FormButtons
          onCancel={onClose}
          onSave={handleSave}
          saveLabel="Guardar Cambios"
        />

        {showAddMemberModal && (
          <AddMemberModal
            onClose={() => setShowAddMemberModal(false)}
            onAdd={handleAddMember}
          />
        )}
      </div>
    </>
  );
};

// ==================== FAMILY DETAIL MODAL ====================
export const FamilyDetailModal = ({ family, onClose }) => {
  const css = `
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    @media (max-width: 768px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-value {
      font-size: 16px;
      color: #111827;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .detail-icon {
      width: 18px;
      height: 18px;
      color: #6b7280;
    }

    .members-section {
      margin-top: 32px;
    }

    .members-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 24px 0;
    }

    .member-card {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
      border: 1px solid #e5e7eb;
    }

    .member-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .member-tag {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .member-tag.jefe {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .member-tag.miembro {
      background-color: #f3f4f6;
      color: #6b7280;
    }

    .member-name {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .member-info {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .member-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 12px;
    }

    @media (max-width: 768px) {
      .member-details {
        grid-template-columns: 1fr;
      }
    }

    .member-detail-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .member-detail-label {
      font-size: 11px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
    }

    .member-detail-value {
      font-size: 14px;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .member-detail-icon {
      width: 14px;
      height: 14px;
      color: #6b7280;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="modal-header">
        <div className="modal-title-section">
          <h2 className="modal-title">Familia {family.name}</h2>
          <p className="modal-subtitle">Jefe: {family.jefe}</p>
        </div>
        <button className="modal-close" onClick={onClose}>
          <svg className="modal-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="modal-body">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Dirección</span>
            <div className="detail-value">
              <svg className="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {family.address}
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estado</span>
            <div className="detail-value">
              <StatusBadge status={family.status} />
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-label">Registro</span>
            <div className="detail-value">{family.registro}</div>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total de personas</span>
            <div className="detail-value">
              <PersonCount count={family.persons} />
            </div>
          </div>
        </div>

        <div className="members-section">
          <h3 className="members-title">Miembros de la Familia</h3>
          {family.members.map((member, index) => (
            <div key={index} className="member-card">
              <div className="member-header">
                <div>
                  <h4 className="member-name">{member.name}</h4>
                  <p className="member-info">{member.age} años · {member.gender}</p>
                </div>
                <span className={`member-tag ${member.role === 'JEFE DE FAMILIA' ? 'jefe' : 'miembro'}`}>
                  {member.role}
                </span>
              </div>
              <div className="member-details">
                <div className="member-detail-item">
                  <span className="member-detail-label">CURP</span>
                  <span className="member-detail-value">{member.curp}</span>
                </div>
                <div className="member-detail-item">
                  <span className="member-detail-label">Teléfono</span>
                  <span className="member-detail-value">
                    <svg className="member-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {member.phone}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// ==================== GESTIÓN DE FAMILIAS ====================
const GestionFamilias = () => {
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDelegation, setSelectedDelegation] = useState('all');
  const [selectedColony, setSelectedColony] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const familias = [
    {
      id: 1,
      name: 'González García',
      jefe: 'Juan González López',
      delegation: 'Cuauhtémoc',
      colony: 'Centro',
      persons: 4,
      state: 'Ciudad de México',
      status: 'Inactiva',
      address: 'Calle 5 de Mayo 123',
      registro: '2024-01-15',
      members: [
        { name: 'Juan González López', age: 45, gender: 'Masculino', role: 'JEFE DE FAMILIA', curp: 'GOLJ001', phone: '5551234567' },
        { name: 'María García Ruiz', age: 42, gender: 'Femenino', role: 'MIEMBRO', curp: 'GARM001', phone: '5551234568' },
        { name: 'Carlos González García', age: 18, gender: 'Masculino', role: 'MIEMBRO', curp: 'GOGC001', phone: '' },
        { name: 'Ana González García', age: 15, gender: 'Femenino', role: 'MIEMBRO', curp: 'GOGA001', phone: '' }
      ]
    },
    {
      id: 2,
      name: 'López Martínez',
      jefe: 'María López Mendoza',
      delegation: 'Cuauhtémoc',
      colony: 'Centro',
      persons: 3,
      state: 'Ciudad de México',
      status: 'Inactiva',
      address: 'Av. Juárez 456',
      registro: '2024-01-20',
      members: [
        { name: 'María López Mendoza', age: 38, gender: 'Femenino', role: 'JEFE DE FAMILIA', curp: 'LOMM001', phone: '5552345678' },
        { name: 'Pedro Martínez Ruiz', age: 40, gender: 'Masculino', role: 'MIEMBRO', curp: 'MARP001', phone: '5552345679' },
        { name: 'Sofía López Martínez', age: 12, gender: 'Femenino', role: 'MIEMBRO', curp: 'LOMS001', phone: '' }
      ]
    },
    {
      id: 3,
      name: 'Rodríguez Santos',
      jefe: 'Carlos Rodríguez Pérez',
      delegation: 'Cuauhtémoc',
      colony: 'Centro',
      persons: 5,
      state: 'Ciudad de México',
      status: 'Inactiva',
      address: 'Calle Madero 789',
      registro: '2024-02-01',
      members: [
        { name: 'Carlos Rodríguez Pérez', age: 50, gender: 'Masculino', role: 'JEFE DE FAMILIA', curp: 'ROPC001', phone: '5553456789' }
      ]
    },
    {
      id: 4,
      name: 'Hernández Ruiz',
      jefe: 'Ana Hernández Cruz',
      delegation: 'Cuauhtémoc',
      colony: 'Santa María la Redonda',
      persons: 2,
      state: 'Ciudad de México',
      status: 'Inactiva',
      address: 'Calle Reforma 321',
      registro: '2024-02-10',
      members: [
        { name: 'Ana Hernández Cruz', age: 35, gender: 'Femenino', role: 'JEFE DE FAMILIA', curp: 'HECA001', phone: '5554567890' }
      ]
    },
    {
      id: 5,
      name: 'Torres Jiménez',
      jefe: 'Miguel Torres Jiménez',
      delegation: 'Cuauhtémoc',
      colony: 'Santa María la Redonda',
      persons: 3,
      state: 'Ciudad de México',
      status: 'Inactiva',
      address: 'Av. Insurgentes 654',
      registro: '2024-02-15',
      members: [
        { name: 'Miguel Torres Jiménez', age: 42, gender: 'Masculino', role: 'JEFE DE FAMILIA', curp: 'TOJM001', phone: '5555678901' }
      ]
    },
    {
      id: 6,
      name: 'Díaz Álvarez',
      jefe: 'Francisco Díaz Álvarez',
      delegation: 'Benito Juárez',
      colony: 'Narvarte Oriente',
      persons: 4,
      state: 'Ciudad de México',
      status: 'Inactiva',
      address: 'Calle Monterrey 987',
      registro: '2024-03-01',
      members: [
        { name: 'Francisco Díaz Álvarez', age: 48, gender: 'Masculino', role: 'JEFE DE FAMILIA', curp: 'DIAF001', phone: '5556789012' }
      ]
    },
    {
      id: 7,
      name: 'Morales Castillo',
      jefe: 'Gabriela Morales Castillo',
      delegation: 'Benito Juárez',
      colony: 'Del Valle',
      persons: 3,
      state: 'Ciudad de México',
      status: 'Inactiva',
      address: 'Av. Universidad 147',
      registro: '2024-03-10',
      members: [
        { name: 'Gabriela Morales Castillo', age: 33, gender: 'Femenino', role: 'JEFE DE FAMILIA', curp: 'MOCG001', phone: '5557890123' }
      ]
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
      familia.jefe.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesState && matchesDelegation && matchesColony && matchesSearch;
  });

  const handleView = (familia) => {
    setSelectedFamily(familia);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (familia) => {
    setSelectedFamily(familia);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSave = (updatedFamily) => {
    console.log('Familia actualizada:', updatedFamily);
    alert('Familia guardada exitosamente');
    // Aquí iría la lógica para actualizar la familia en tu base de datos
  };

  const css = `
    .familias-container {
      padding: 32px;
      max-width: 1600px;
      margin: 0 auto;
      background-color: #f9fafb;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    @media (max-width: 768px) {
      .familias-container {
        padding: 16px;
      }
    }

    .familias-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .familias-icon {
      width: 40px;
      height: 40px;
      color: #3b82f6;
    }

    .familias-title-section {
      flex: 1;
    }

    .familias-title {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }

    @media (max-width: 768px) {
      .familias-title {
        font-size: 24px;
      }
    }

    .familias-subtitle {
      font-size: 15px;
      color: #6b7280;
      margin: 0;
    }

    @media (max-width: 768px) {
      .familias-subtitle {
        font-size: 14px;
      }
    }

    .filters-section {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1.5fr;
      gap: 20px;
      margin-bottom: 24px;
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

    .header-actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }

    @media (max-width: 768px) {
      .header-actions {
        margin-bottom: 20px;
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

    .familias-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px;
    }

    @media (max-width: 768px) {
      .familias-table {
        min-width: 1000px;
      }
    }

    .familias-table thead {
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .familias-table th {
      padding: 16px 20px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    @media (max-width: 768px) {
      .familias-table th {
        padding: 12px 16px;
        font-size: 11px;
      }
    }

    .familias-table tbody tr {
      border-bottom: 1px solid #f3f4f6;
      transition: background-color 0.15s ease;
    }

    .familias-table tbody tr:hover {
      background-color: #f9fafb;
    }

    .familias-table tbody tr:last-child {
      border-bottom: none;
    }

    .familias-table td {
      padding: 16px 20px;
      font-size: 14px;
      color: #1f2937;
    }

    @media (max-width: 768px) {
      .familias-table td {
        padding: 12px 16px;
        font-size: 13px;
      }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="familias-container">
        <div className="familias-header">
          <svg className="familias-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div className="familias-title-section">
            <h1 className="familias-title">Gestión de Familias</h1>
            <p className="familias-subtitle">Registro y administración de familias empadronadas</p>
          </div>
        </div>

        <div className="filters-section">
          <FilterSelect
            label="Estado"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            options={states}
            placeholder="Todos"
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
            placeholder="Familia, jefe..."
          />
        </div>

        <div className="header-actions">
          <PrimaryButton
            label="Nueva Familia"
            icon={
              <svg className="primary-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            onClick={() => alert('Crear nueva familia')}
          />
        </div>

        <div className="table-container">
          <div className="table-wrapper">
            <table className="familias-table">
              <thead>
                <tr>
                  <th>Familia</th>
                  <th>Jefe de Familia</th>
                  <th>Delegación</th>
                  <th>Colonia</th>
                  <th>Personas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFamilias.map((familia) => (
                  <tr key={familia.id}>
                    <td>{familia.name}</td>
                    <td>{familia.jefe}</td>
                    <td>{familia.delegation}</td>
                    <td>{familia.colony}</td>
                    <td>
                      <PersonCount count={familia.persons} />
                    </td>
                    <td>
                      <StatusBadge status={familia.status} />
                    </td>
                    <td>
                      <ActionButtonsFamilia
                        onView={() => handleView(familia)}
                        onEdit={() => handleEdit(familia)}
                        onDelete={() => alert(`Eliminar familia ${familia.name}`)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedFamily && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            {isEditMode ? (
              <FamilyEditModal
                family={selectedFamily}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
              />
            ) : (
              <FamilyDetailModal
                family={selectedFamily}
                onClose={() => setIsModalOpen(false)}
              />
            )}
          </Modal>
        )}
      </div>
    </>
  );
};

export default GestionFamilias