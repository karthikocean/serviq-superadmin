import { useState, useEffect, useCallback } from 'react';
import { getRoles, createRoleAPI, updateRoleAPI, deleteRoleAPI, getModulesAPI } from '../services/api';

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRoles(1, 100);
      // Backend paginates: response.data = { results: [...], total, page, limit }
      // or response.data = [...] for non-paginated
      if (response && response.data) {
        const raw = response.data;
        const list = raw.results || raw.roles || (Array.isArray(raw) ? raw : []);
        setRoles(list);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModules = useCallback(async () => {
    try {
      const response = await getModulesAPI();
      if (response && response.data) {
        setModules(response.data.modules || response.data || []);
      } else {
        setModules(response || []);
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  }, []);

  const createRole = async (roleData) => {
    setError(null);
    try {
      const response = await createRoleAPI(roleData);
      await fetchRoles();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create role');
      throw err;
    }
  };

  const updateRole = async (id, roleData) => {
    setError(null);
    try {
      const response = await updateRoleAPI(id, roleData);
      await fetchRoles();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update role');
      throw err;
    }
  };

  const deleteRole = async (id) => {
    setError(null);
    try {
      const response = await deleteRoleAPI(id);
      await fetchRoles();
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete role');
      throw err;
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchModules();
  }, [fetchRoles, fetchModules]);

  return {
    roles,
    modules,
    loading,
    error,
    fetchRoles,
    fetchModules,
    createRole,
    updateRole,
    deleteRole
  };
}
