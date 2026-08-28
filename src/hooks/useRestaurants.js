import { useState, useEffect } from 'react';
import { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } from '../services/api';

export function useRestaurant() {
  const [restaurants, setRestaurantsState] = useState([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState(null);
  const [restaurantAdmins, setRestaurantAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const response = await getRestaurants(0, 10);
      if (response.success) {
        const backendRest = response.data.results || response.data;
        const mapped = backendRest.map(r => ({
          _id: r._id,
          id: r.restaurantId,
          name: r.restaurantName,
          ownerName: r.ownerName,
          mobileNumber: r.phoneNumber,
          phone: r.phoneNumber,
          email: r.email,
          website: r.websiteDomain || '',
          address: r.address || '',
          city: r.city || '',
          state: r.state || '',
          country: r.country || '',
          license: r.fssaiLicense || '',
          gstin: r.gstinNumber || '',
          pan: r.panNumber || '',
          taxRate: r.taxRate || 0,
          serviceCharge: r.serviceFee || 0,
          openingTime: r.openingTime || '',
          closingTime: r.closingTime || '',
          subscriptionPlan: r.subscription?.plan?.planName || 'Standard',
          status: r.isActive ? 'Active' : 'Suspended',
          logo: r.logoUrl || '',
          banner: r.bannerUrl || '',
          startDate: r.subscription?.startDate || '',
          endDate: r.subscription?.endDate || '',
          renewalDate: r.subscription?.renewalDate || '',
          billingCycle: r.subscription?.billingCycle || 'Monthly',
          planId: r.subscription?.plan?._id || ''
        }));
        setRestaurantsState(mapped);
        if (mapped.length > 0 && !activeRestaurantId) {
          setActiveRestaurantId(mapped[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching restaurants", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const activeRestaurant = restaurants.find(r => r._id === activeRestaurantId || r.restaurantId === activeRestaurantId) || (restaurants.length > 0 ? restaurants[0] : null);

  const setRestaurants = (val) => {
    setRestaurantsState(prev => typeof val === 'function' ? val(prev) : val);
  };

  const addRestaurant = async (newRestaurant) => {
    // Real API implementation is handled in RestaurantsPage.jsx and calls fetchRestaurants on success
    await fetchRestaurants();
  };

  const updateRestaurantData = async (updatedDetails) => {
    await fetchRestaurants();
  };

  const deleteRestaurantData = async (id) => {
    await fetchRestaurants();
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
    updateRestaurant: updateRestaurantData,
    deleteRestaurant: deleteRestaurantData,
    restaurantAdmins,
    updateRestaurantAdmins,
    setRestaurants,
    fetchRestaurants,
    isLoading
  };
}
