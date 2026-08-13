import { useState, useEffect } from 'react';
import { INITIAL_RESTAURANTS } from '../data/mockRestaurants';
import { INITIAL_ADMINS } from '../data/mockAdmins';

export function useRestaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState('R-01');
  const [restaurantAdmins, setRestaurantAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRestaurants(INITIAL_RESTAURANTS);
      setRestaurantAdmins(INITIAL_ADMINS);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const activeRestaurant = restaurants.find(r => r.id === activeRestaurantId) || (restaurants.length > 0 ? restaurants[0] : null);

  const addRestaurant = (newRestaurant) => {
    setRestaurants([...restaurants, newRestaurant]);
  };

  const updateRestaurant = (updatedDetails) => {
    setRestaurants(restaurants.map(r => r.id === updatedDetails.id ? updatedDetails : r));
  };

  const deleteRestaurant = (id) => {
    setRestaurants(restaurants.filter(r => r.id !== id));
  };

  const updateRestaurantAdmins = (admins) => {
    setRestaurantAdmins(admins);
  };

  return {
    restaurants,
    activeRestaurant,
    activeRestaurantId,
    setActiveRestaurantId,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    restaurantAdmins,
    updateRestaurantAdmins,
    setRestaurants,
    isLoading
  };
}
