/**
 * ============================================
 * COMPONENTE: Familias Manager
 * Gestión completa de Familias
 * ============================================
 */

'use client';

import React, { useState } from 'react';
import { useFamilias, useColonias } from '@/hooks/useElectoralData';
import Card from '../UI/Card';
import Table from '../UI/Table';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Alert from '../UI/Alert';

const FamiliasManager = () => {
  const { familias, loading, error, create, update, delete: deleteFamilia } = useFamilias();
  const { colonias } = useColonias();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFamilia, setEditingFamilia] = useState(null);
  const [formData, setFormData] = useState({
    nombre_familia: '',
    direccion: '',
    id_colonia: '',
    notas: '',
  });
  const [formError, setFormError] = useState('');
  const [alert, setAlert] = useState(null);

  const handleOpenCreate = () => {
    setEditingFamilia(null);
    setFormData({
      nombre_familia: '',
      direccion: '',
      id_colonia: '',
      notas: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (familia) => {
    setEditingFamilia(familia);
    setFormData({
      nombre_familia: familia.nombre_familia,
      direccion: familia.direccion,
      id_colonia: familia.id_colonia,
      notas: familia.notas || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingFamilia(null);
    setFormData({
      nombre_familia: '',
      direccion: '',
      id_colonia: '',
      notas: '',
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.nombre_familia || !formData.direccion || !formData.id_colonia) {
      setFormError('Nombre, dirección y colonia son obligatorios');
      return;
    }

    try {
      let result;
      if (editingFamilia) {
        result = await update(editingFamilia.id, formData);
      } else {
        result = await create(formData);
      }

      if (result.success) {
        setAlert({
          type: 'success',
          message: `Familia ${editingFamilia ? 'actualizada' : 'creada'} exitosamente`,
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
    if (!window.confirm('¿Estás seguro de eliminar esta familia?')) return;

    const result = await deleteFamilia(id);
    if (result.success) {
      setAlert({
        type: 'success',
        message: 'Familia eliminada exitosamente',
      });
    } else {
      setAlert({
        type: 'error',
        message: result.error || 'Error al eliminar',
      });
    }
  };

  const columns = [
    { key: 'nombre_familia', label: 'Nombre Familia', sortable: true },
    { key: 'direccion', label: 'Dirección', sortable: true },
    {
      key: 'id_colonia',
      label: 'Colonia',
      render: (value) => {
        const colonia = colonias.find((c) => c.id === value);
        return colonia ? colonia.nombre : value;
      },
    },
    {
      key: 'created_at',
      label: 'Fecha Creación',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('es-MX'),
    },
  ];

  const actions = (familia) => (
    <>
      <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(familia)}>
        ✏️ Editar
      </Button>
      <Button size="sm" variant="ghost" onClick={() => handleDelete(familia.id)}>
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
        title="Gestión de Familias"
        subtitle="Administra las familias del sistema"
        headerAction={<Button onClick={handleOpenCreate}>+ Nueva Familia</Button>}
      >
        {error && <Alert type="error" message={error} className="mb-4" />}

        <Table
          columns={columns}
          data={familias}
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
        title={editingFamilia ? 'Editar Familia' : 'Crear Familia'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingFamilia ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}

          <Input
            label="Nombre de la Familia"
            name="nombre_familia"
            value={formData.nombre_familia}
            onChange={(e) =>
              setFormData({ ...formData, nombre_familia: e.target.value })
            }
            placeholder="Ej: Familia García"
            required
          />

          <Input
            label="Dirección"
            name="direccion"
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
            placeholder="Ej: Calle 123, Casa 45"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colonia <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.id_colonia}
              onChange={(e) =>
                setFormData({ ...formData, id_colonia: e.target.value })
              }
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar colonia</option>
              {colonias.map((colonia) => (
                <option key={colonia.id} value={colonia.id}>
                  {colonia.nombre} - CP: {colonia.codigo_postal}
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
              rows={4}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FamiliasManager;
