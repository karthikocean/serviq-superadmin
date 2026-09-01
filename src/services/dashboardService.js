import api from './api';

export const getDashboardMetricsApi = async () => {
  try {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
};

export const getReportsAnalyticsApi = async () => {
  try {
    const response = await api.get('/dashboard/reports-analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching reports analytics:', error);
    throw error;
  }
};

