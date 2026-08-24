import { useState, useEffect } from 'react';
import { getAddonsAPI, createAddonAPI, updateAddonAPI, deleteAddonAPI } from '../services/api';

export function useAddons() {
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAddons = async () => {
    setIsLoading(true);
    try {
      const response = await getAddonsAPI();
      if (response && response.data) {
        setAddons(response.data);
      }
    } catch (error) {
      console.error("Error fetching addons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const createAddon = async (data) => {
    const res = await createAddonAPI(data);
    await fetchAddons();
    return res;
  };

  const updateAddon = async (id, data) => {
    const res = await updateAddonAPI(id, data);
    await fetchAddons();
    return res;
  };

  const deleteAddon = async (id) => {
    const res = await deleteAddonAPI(id);
    await fetchAddons();
    return res;
  };

  return { addons, setAddons, fetchAddons, isLoading, createAddon, updateAddon, deleteAddon };
}
