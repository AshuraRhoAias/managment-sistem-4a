/**
 * ============================================
 * CUSTOM HOOKS: Electoral Data Management
 * Hooks para manejo de datos electorales
 * ============================================
 */

import { useState, useEffect, useCallback } from 'react';
import ElectoralApi from '@/Utils/ElectoralDashboard/ElectoralApi';

/**
 * Hook para manejo de estados
 */
export function useEstados() {
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEstados = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await ElectoralApi.getAllStates();

    if (result.success) {
      setEstados(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  const createEstado = useCallback(async (estadoData) => {
    setLoading(true);
    const result = await ElectoralApi.createState(estadoData);
    setLoading(false);

    if (result.success) {
      await fetchEstados(); // Refrescar lista
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [fetchEstados]);

  const updateEstado = useCallback(async (estadoId, estadoData) => {
    setLoading(true);
    const result = await ElectoralApi.updateState(estadoId, estadoData);
    setLoading(false);

    if (result.success) {
      await fetchEstados();
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [fetchEstados]);

  const deleteEstado = useCallback(async (estadoId) => {
    setLoading(true);
    const result = await ElectoralApi.deleteState(estadoId);
    setLoading(false);

    if (result.success) {
      await fetchEstados();
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [fetchEstados]);

  useEffect(() => {
    fetchEstados();
  }, [fetchEstados]);

  return {
    estados,
    loading,
    error,
    refresh: fetchEstados,
    create: createEstado,
    update: updateEstado,
    delete: deleteEstado
  };
}

/**
 * Hook para manejo de delegaciones
 */
export function useDelegaciones(estadoId = null) {
  const [delegaciones, setDelegaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDelegaciones = useCallback(async () => {
    if (!estadoId) return;

    setLoading(true);
    setError(null);
    const result = await ElectoralApi.getDelegationsByState(estadoId);

    if (result.success) {
      setDelegaciones(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [estadoId]);

  const createDelegacion = useCallback(async (delegacionData) => {
    setLoading(true);
    const result = await ElectoralApi.createDelegation(delegacionData);
    setLoading(false);

    if (result.success) {
      await fetchDelegaciones();
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [fetchDelegaciones]);

  const updateDelegacion = useCallback(async (delegacionId, delegacionData) => {
    setLoading(true);
    const result = await ElectoralApi.updateDelegation(delegacionId, delegacionData);
    setLoading(false);

    if (result.success) {
      await fetchDelegaciones();
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [fetchDelegaciones]);

  const deleteDelegacion = useCallback(async (delegacionId) => {
    setLoading(true);
    const result = await ElectoralApi.deleteDelegation(delegacionId);
    setLoading(false);

    if (result.success) {
      await fetchDelegaciones();
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [fetchDelegaciones]);

  useEffect(() => {
    fetchDelegaciones();
  }, [fetchDelegaciones]);

  return {
    delegaciones,
    loading,
    error,
    refresh: fetchDelegaciones,
    create: createDelegacion,
    update: updateDelegacion,
    delete: deleteDelegacion
  };
}

/**
 * Hook para manejo de colonias
 */
export function useColonias(delegacionId = null) {
  const [colonias, setColonias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchColonias = useCallback(async () => {
    if (!delegacionId) return;

    setLoading(true);
    setError(null);
    const result = await ElectoralApi.getColoniesByDelegation(delegacionId);

    if (result.success) {
      setColonias(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [delegacionId]);

  const createColonia = useCallback(async (coloniaData) => {
    setLoading(true);
    const result = await ElectoralApi.createColony(coloniaData);
    setLoading(false);

    if (result.success) {
      await fetchColonias();
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [fetchColonias]);

  const updateColonia = useCallback(async (coloniaId, coloniaData) => {
    setLoading(true);
    const result = await ElectoralApi.updateColony(coloniaId, coloniaData);
    setLoading(false);

    if (result.success) {
      await fetchColonias();
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [fetchColonias]);

  const deleteColonia = useCallback(async (coloniaId) => {
    setLoading(true);
    const result = await ElectoralApi.deleteColony(coloniaId);
    setLoading(false);

    if (result.success) {
      await fetchColonias();
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [fetchColonias]);

  useEffect(() => {
    fetchColonias();
  }, [fetchColonias]);

  return {
    colonias,
    loading,
    error,
    refresh: fetchColonias,
    create: createColonia,
    update: updateColonia,
    delete: deleteColonia
  };
}

/**
 * Hook para manejo de familias
 */
export function useFamilias(filters = {}) {
  const [familias, setFamilias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFamilias = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await ElectoralApi.getAllFamilies(filters);

    if (result.success) {
      setFamilias(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [filters]);

  const getFamiliaById = useCallback(async (familiaId) => {
    setLoading(true);
    const result = await ElectoralApi.getFamilyById(familiaId);
    setLoading(false);
    return result;
  }, []);

  const createFamilia = useCallback(async (familiaData) => {
    setLoading(true);
    const result = await ElectoralApi.createFamily(familiaData);
    setLoading(false);

    if (result.success) {
      await fetchFamilias();
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [fetchFamilias]);

  const updateFamilia = useCallback(async (familiaId, familiaData) => {
    setLoading(true);
    const result = await ElectoralApi.updateFamily(familiaId, familiaData);
    setLoading(false);

    if (result.success) {
      await fetchFamilias();
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [fetchFamilias]);

  const deleteFamilia = useCallback(async (familiaId) => {
    setLoading(true);
    const result = await ElectoralApi.deleteFamily(familiaId);
    setLoading(false);

    if (result.success) {
      await fetchFamilias();
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [fetchFamilias]);

  useEffect(() => {
    fetchFamilias();
  }, [fetchFamilias]);

  return {
    familias,
    loading,
    error,
    refresh: fetchFamilias,
    getById: getFamiliaById,
    create: createFamilia,
    update: updateFamilia,
    delete: deleteFamilia
  };
}

/**
 * Hook para manejo de personas
 */
export function usePersonas(filters = {}) {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPersonas = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await ElectoralApi.getAllPersons(filters);

    if (result.success) {
      setPersonas(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [filters]);

  const getPersonaById = useCallback(async (personaId) => {
    setLoading(true);
    const result = await ElectoralApi.getPersonById(personaId);
    setLoading(false);
    return result;
  }, []);

  const searchByCurp = useCallback(async (curp) => {
    setLoading(true);
    const result = await ElectoralApi.searchByCurp(curp);
    setLoading(false);
    return result;
  }, []);

  const createPersona = useCallback(async (personaData) => {
    setLoading(true);
    const result = await ElectoralApi.createPerson(personaData);
    setLoading(false);

    if (result.success) {
      await fetchPersonas();
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [fetchPersonas]);

  const updatePersona = useCallback(async (personaId, personaData) => {
    setLoading(true);
    const result = await ElectoralApi.updatePerson(personaId, personaData);
    setLoading(false);

    if (result.success) {
      await fetchPersonas();
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [fetchPersonas]);

  const deletePersona = useCallback(async (personaId) => {
    setLoading(true);
    const result = await ElectoralApi.deletePerson(personaId);
    setLoading(false);

    if (result.success) {
      await fetchPersonas();
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [fetchPersonas]);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  return {
    personas,
    loading,
    error,
    refresh: fetchPersonas,
    getById: getPersonaById,
    searchByCurp,
    create: createPersona,
    update: updatePersona,
    delete: deletePersona
  };
}

/**
 * Hook genérico para manejo de datos con CRUD completo
 */
export function useCRUD(apiMethods) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await apiMethods.getAll();

    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [apiMethods]);

  const create = useCallback(async (itemData) => {
    setLoading(true);
    const result = await apiMethods.create(itemData);
    setLoading(false);

    if (result.success) {
      await fetchData();
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [apiMethods, fetchData]);

  const update = useCallback(async (itemId, itemData) => {
    setLoading(true);
    const result = await apiMethods.update(itemId, itemData);
    setLoading(false);

    if (result.success) {
      await fetchData();
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
  }, [apiMethods, fetchData]);

  const remove = useCallback(async (itemId) => {
    setLoading(true);
    const result = await apiMethods.delete(itemId);
    setLoading(false);

    if (result.success) {
      await fetchData();
      return { success: true };
    }
    return { success: false, error: result.error };
  }, [apiMethods, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    create,
    update,
    delete: remove
  };
}
