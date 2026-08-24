import { useState, useEffect } from 'react';
import { getPlans } from '../services/api';

export function usePlans() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await getPlans();
      if (response && response.data) {
        // Handle pagination or array response
        const fetchedPlans = response.data.results || response.data;
        // Make sure it has id and name to match existing UI
        const mappedPlans = fetchedPlans.map(p => ({
          ...p,
          id: p._id,
          name: p.planName,
        }));
        setPlans(mappedPlans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return { plans, setPlans, fetchPlans, isLoading };
}
