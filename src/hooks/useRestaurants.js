import { useState, useEffect } from 'react';
import { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant, getAllSubscriptionsAPI } from '../services/api';

export function useRestaurant() {
  const [restaurants, setRestaurantsState] = useState([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState(null);
  const [restaurantAdmins, setRestaurantAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const [response, subsResponse] = await Promise.all([
        getRestaurants(0, 100),
        getAllSubscriptionsAPI(0, 100).catch(() => ({ data: [] }))
      ]);

      if (response.success) {
        const backendRest = response.data.results || response.data;
        const allSubs = subsResponse?.data?.results || subsResponse?.data || [];

        const mapped = backendRest.map(r => {
          // Find matching subscription by restaurant ID or restaurant code
          const restSub = allSubs.find(s => 
            (s.restaurant?._id && String(s.restaurant._id) === String(r._id)) ||
            (s.restaurant?.restaurantId && s.restaurant.restaurantId === r.restaurantId) ||
            (s.restaurant && String(s.restaurant) === String(r._id)) ||
            (s.restaurantId && s.restaurantId === r.restaurantId)
          ) || r.subscription || r.currentSubscription || {};

          const rawStatus = (r.status || '').toLowerCase();
          let formattedStatus = 'Active';
          if (rawStatus === 'inactive' || r.isActive === false) {
            formattedStatus = 'Inactive';
          } else if (rawStatus === 'suspended') {
            formattedStatus = 'Suspended';
          } else if (r.status) {
            formattedStatus = r.status.charAt(0).toUpperCase() + r.status.slice(1).toLowerCase();
          }

          const planName = restSub.plan?.planName || restSub.planName || r.subscriptionPlan?.planName || (typeof r.subscriptionPlan === 'string' ? r.subscriptionPlan : 'Standard');
          const subStatus = restSub.status || r.subscription?.status || (r.isActive ? 'Active' : 'Inactive');
          const startDate = restSub.startDate?.split('T')[0] || r.subscription?.startDate?.split('T')[0] || '';
          const endDate = restSub.endDate?.split('T')[0] || restSub.renewalDate?.split('T')[0] || r.subscription?.endDate?.split('T')[0] || '';
          const renewalDate = restSub.renewalDate?.split('T')[0] || restSub.endDate?.split('T')[0] || r.subscription?.renewalDate?.split('T')[0] || '';
          const billingCycle = restSub.billingCycle || r.subscription?.billingCycle || 'Monthly';
          const planId = restSub.plan?._id || restSub.planId || r.subscription?.plan?._id || '';

          return {
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
            subscriptionPlan: planName,
            subscriptionStatus: subStatus,
            status: formattedStatus,
            isActive: formattedStatus === 'Active',
            logo: r.logoUrl || '',
            banner: r.bannerUrl || '',
            startDate,
            endDate,
            renewalDate,
            billingCycle,
            planId
          };
        });
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
