import { useState, useEffect } from 'react';
import { getSubscriptionHistoryAPI, getAllSubscriptionsAPI } from '../services/api';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [viewingSubscriptionRest, setViewingSubscriptionRest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await getAllSubscriptionsAPI(1, 100);
      if (response && response.data) {
        const subsData = response.data.results || response.data;
        const mappedSubs = subsData.map(s => {
          return {
            id: s._id,
            restaurantId: s.restaurant?._id || '',
            restaurantName: s.restaurant?.restaurantName || 'Unknown',
            restaurantCode: s.restaurant?.restaurantId || '',
            restaurantLogo: s.restaurant?.restaurantLogo || '',
            planId: s.plan?._id || '',
            planName: s.plan?.planName || 'Unknown',
            billingCycle: s.billingCycle,
            startDate: s.startDate?.split('T')[0] || '',
            endDate: s.endDate?.split('T')[0] || '',
            renewalDate: s.renewalDate?.split('T')[0] || '',
            status: s.status,
            extraBranches: s.extraBranches || 0,
            paymentProof: s.latestPaymentProof || null
          };
        });
        setSubscriptions(mappedSubs);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptionHistory = async () => {
    try {
      const response = await getSubscriptionHistoryAPI(1, 100);
      if (response && response.data) {
        const historyData = response.data.results || response.data;
        const mappedHistory = historyData.map(h => {
          const shortId = h.subscription?.subscriptionId || `SUB-${h._id.toString().slice(-4).toUpperCase()}`;
          return {
            id: shortId,
            restaurantId: h.restaurant?.restaurantId || '',
            restaurantName: h.restaurant?.restaurantName || 'Unknown',
            planName: h.newPlanName || h.addonName || (h.action === "New Plan" ? h.details.replace('Assigned new plan: ', '') : h.details),
            startDate: h.subscription?.startDate?.split('T')[0] || '',
            endDate: h.subscription?.endDate?.split('T')[0] || '',
            amount: h.amountPaid || 0,
            status: h.subscription?.status || 'Active'
          };
        });
        setSubscriptionHistory(mappedHistory);
      }
    } catch (error) {
      console.error("Error fetching subscription history:", error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchSubscriptionHistory();
  }, []);

  return { subscriptions, fetchSubscriptions, subscriptionHistory, setSubscriptionHistory, viewingSubscriptionRest, setViewingSubscriptionRest, fetchSubscriptionHistory, isLoading };
}
