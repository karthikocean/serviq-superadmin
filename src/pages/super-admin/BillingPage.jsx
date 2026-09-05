import React, { useState, useEffect } from 'react'
import {
  Plus,
  FileText,
  FileSpreadsheet,
  RefreshCw,
  AlertTriangle,
  X
} from 'lucide-react'
import CustomSelect, { ValidatedSelect } from '../../components/common/CustomSelect'
import { formatDate } from '../../utils/dateFormat'

const ValidatedInput = ({ label, type = 'text', value, onChange, placeholder, required, error, setError, ...rest }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          onChange(e)
          if (error && setError) setError('')
        }}
        required={required}
        style={{
          width: '100%',
          padding: '9px 12px',
          border: `1.5px solid ${error ? '#ef4444' : 'var(--border-color)'}`,
          background: error ? 'rgba(239,68,68,0.04)' : 'var(--bg-app)',
          color: 'var(--text-main)',
          borderRadius: '8px',
          fontSize: '0.82rem',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s'
        }}
        {...rest}
      />
    </div>
    {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{error}</span>}
  </div>
)



import { useSearchParams } from 'react-router-dom'
import { useRestaurant } from '../../hooks/useRestaurants'
import { usePlans } from '../../hooks/usePlans'
import { useBilling } from '../../hooks/useBilling'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { TableTopControls, TableBottomPagination } from '../../components/common/TablePagination'

export default function BillingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { restaurants } = useRestaurant()
  const { plans } = usePlans()
  const { invoices, fetchInvoices, downloadReceipt, total } = useBilling()
  const { showToast } = useNotification()
  const { hasPermission, isSuperOwner } = useAuth()

  const canView = isSuperOwner || hasPermission('billing', 'view')

  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(0)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  useEffect(() => {
    fetchInvoices(currentPage, entriesPerPage, invoiceSearchQuery, invoiceStatusFilter)
  }, [currentPage, entriesPerPage, invoiceSearchQuery, invoiceStatusFilter, fetchInvoices])

  return (
    <>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card animate-fade-in" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ padding: '20px 20px 10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900' }}>Revenue & Billing Ledger</h3>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '140px' }}>
                  <CustomSelect
                    options={['All', 'Paid', 'Pending', 'Failed', 'Refunded'].map(s => ({ value: s, label: s === 'All' ? 'All Statuses' : s }))}
                    value={invoiceStatusFilter}
                    onChange={(val) => {
                      setInvoiceStatusFilter(typeof val === 'object' && val !== null && val.target ? val.target.value : val);
                      setCurrentPage(0);
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <TableTopControls
                entriesPerPage={entriesPerPage}
                onEntriesPerPageChange={(val) => {
                  setEntriesPerPage(val);
                  setCurrentPage(0);
                }}
                searchTerm={invoiceSearchQuery}
                onSearchChange={(val) => {
                  setInvoiceSearchQuery(val);
                  setCurrentPage(0);
                }}
                searchPlaceholder="Search invoices, restaurants, plans..."
              />

              <div className="dish-admin-list" style={{ overflowX: 'auto', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                <table className="menu-data-table">
                  <thead>
                    <tr style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', width: '60px', whiteSpace: 'nowrap' }}>S.No.</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Invoice Number</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Restaurant Name</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Plan Name</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Amount</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Tax Amount</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Payment Date</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Payment Status</th>
                      <th style={{ textAlign: 'left', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Transaction ID</th>
                      <th style={{ textAlign: 'right', padding: '12px 18px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices
                      .map((inv, idx) => (
                        <tr key={inv._id || inv.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '14px 24px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            {currentPage * entriesPerPage + idx + 1}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FileText style={{ width: '14px', height: '14px', color: 'var(--primary)' }} />
                              <span>{inv.invoiceId || inv.id}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{inv.restaurantName}</td>
                          <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: (inv.planName || '').includes('Enterprise') ? 'rgba(124, 58, 237, 0.1)' : (inv.planName || '').includes('Premium') ? 'rgba(59, 130, 246, 0.1)' : (inv.planName || '').includes('Standard') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                              color: (inv.planName || '').includes('Enterprise') ? '#7c3aed' : (inv.planName || '').includes('Premium') ? '#3b82f6' : (inv.planName || '').includes('Standard') ? '#10b981' : '#64748b',
                              display: 'inline-block'
                            }}>{inv.planName || 'N/A'}</span>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            ₹{inv.amount.toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            ₹{(inv.taxAmount !== undefined ? inv.taxAmount : Math.round(inv.amount * 0.18)).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {formatDate(inv.paymentDate || inv.createdAt)}
                          </td>
                          <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: inv.paymentStatus === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : inv.paymentStatus === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: inv.paymentStatus === 'Paid' ? '#10b981' : inv.paymentStatus === 'Pending' ? '#f59e0b' : '#ef4444',
                              display: 'inline-block',
                              border: inv.paymentStatus === 'Paid' ? '1px solid rgba(16, 185, 129, 0.2)' : inv.paymentStatus === 'Pending' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                              {(inv.paymentStatus || 'Pending').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            {inv.transactionId || '—'}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                              {canView ? (
                                <button
                                  onClick={() => {
                                    downloadReceipt(inv._id, inv.invoiceId || inv.id)
                                    showToast('success', `Downloading Invoice ${inv.invoiceId || inv.id}`)
                                  }}
                                  className="btn-outline"
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '0.7rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer',
                                    borderRadius: '6px'
                                  }}
                                  title="Download Invoice"
                                >
                                  <FileSpreadsheet style={{ width: '12px', height: '12px' }} /> Download
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '30px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          No invoice records found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <TableBottomPagination
                totalEntries={total !== undefined && total > 0 ? total : invoices.length}
                currentPage={currentPage}
                entriesPerPage={entriesPerPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        </div>

      {/* Invoice PDF Preview Modal Overlay */}
      {viewingInvoice && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 13, 22, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px'
        }} onClick={() => setViewingInvoice(null)}>
          <div className="menu-edit-panel animate-fade-in" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            width: '95%',
            maxWidth: '600px',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            top: 'auto',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                  Invoice Receipt: {viewingInvoice.invoiceId || viewingInvoice.id}
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Serviq Subscription Billing System</span>
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                onClick={() => setViewingInvoice(null)}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            <div id="printable-invoice-card" style={{ padding: '24px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>SERVIQ</h2>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>E-Commerce POS & Operations</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tech Park, Chennai, TN, India</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: '800' }}>INVOICE</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block' }}>{viewingInvoice.invoiceId || viewingInvoice.id}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Status: <strong>{(viewingInvoice.paymentStatus || 'Pending').toUpperCase()}</strong></span>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', margin: '16px 0' }}></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Billed To:</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{viewingInvoice.restaurantName}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Operational Branch</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Invoice Date: </span>
                    <span style={{ fontWeight: '700' }}>{formatDate(viewingInvoice.paymentDate || viewingInvoice.dueDate || viewingInvoice.createdAt)}</span>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Due Date: </span>
                    <span style={{ fontWeight: '700' }}>{formatDate(viewingInvoice.dueDate)}</span>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Payment Method: </span>
                    <span style={{ fontWeight: '700' }}>{viewingInvoice.paymentMethod || '—'}</span>
                  </div>
                  {viewingInvoice.transactionId && viewingInvoice.transactionId !== '—' && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Transaction ID: </span>
                      <span style={{ fontWeight: '700' }}>{viewingInvoice.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', paddingBottom: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Item Description</th>
                    <th style={{ textAlign: 'right', paddingBottom: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Qty</th>
                    <th style={{ textAlign: 'right', paddingBottom: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Unit Rate</th>
                    <th style={{ textAlign: 'right', paddingBottom: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 0', fontWeight: '700', color: 'var(--text-main)' }}>
                      Subscription Plan: {viewingInvoice.planName || 'N/A'}
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'normal', marginTop: '2px' }}>Monthly recurring platform license fee</span>
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: '700' }}>1</td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>₹{(viewingInvoice.amount - (viewingInvoice.taxAmount !== undefined ? viewingInvoice.taxAmount : Math.round(viewingInvoice.amount * 0.18))).toLocaleString()}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: '800', color: 'var(--text-main)' }}>₹{(viewingInvoice.amount - (viewingInvoice.taxAmount !== undefined ? viewingInvoice.taxAmount : Math.round(viewingInvoice.amount * 0.18))).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ padding: '10px 0' }}></td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600' }}>Subtotal</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: '700', color: 'var(--text-main)' }}>₹{(viewingInvoice.amount - (viewingInvoice.taxAmount !== undefined ? viewingInvoice.taxAmount : Math.round(viewingInvoice.amount * 0.18))).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ padding: '4px 0' }}></td>
                    <td style={{ padding: '4px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600' }}>Tax (GST 18% Incl.)</td>
                    <td style={{ padding: '4px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '700' }}>₹{(viewingInvoice.taxAmount !== undefined ? viewingInvoice.taxAmount : Math.round(viewingInvoice.amount * 0.18)).toLocaleString()}</td>
                  </tr>
                  <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                    <td colSpan="2" style={{ padding: '12px 0' }}></td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: '800', fontSize: '0.85rem', color: 'var(--text-main)' }}>Grand Total</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: '900', fontSize: '0.9rem', color: 'var(--primary)' }}>₹{viewingInvoice.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ borderTop: '1px dashed var(--border-color)', margin: '16px 0' }}></div>

              <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                <span>Thank you for choosing Serviq platform operations!</span>
                <span style={{ display: 'block', marginTop: '4px' }}>For billing disputes or support: billing@serviq.com</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  downloadReceipt(viewingInvoice._id, viewingInvoice.invoiceId || viewingInvoice.id)
                  showToast('success', `Downloading Invoice ${viewingInvoice.invoiceId || viewingInvoice.id}`)
                }}
                className="btn-black"
                style={{ flex: 1, padding: '10px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <FileSpreadsheet style={{ width: '16px', height: '16px' }} /> Download PDF
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setViewingInvoice(null)}
                style={{ flex: 1, padding: '10px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer' }}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
