import React, { useState, useEffect } from 'react'
import { FileText, Check, CreditCard, Landmark, IndianRupee, Receipt, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react'

export default function BillingSystem({ 
  orders, 
  tables, 
  onCheckoutTable, 
  initialTableId, 
  onClearInitialTableId 
}) {
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [cashReceived, setCashReceived] = useState('')

  // Handle auto-selection of table from props
  useEffect(() => {
    if (initialTableId) {
      setSelectedTableId(initialTableId)
      if (onClearInitialTableId) {
        onClearInitialTableId()
      }
    }
  }, [initialTableId, onClearInitialTableId])

  // Reset cash input when selected table changes
  useEffect(() => {
    setCashReceived('')
  }, [selectedTableId])

  // Filter tables that are occupied
  const occupiedTables = tables.filter(t => t.status === 'Occupied')

  // Find all orders associated with the selected table
  const selectedTable = tables.find(t => t.id === selectedTableId)
  const tableOrders = selectedTableId 
    ? orders.filter(o => o.table === selectedTable?.name && o.status !== 'Billed')
    : []

  // Combine items from all orders of this table
  const billingItems = []
  tableOrders.forEach(order => {
    order.items.forEach(item => {
      const existing = billingItems.find(i => i.name === item.name)
      if (existing) {
        existing.quantity += item.quantity
        existing.totalPrice += item.price * item.quantity
      } else {
        billingItems.push({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity
        })
      }
    })
  })

  // Calculations
  const subtotal = billingItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const cgst = subtotal * 0.025 // 2.5% CGST
  const sgst = subtotal * 0.025 // 2.5% SGST
  const serviceCharge = subtotal * 0.05 // 5% Service Charge
  const grandTotal = subtotal + cgst + sgst + serviceCharge

  // Cash change calculations
  const parsedCash = parseFloat(cashReceived) || 0
  const changeDue = parsedCash > grandTotal ? parsedCash - grandTotal : 0

  // Total unbilled revenue across all occupied tables
  const totalUnbilledRevenue = occupiedTables.reduce((sum, table) => {
    const tableOrdersList = orders.filter(o => o.table === table.name && o.status !== 'Billed')
    return sum + tableOrdersList.reduce((s, order) => {
      return s + order.items.reduce((sumItems, item) => sumItems + (item.price * item.quantity), 0)
    }, 0)
  }, 0)

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Handle billing payment completion
  const handlePaymentSubmit = () => {
    if (!selectedTableId) return
    onCheckoutTable(selectedTableId, grandTotal, tableOrders.map(o => o.id))
    setSelectedTableId(null)
    setCashReceived('')
    alert(`Checkout complete! Payment of ${formatCurrency(grandTotal)} via ${paymentMethod} has been finalized.`)
  }

  return (
    <div className="billing-grid animate-fade-in">
      
      {/* Left panel: Active Tables list for checkout */}
      <div className="billing-tables-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Unbilled Stats Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#fff',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px' }}>Total Unbilled Amount</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0 0 0', fontFamily: 'var(--font-headings)' }}>{formatCurrency(totalUnbilledRevenue)}</h2>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '8px', textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8, fontWeight: '600' }}>OCCUPIED TABLES</span>
            <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>{occupiedTables.length} / {tables.length}</span>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '14px', color: 'var(--text-main)' }}>Dining Tables Billing Feed</h3>
          
          {occupiedTables.length === 0 ? (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center', 
              color: 'var(--text-muted)',
              background: 'var(--bg-app)',
              border: '1px dashed var(--border-color)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Receipt style={{ width: '40px', height: '40px', color: 'var(--text-light)', opacity: 0.6 }} />
              <div>
                <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>No Active Bills</h4>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>There are no dining tables currently waiting for payment.</p>
              </div>
            </div>
          ) : (
            <div className="billing-tables-list">
              {occupiedTables.map(table => {
                // Calculate cumulative cost for this table's orders
                const tableOrdersList = orders.filter(o => o.table === table.name && o.status !== 'Billed')
                const tableCost = tableOrdersList.reduce((sum, order) => {
                  return sum + order.items.reduce((s, i) => s + (i.price * i.quantity), 0)
                }, 0)

                return (
                  <div 
                    key={table.id}
                    className={`billing-table-row ${selectedTableId === table.id ? 'active' : ''}`}
                    onClick={() => setSelectedTableId(table.id)}
                    style={{
                      borderLeftWidth: selectedTableId === table.id ? '6px' : '1px',
                      borderLeftColor: selectedTableId === table.id ? 'var(--primary)' : 'var(--border-color)',
                      background: selectedTableId === table.id ? 'var(--primary-light)' : 'var(--bg-card)'
                    }}
                  >
                    <div className="billing-table-info">
                      <h4 style={{ fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{table.id} — {table.name}</h4>
                      <p style={{ margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></span>
                        {tableOrdersList.length} Active {tableOrdersList.length === 1 ? 'Receipt' : 'Receipts'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>{formatCurrency(tableCost)}</div>
                      <span className="badge badge-new" style={{ fontSize: '0.65rem', marginTop: '2px', background: selectedTableId === table.id ? 'var(--primary)' : '#0f172a', color: '#fff' }}>PENDING Checkout</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Invoice generator */}
      <div className="billing-invoice-card" style={{ padding: '0px', overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--bg-card)' }}>
        
        {selectedTableId ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Skeuomorphic Paper Receipt Container */}
            <div style={{ padding: '30px 30px 20px 30px', background: 'var(--bg-card)', position: 'relative' }}>
              
              {/* Decorative Receipt Cut Out Top */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '8px',
                background: 'radial-gradient(circle, transparent, transparent 50%, var(--bg-app) 50%, var(--bg-app)) 0 0 / 12px 16px repeat-x'
              }}></div>

              <div className="invoice-header" style={{ borderBottom: '2px dashed var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Sparkles style={{ width: '16px', height: '16px', color: 'var(--primary)' }} />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '5px' }}>RESTAURANT INVOICE</h3>
                </div>
                <p style={{ margin: 0, fontWeight: '500' }}>Serviq Dining Hub, Salt Lake, Sector V</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '2px' }}>GSTIN: 19AAACQ1234F1Z9 | TEL: +91 9876543210</p>
              </div>

              <div className="invoice-details" style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '10px', marginBottom: '16px', fontSize: '0.8rem' }}>
                <span><strong>TABLE:</strong> {selectedTable?.name} ({selectedTable?.id})</span>
                <span><strong>DATE:</strong> {new Date().toLocaleDateString()}</span>
                <span><strong>TIME:</strong> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="invoice-items" style={{ gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <span style={{ width: '28px', flexShrink: 0, textAlign: 'center' }}>S.No</span>
                  <span style={{ flex: 1, paddingLeft: '8px' }}>Dish Description</span>
                  <span style={{ textAlign: 'center', width: '80px' }}>Qty × Price</span>
                  <span style={{ textAlign: 'right', width: '80px' }}>Amount</span>
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                  {billingItems.map((item, index) => (
                    <div key={index} className="invoice-item-row" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '28px', flexShrink: 0, textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>{index + 1}</span>
                      <span className="invoice-item-name" style={{ fontWeight: '600', color: 'var(--text-main)', flex: 1, paddingLeft: '8px' }}>{item.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', width: '80px' }}>{item.quantity} × ₹{item.price}</span>
                      <span className="invoice-item-price" style={{ textAlign: 'right', width: '80px' }}>₹{item.totalPrice}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Calculations */}
              <div className="invoice-totals" style={{ borderTop: '2px dashed var(--border-color)', marginTop: '16px', paddingTop: '14px', gap: '8px' }}>
                <div className="invoice-total-row" style={{ fontSize: '0.85rem' }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="invoice-total-row" style={{ fontSize: '0.8rem' }}>
                  <span>CGST (2.5%)</span>
                  <span>{formatCurrency(cgst)}</span>
                </div>
                <div className="invoice-total-row" style={{ fontSize: '0.8rem' }}>
                  <span>SGST (2.5%)</span>
                  <span>{formatCurrency(sgst)}</span>
                </div>
                <div className="invoice-total-row" style={{ fontSize: '0.8rem' }}>
                  <span>Service Charge (5%)</span>
                  <span>{formatCurrency(serviceCharge)}</span>
                </div>
                
                <div className="invoice-total-row grand-total" style={{ 
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: 'none'
                }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', letterSpacing: '0.5px' }}>NET GRAND TOTAL</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800' }}>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Payment Panel (Interactive Area) */}
            <div style={{ background: 'var(--bg-app)', padding: '24px 30px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Interactive Payment Mode</h4>
                
                <div className="payment-methods" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button 
                    className={`payment-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('UPI')}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px',
                      padding: '12px 8px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      border: paymentMethod === 'UPI' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: paymentMethod === 'UPI' ? 'var(--primary-light)' : 'var(--bg-card)',
                      color: paymentMethod === 'UPI' ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    <Landmark style={{ width: '16px', height: '16px' }} />
                    UPI Dynamic QR
                  </button>
                  
                  <button 
                    className={`payment-btn ${paymentMethod === 'Card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('Card')}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px',
                      padding: '12px 8px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      border: paymentMethod === 'Card' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: paymentMethod === 'Card' ? 'var(--primary-light)' : 'var(--bg-card)',
                      color: paymentMethod === 'Card' ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    <CreditCard style={{ width: '16px', height: '16px' }} />
                    Credit Card
                  </button>
                  
                  <button 
                    className={`payment-btn ${paymentMethod === 'Cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('Cash')}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px',
                      padding: '12px 8px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      border: paymentMethod === 'Cash' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: paymentMethod === 'Cash' ? 'var(--primary-light)' : 'var(--bg-card)',
                      color: paymentMethod === 'Cash' ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    <IndianRupee style={{ width: '16px', height: '16px' }} />
                    Cash Drawer
                  </button>
                </div>
              </div>

              {/* Dynamic Payment Mode Details */}
              <div className="glass-card" style={{ padding: '16px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', borderRadius: '10px' }}>
                
                {/* UPI QR Display */}
                {paymentMethod === 'UPI' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      background: '#fff', 
                      padding: '8px', 
                      borderRadius: '8px', 
                      boxShadow: 'var(--shadow-sm)',
                      border: '1px solid #cbd5e1',
                      flexShrink: 0
                    }}>
                      {/* Visual QR graphic with amount in it */}
                      <div style={{ 
                        width: '74px', height: '74px', 
                        background: 'repeating-linear-gradient(45deg, #000, #000 2px, transparent 2px, transparent 8px)',
                        opacity: 0.85,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ width: '20px', height: '20px', background: '#fff', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: '800' }}>₹</div>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block' }}>Dynamic UPI Checkout</span>
                      <h5 style={{ margin: '2px 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>Scan QR to Pay {formatCurrency(grandTotal)}</h5>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compatible with Google Pay, PhonePe, Paytm, and BHIM UPI.</p>
                    </div>
                  </div>
                )}

                {/* Credit Card Graphic */}
                {paymentMethod === 'Card' && (
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '110px', height: '68px',
                      background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                      borderRadius: '8px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      color: '#fff',
                      boxShadow: 'var(--shadow-md)',
                      flexShrink: 0
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '8px', fontWeight: 'bold' }}>CREDIT CARD</span>
                        <div style={{ width: '12px', height: '8px', background: '#e2e8f0', borderRadius: '2px' }}></div>
                      </div>
                      <div>
                        <div style={{ fontSize: '9px', letterSpacing: '0.5px' }}>•••• •••• •••• 9820</div>
                        <div style={{ fontSize: '6px', opacity: 0.8, marginTop: '2px' }}>EXPRESS BILLING</div>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block' }}>POS Terminal Simulation</span>
                      <h5 style={{ margin: '2px 0', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>Card Reader Ready</h5>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click Checkout below to simulate card dip/tap/swipe.</p>
                    </div>
                  </div>
                )}

                {/* Cash Drawer Calculator */}
                {paymentMethod === 'Cash' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Cash Received (₹)</label>
                        <input 
                          type="number"
                          placeholder="e.g. 1000"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-app)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: 'var(--text-main)'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, background: changeDue > 0 ? '#d1fae5' : 'var(--bg-app)', border: `1px solid ${changeDue > 0 ? '#10b981' : 'var(--border-color)'}`, borderRadius: '6px', padding: '6px 12px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: changeDue > 0 ? '#065f46' : 'var(--text-muted)', display: 'block' }}>Change to Return</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: changeDue > 0 ? '#047857' : 'var(--text-muted)', marginTop: '2px' }}>
                          {formatCurrency(changeDue)}
                        </div>
                      </div>
                    </div>
                    {parsedCash > 0 && parsedCash < grandTotal && (
                      <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle style={{ width: '12px', height: '12px' }} /> Amount is short by {formatCurrency(grandTotal - parsedCash)}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Triggers */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn-black" 
                  style={{ 
                    flex: 2, 
                    padding: '12px', 
                    fontSize: '0.9rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px',
                    borderRadius: '8px'
                  }}
                  onClick={handlePaymentSubmit}
                  disabled={paymentMethod === 'Cash' && parsedCash > 0 && parsedCash < grandTotal}
                >
                  <Check style={{ width: '18px', height: '18px' }} />
                  Complete Settlement ({formatCurrency(grandTotal)})
                </button>
                
                <button 
                  className="btn-outline" 
                  style={{ flex: 1, padding: '12px', borderRadius: '8px' }}
                  onClick={() => alert('Printing physical receipt...')}
                >
                  Print Bill
                </button>
              </div>

            </div>

          </div>
        ) : (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', gap: '14px', minHeight: '400px' }}>
            <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: '50%', border: '1px dashed var(--border-color)' }}>
              <FileText style={{ width: '48px', height: '48px', color: 'var(--text-light)', opacity: 0.8 }} />
            </div>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontWeight: '800', margin: 0 }}>No Receipt Selected</h4>
              <p style={{ fontSize: '0.8rem', marginTop: '6px', maxWidth: '300px', marginInline: 'auto' }}>Select an occupied dining table from the active feed on the left to review its invoice breakdown and settle its payments.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--primary-light)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', marginTop: '10px' }}>
              <span>Click on any table row to start</span>
              <ArrowRight style={{ width: '12px', height: '12px' }} />
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
