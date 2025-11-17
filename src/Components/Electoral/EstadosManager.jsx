/**
 * ============================================
 * COMPONENTE: Estados Manager
 * Gestión completa de Estados
 * ============================================
 */

'use client';

import React, { useState } from 'react';
import { useEstados } from '@/hooks/useElectoralData';
import Card from '../UI/Card';
import Table from '../UI/Table';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Alert from '../UI/Alert';

const EstadosManager = () => {
  const { estados, loading, error, create, update, delete: deleteEstado } = useEstados();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEstado, setEditingEstado] = useState(null);
  const [formData, setFormData] = useState({ codigo: '', nombre: '' });
  const [formError, setFormError] = useState('');
  const [alert, setAlert] = useState(null);

  const handleOpenCreate = () => {
    setEditingEstado(null);
    setFormData({ codigo: '', nombre: '' });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (estado) => {
    setEditingEstado(estado);
    setFormData({
      codigo: estado.codigo,
      nombre: estado.nombre,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingEstado(null);
    setFormData({ codigo: '', nombre: '' });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.codigo || !formData.nombre) {
      setFormError('Todos los campos son obligatorios');
      return;
    }

    try {
      let result;
      if (editingEstado) {
        result = await update(editingEstado.id, formData);
      } else {
        result = await create(formData);
      }

      if (result.success) {
        setAlert({
          type: 'success',
          message: `Estado ${editingEstado ? 'actualizado' : 'creado'} exitosamente`,
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
    if (!window.confirm('¿Estás seguro de eliminar este estado?')) return;

    const result = await deleteEstado(id);
    if (result.success) {
      setAlert({
        type: 'success',
        message: 'Estado eliminado exitosamente',
      });
    } else {
      setAlert({
        type: 'error',
        message: result.error || 'Error al eliminar',
      });
    }
  };

  const columns = [
    { key: 'codigo', label: 'Código', sortable: true },
    { key: 'nombre', label: 'Nombre', sortable: true },
    {
      key: 'created_at',
      label: 'Fecha Creación',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('es-MX'),
    },
  ];

  const actions = (estado) => (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleOpenEdit(estado)}
      >
        ✏️ Editar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleDelete(estado.id)}
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
        title="Gestión de Estados"
        subtitle="Administra los estados del sistema"
        headerAction={
          <Button onClick={handleOpenCreate}>+ Nuevo Estado</Button>
        }
      >
        {error && <Alert type="error" message={error} className="mb-4" />}

        <Table
          columns={columns}
          data={estados}
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
        title={editingEstado ? 'Editar Estado' : 'Crear Estado'}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingEstado ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}

          <Input
            label="Código"
            name="codigo"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            placeholder="Ej: MX-01"
            required
          />

          <Input
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Aguascalientes"
            required
          />
        </form>
      </Modal>
    </div>
  );
};

export default EstadosManager;
