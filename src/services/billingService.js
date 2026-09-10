import api from './api';

export const getPaymentsAPI = async (page = 0, limit = 10, search = '', status = 'All', startDate = '', endDate = '') => {
  const cleanParams = { page, limit };
  if (search) cleanParams.search = search;
  if (status && status !== 'All') cleanParams.status = status;
  if (startDate) cleanParams.startDate = startDate;
  if (endDate) cleanParams.endDate = endDate;
  const response = await api.get('/billing/payments', {
    params: cleanParams
  });
  return response.data;
};

export const downloadReceiptAPI = async (paymentId) => {
  const response = await api.get(`/payments/${paymentId}/receipt`, {
    responseType: 'blob'
  });
  return response.data;
};
