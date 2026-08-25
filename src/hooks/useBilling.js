import { useState, useCallback } from 'react';
import { getPaymentsAPI, downloadReceiptAPI } from '../services/api';

export function useBilling() {
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInvoices = useCallback(async (page = 1, limit = 10, search = '', status = 'All') => {
    setIsLoading(true);
    try {
      const response = await getPaymentsAPI(page, limit, search, status);
      if (response.success) {
        setInvoices(response.data.results || response.data || []);
        setTotal(response.data.total || (response.data.results ? response.data.results.length : 0));
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
