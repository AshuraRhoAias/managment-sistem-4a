/**
 * ============================================
 * COMPONENTE: Delegaciones Manager
 * Gestión completa de Delegaciones
 * ============================================
 */

'use client';

import React, { useState } from 'react';
import { useDelegaciones, useEstados } from '@/hooks/useElectoralData';
import Card from '../UI/Card';
import Table from '../UI/Table';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Alert from '../UI/Alert';

const DelegacionesManager = ({ estadoId = null }) => {
  const { delegaciones, loading, error, create, update, delete: deleteDelegacion } = useDelegaciones(estadoId);
  const { estados } = useEstados();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDelegacion, setEditingDelegacion] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', id_estado: estadoId || '' });
  const [formError, setFormError] = useState('');
  const [alert, setAlert] = useState(null);

  const handleOpenCreate = () => {
    setEditingDelegacion(null);
    setFormData({ nombre: '', id_estado: estadoId || '' });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (delegacion) => {
    setEditingDelegacion(delegacion);
    setFormData({
      nombre: delegacion.nombre,
      id_estado: delegacion.id_estado,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingDelegacion(null);
    setFormData({ nombre: '', id_estado: estadoId || '' });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nombre || !formData.id_estado) {
      setFormError('Todos los campos son obligatorios');
      return;
    }

    try {
      let result;
      if (editingDelegacion) {
        result = await update(editingDelegacion.id, formData);
      } else {
        result = await create(formData);
      }

      if (result.success) {
        setAlert({
          type: 'success',
          message: `Delegación ${editingDelegacion ? 'actualizada' : 'creada'} exitosamente`,
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
    if (!window.confirm('¿Estás seguro de eliminar esta delegación?')) return;

    const result = await deleteDelegacion(id);
    if (result.success) {
      setAlert({
        type: 'success',
        message: 'Delegación eliminada exitosamente',
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
    {
      key: 'id_estado',
      label: 'Estado',
      render: (value) => {
        const estado = estados.find((e) => e.id === value);
        return estado ? estado.nombre : value;
      },
    },
    {
      key: 'created_at',
      label: 'Fecha Creación',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('es-MX'),
    },
  ];

  const actions = (delegacion) => (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleOpenEdit(delegacion)}
      >
        ✏️ Editar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleDelete(delegacion.id)}
      >
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
        title="Gestión de Delegaciones"
        subtitle="Administra las delegaciones del sistema"
        headerAction={
          <Button onClick={handleOpenCreate}>+ Nueva Delegación</Button>
        }
      >
        {error && <Alert type="error" message={error} className="mb-4" />}

        <Table
          columns={columns}
          data={delegaciones}
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
        title={editingDelegacion ? 'Editar Delegación' : 'Crear Delegación'}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingDelegacion ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.id_estado}
              onChange={(e) => setFormData({ ...formData, id_estado: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!!estadoId}
            >
              <option value="">Seleccionar estado</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Benito Juárez"
            required
          />
        </form>
      </Modal>
    </div>
  );
};

export default DelegacionesManager;
