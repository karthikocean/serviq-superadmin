import { useState, useCallback } from 'react';
import { getPaymentsAPI, downloadReceiptAPI } from '../services/api';

export function useBilling() {
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInvoices = useCallback(async (page = 0, limit = 10, search = '', status = 'All') => {
    setIsLoading(true);
    try {
      const response = await getPaymentsAPI(page, limit, search, status);
      if (response && (response.success || Array.isArray(response.data) || Array.isArray(response))) {
        const list = Array.isArray(response.data?.results)
          ? response.data.results
          : Array.isArray(response.data?.payments)
          ? response.data.payments
          : Array.isArray(response.data?.invoices)
          ? response.data.invoices
          : Array.isArray(response.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setInvoices(list);

        const resolvedTotal = response.pagination?.totalItems
          ?? response.data?.pagination?.totalItems
          ?? response.total
          ?? response.totalCount
          ?? response.totalItems
          ?? response.data?.total
          ?? response.data?.totalCount
          ?? response.data?.count
          ?? list.length;
        setTotal(Number(resolvedTotal) || (list.length > 0 ? list.length : 0));
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadReceipt = async (paymentId, invoiceId) => {
    try {
      const blob = await downloadReceiptAPI(paymentId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  return { invoices, setInvoices, total, isLoading, fetchInvoices, downloadReceipt };
}
