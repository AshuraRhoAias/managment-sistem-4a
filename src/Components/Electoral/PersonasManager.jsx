/**
 * ============================================
 * COMPONENTE: Personas Manager
 * Gestión completa de Personas
 * ============================================
 */

'use client';

import React, { useState } from 'react';
import { usePersonas, useFamilias } from '@/hooks/useElectoralData';
import Card from '../UI/Card';
import Table from '../UI/Table';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Alert from '../UI/Alert';

const PersonasManager = () => {
  const { personas, loading, error, create, update, delete: deletePersona } = usePersonas();
  const { familias } = useFamilias();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    curp: '',
    telefono: '',
    edad: '',
    genero: '',
    rol_familia: '',
    id_familia: '',
    notas: '',
  });
  const [formError, setFormError] = useState('');
  const [alert, setAlert] = useState(null);

  const handleOpenCreate = () => {
    setEditingPersona(null);
    setFormData({
      nombre: '',
      curp: '',
      telefono: '',
      edad: '',
      genero: '',
      rol_familia: '',
      id_familia: '',
      notas: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (persona) => {
    setEditingPersona(persona);
    setFormData({
      nombre: persona.nombre,
      curp: persona.curp,
      telefono: persona.telefono || '',
      edad: persona.edad,
      genero: persona.genero,
      rol_familia: persona.rol_familia,
      id_familia: persona.id_familia,
      notas: persona.notas || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPersona(null);
    setFormData({
      nombre: '',
      curp: '',
      telefono: '',
      edad: '',
      genero: '',
      rol_familia: '',
      id_familia: '',
      notas: '',
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (
      !formData.nombre ||
      !formData.curp ||
      !formData.edad ||
      !formData.genero ||
      !formData.rol_familia ||
      !formData.id_familia
    ) {
      setFormError('Todos los campos obligatorios deben ser completados');
      return;
    }

    try {
      let result;
      if (editingPersona) {
        result = await update(editingPersona.id, formData);
      } else {
        result = await create(formData);
      }

      if (result.success) {
        setAlert({
          type: 'success',
          message: `Persona ${editingPersona ? 'actualizada' : 'creada'} exitosamente`,
        });
        handleCloseModal();
      } else {
        setFormError(result.error || 'Error al guardar');
      }
    } catch (err) {
      setFormError('Error de conexión');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta persona?')) return;

    const result = await deletePersona(id);
    if (result.success) {
      setAlert({
        type: 'success',
        message: 'Persona eliminada exitosamente',
      });
    } else {
      setAlert({
        type: 'error',
        message: result.error || 'Error al eliminar',
      });
    }
  };

  const columns = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'curp', label: 'CURP', sortable: true },
    { key: 'edad', label: 'Edad', sortable: true },
    { key: 'genero', label: 'Género', sortable: true },
    {
      key: 'puede_votar',
      label: 'Puede Votar',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Sí' : 'No'}
        </span>
      ),
    },
    { key: 'rol_familia', label: 'Rol', sortable: true },
  ];

  const actions = (persona) => (
    <>
      <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(persona)}>
        ✏️ Editar
      </Button>
      <Button size="sm" variant="ghost" onClick={() => handleDelete(persona.id)}>
        🗑️ Eliminar
      </Button>
    </>
  );

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <Card
        title="Gestión de Personas"
        subtitle="Administra las personas del sistema"
        headerAction={<Button onClick={handleOpenCreate}>+ Nueva Persona</Button>}
      >
        {error && <Alert type="error" message={error} className="mb-4" />}

        <Table
          columns={columns}
          data={personas}
          actions={actions}
          loading={loading}
          striped
          hoverable
          pagination
          itemsPerPage={10}
        />
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingPersona ? 'Editar Persona' : 'Crear Persona'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingPersona ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre Completo"
              name="nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: Juan Pérez García"
              required
            />

            <Input
              label="CURP"
              name="curp"
              value={formData.curp}
              onChange={(e) =>
                setFormData({ ...formData, curp: e.target.value.toUpperCase() })
              }
              placeholder="Ej: PEGJ850101HDFRNN09"
              required
              maxLength={18}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              placeholder="Ej: 5512345678"
            />

            <Input
              label="Edad"
              name="edad"
              type="number"
              value={formData.edad}
              onChange={(e) =>
                setFormData({ ...formData, edad: e.target.value })
              }
              placeholder="Ej: 25"
              required
              min="0"
              max="120"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.genero}
                onChange={(e) =>
                  setFormData({ ...formData, genero: e.target.value })
                }
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol en Familia <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.rol_familia}
                onChange={(e) =>
                  setFormData({ ...formData, rol_familia: e.target.value })
                }
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Seleccionar</option>
                <option value="Padre">Padre</option>
                <option value="Madre">Madre</option>
                <option value="Hijo">Hijo</option>
                <option value="Hija">Hija</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Familia <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.id_familia}
              onChange={(e) =>
                setFormData({ ...formData, id_familia: e.target.value })
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar familia</option>
              {familias.map((familia) => (
                <option key={familia.id} value={familia.id}>
                  {familia.nombre_familia} - {familia.direccion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
              placeholder="Notas adicionales..."
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {formData.edad >= 18 && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Esta persona puede votar (mayor de 18 años)
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default PersonasManager;
