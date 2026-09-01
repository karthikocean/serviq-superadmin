import api from './api';

export const getPaymentsAPI = async (page = 0, limit = 10, search = '', status = 'All') => {
  const response = await api.get('/payments', {
    params: { page, limit, search, status }
  });
  return response.data;
};

export const downloadReceiptAPI = async (paymentId) => {
  const response = await api.get(`/payments/${paymentId}/receipt`, {
    responseType: 'blob'
  });
  return response.data;
};
