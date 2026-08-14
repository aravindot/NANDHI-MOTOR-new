import React, { useState } from 'react';
import { Clipboard, DollarSign, ArrowUpRight, ArrowDownRight, Search, Plus, Trash2, Printer } from 'lucide-react';

export default function AccountingLedgerPage({
  activeSubTab,
  invoices = [],
  serviceBills = [],
  dailyExpenses = [],
  setDailyExpenses,
  purchaseInvoices = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    category: 'Rent',
    amount: '',
    payee: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    notes: ''
  });

  // Date Parsing Helper
  const parseDateStr = (dateStr) => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes('-')) {
      return new Date(dateStr);
    }
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    }
    return new Date(dateStr);
  };

  // Compile Transactions chronological list
  const consolidatedTransactions = React.useMemo(() => {
    const list = [];

    // 1. Sales Invoices (Credit / Income)
    invoices.forEach(inv => {
      list.push({
        id: inv.id || inv.invoiceNo,
        date: parseDateStr(inv.invoiceDate || inv.createdOn),
        dateStr: inv.invoiceDate || inv.createdOn,
        ref: inv.invoiceNo,
        description: `Vehicle Sale: ${inv.customerName} (${inv.vehicleModel})`,
        type: 'Income',
        category: 'Vehicle Sales',
        credit: Number(inv.grandTotal || 0),
        debit: 0,
        gstPaid: Number(inv.gstAmount || 0)
      });
    });

    // 2. Service Bills (Credit / Income)
    serviceBills.forEach(sb => {
      list.push({
        id: sb.id,
        date: parseDateStr(sb.date),
        dateStr: sb.date,
        ref: sb.id,
        description: `Service Bill: ${sb.customerName} (${sb.vehicleNo})`,
        type: 'Income',
        category: 'Services',
        credit: Number(sb.grandTotal || 0),
        debit: 0,
        gstPaid: Number(sb.gst || 0)
      });
    });

    // 3. Daily Expenses (Debit / Expense)
    dailyExpenses.forEach(exp => {
      list.push({
        id: exp.id,
        date: parseDateStr(exp.date),
        dateStr: exp.date,
        ref: exp.id,
        description: `Expense: [${exp.category}] Paid to ${exp.payee}`,
        type: 'Expense',
        category: 'Daily Expenses',
        credit: 0,
        debit: Number(exp.amount || 0),
        gstPaid: 0
      });
    });

    // 4. Purchase Invoices (Debit / Expense)
    purchaseInvoices.forEach(pur => {
      list.push({
        id: pur.id || pur.invoiceNo,
        date: parseDateStr(pur.date),
        dateStr: pur.date,
        ref: pur.invoiceNo,
        description: `Purchase: ${pur.supplierName} (${pur.itemDetails || pur.model || pur.partName})`,
        type: 'Expense',
        category: pur.purchaseType || 'Purchases',
        credit: 0,
        debit: Number(pur.totalAmount || 0),
        gstPaid: Number(pur.gstAmount || 0)
      });
    });

    // Sort chronologically (oldest to newest for running balance computation)
    list.sort((a, b) => a.date - b.date);

    // Calculate running balance (starting balance of ₹15,00,000)
    let currentBalance = 1500000;
    const finalCompiled = list.map(tx => {
      currentBalance = currentBalance + tx.credit - tx.debit;
      return {
        ...tx,
        balance: currentBalance
      };
    });

    // Reverse for UI display (newest first)
    return finalCompiled.reverse();
  }, [invoices, serviceBills, dailyExpenses, purchaseInvoices]);

  // Filtered transactions for UI list
  const filteredTransactions = consolidatedTransactions.filter(tx =>
    tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Financial Metrics Summary
  const financials = React.useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    
    consolidatedTransactions.forEach(tx => {
      totalIncome += tx.credit;
      totalExpense += tx.debit;
    });

    const netProfit = totalIncome - totalExpense;
    // Current cash balance starts with seed capital of 15,00,000 plus profit/loss
    const currentBalance = 1500000 + netProfit;

    return { totalIncome, totalExpense, netProfit, currentBalance };
  }, [consolidatedTransactions]);

  // GST dynamic calculations
  const gstCalculations = React.useMemo(() => {
    let outputGst = 0; // GST collected on sales
    let inputGst = 0;  // GST paid on purchases (ITC)

    consolidatedTransactions.forEach(tx => {
      if (tx.type === 'Income') {
        outputGst += tx.gstPaid;
      } else if (tx.type === 'Expense') {
        inputGst += tx.gstPaid;
      }
    });

    const cgstOutput = Math.round(outputGst / 2);
    const sgstOutput = Math.round(outputGst / 2);
    const cgstInput = Math.round(inputGst / 2);
    const sgstInput = Math.round(inputGst / 2);

    const netPayable = outputGst - inputGst;

    return {
      outputGst,
      inputGst,
      cgstOutput,
      sgstOutput,
      cgstInput,
      sgstInput,
      netPayable
    };
  }, [consolidatedTransactions]);

  const handleCreateExpense = (e) => {
    e.preventDefault();
    const newExpense = {
      id: `EXP-${String(dailyExpenses.length + 1).padStart(2, '0')}`,
      category: expenseFormData.category,
      amount: Number(expenseFormData.amount),
      payee: expenseFormData.payee,
      date: expenseFormData.date,
      paymentMode: expenseFormData.paymentMode,
      notes: expenseFormData.notes || ''
    };

    setDailyExpenses([newExpense, ...dailyExpenses]);
    setExpenseFormData({
      category: 'Rent',
      amount: '',
      payee: '',
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'Cash',
      notes: ''
    });
    setIsExpenseModalOpen(false);
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure you want to remove this expense record?')) {
      setDailyExpenses(dailyExpenses.filter(e => e.id !== id));
    }
  };

  const printLedger = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>General Ledger statement - Nandhi Motors</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1f2937; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { color: #059669; margin: 0; font-size: 24px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            .table th, .table td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            .table th { background-color: #f9fafb; font-weight: bold; }
            .credit { color: #059669; font-weight: bold; }
            .debit { color: #dc2626; font-weight: bold; }
            .summary { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; background-color: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #d1fae5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NANDHI MOTORS - GENERAL LEDGER</h1>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #6b7280;">Compiled Statement of Accounts | Date: ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
          <div class="summary">
            <div>Total Revenue: <strong>₹${financials.totalIncome.toLocaleString('en-IN')}</strong></div>
            <div>Total Expenses: <strong>₹${financials.totalExpense.toLocaleString('en-IN')}</strong></div>
            <div>Net Profit/Loss: <strong>₹${financials.netProfit.toLocaleString('en-IN')}</strong></div>
            <div>Closing Balance: <strong>₹${financials.currentBalance.toLocaleString('en-IN')}</strong></div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference ID</th>
                <th>Description</th>
                <th>Debit (Payments)</th>
                <th>Credit (Receipts)</th>
                <th>Running Balance</th>
              </tr>
            </thead>
            <tbody>
              ${consolidatedTransactions.map(tx => `
                <tr>
                  <td>${tx.dateStr}</td>
                  <td><strong>${tx.ref}</strong></td>
                  <td>${tx.description}</td>
                  <td class="debit">${tx.debit > 0 ? '₹' + tx.debit.toLocaleString('en-IN') : '-'}</td>
                  <td class="credit">${tx.credit > 0 ? '₹' + tx.credit.toLocaleString('en-IN') : '-'}</td>
                  <td style="font-weight: 600;">₹${tx.balance.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      
      {/* Financials Overview Bar */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stats-card">
          <div className="stats-info">
            <span className="stats-label">Total Credit (Income)</span>
            <span className="stats-value" style={{ color: '#059669' }}>
              ₹{financials.totalIncome.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="stats-icon" style={{ backgroundColor: '#d1fae5' }}>
            <ArrowUpRight size={22} color="#059669" />
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-info">
            <span className="stats-label">Total Debit (Expense)</span>
            <span className="stats-value" style={{ color: '#ef4444' }}>
              ₹{financials.totalExpense.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="stats-icon" style={{ backgroundColor: '#fee2e2' }}>
            <ArrowDownRight size={22} color="#dc2626" />
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-info">
            <span className="stats-label">Net Profit / Loss</span>
            <span className="stats-value" style={{ color: financials.netProfit >= 0 ? '#059669' : '#dc2626' }}>
              ₹{financials.netProfit.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="stats-icon" style={{ backgroundColor: financials.netProfit >= 0 ? '#ecfdf5' : '#fef2f2' }}>
            <DollarSign size={22} color={financials.netProfit >= 0 ? '#059669' : '#dc2626'} />
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-info">
            <span className="stats-label">Closing Cash Balance</span>
            <span className="stats-value" style={{ color: '#0284c7' }}>
              ₹{financials.currentBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="stats-icon" style={{ backgroundColor: '#e0f2fe' }}>
            <Clipboard size={22} color="#0284c7" />
          </div>
        </div>
      </div>

      {/* SUBTAB 1: LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <Clipboard size={18} style={{ color: '#059669' }} /> General Ledger statement
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="quick-search">
                <Search size={14} className="quick-search-icon" />
                <input
                  type="text"
                  placeholder="Search ref / description..."
                  style={{ width: '200px', padding: '6px 10px 6px 30px', fontSize: '0.8rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }} onClick={printLedger}>
                <Printer size={14} style={{ marginRight: '4px' }} /> Print Statement
              </button>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {filteredTransactions.length > 0 ? (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference ID</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Debit (Expense)</th>
                      <th style={{ textAlign: 'right' }}>Credit (Income)</th>
                      <th style={{ textAlign: 'right' }}>Running Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Add seed initial balance row at the very bottom of chronological list */}
                    {filteredTransactions.map((tx, idx) => (
                      <tr key={`${tx.id}-${idx}`}>
                        <td style={{ fontSize: '0.84rem', color: '#4b5563' }}>{tx.dateStr}</td>
                        <td>
                          <span style={{
                            fontWeight: 700,
                            color: tx.type === 'Income' ? '#059669' : '#b91c1c',
                            backgroundColor: tx.type === 'Income' ? '#ecfdf5' : '#fef2f2',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace'
                          }}>{tx.ref}</span>
                        </td>
                        <td style={{ fontSize: '0.88rem', fontWeight: 500 }}>{tx.description}</td>
                        <td>
                          <span className="badge" style={{ fontSize: '0.72rem', backgroundColor: '#f3f4f6', color: '#4b5563' }}>
                            {tx.category}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>
                          {tx.debit > 0 ? `₹${tx.debit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                          {tx.credit > 0 ? `₹${tx.credit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#1f2937' }}>
                          ₹{tx.balance.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                    {/* Opening Balance Seed Row */}
                    <tr>
                      <td style={{ color: '#9ca3af', fontSize: '0.82rem' }}>--</td>
                      <td><span className="badge" style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}>OPEN-BAL</span></td>
                      <td style={{ color: '#6b7280', fontStyle: 'italic' }}>Opening Capital Balance Seed</td>
                      <td><span className="badge">Equity</span></td>
                      <td style={{ textAlign: 'right' }}>-</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>₹15,00,000</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹15,00,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                <Clipboard size={48} strokeWidth={1} style={{ marginBottom: '10px' }} />
                <p>No transaction history records match search parameters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: DAILY EXPENSES */}
      {activeSubTab === 'daily-expenses' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <ArrowDownRight size={18} style={{ color: '#dc2626' }} /> Daily Expenses registry
            </h3>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsExpenseModalOpen(true)}
            >
              <Plus size={14} style={{ marginRight: '4px' }} /> Record Expense
            </button>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {dailyExpenses.length > 0 ? (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Expense ID</th>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Paid To / Payee</th>
                      <th>Payment Mode</th>
                      <th>Remarks / Notes</th>
                      <th style={{ textAlign: 'right' }}>Amount Paid</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyExpenses.map(exp => (
                      <tr key={exp.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: '#374151', fontFamily: 'monospace' }}>{exp.id}</span>
                        </td>
                        <td>{exp.date.split('-').reverse().join('/')}</td>
                        <td>
                          <span className="badge" style={{
                            backgroundColor: exp.category === 'Rent' ? '#eff6ff' : exp.category === 'Salary' ? '#ecfdf5' : '#fef3c7',
                            color: exp.category === 'Rent' ? '#1d4ed8' : exp.category === 'Salary' ? '#047857' : '#d97706'
                          }}>{exp.category}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{exp.payee}</td>
                        <td>{exp.paymentMode}</td>
                        <td style={{ fontSize: '0.8rem', color: '#6b7280' }}>{exp.notes || '--'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                          ₹{Number(exp.amount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 4px', minWidth: 'auto' }}
                            onClick={() => handleDeleteExpense(exp.id)}
                          >
                            <Trash2 size={12} style={{ color: '#ef4444' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                <Clipboard size={48} strokeWidth={1} style={{ marginBottom: '10px' }} />
                <p>No daily expenses logged. Click "Record Expense" to add one.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: GST REPORTS */}
      {activeSubTab === 'gst-reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Tax Collected (Sales Output) */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ color: '#059669' }}>Output GST Collected (Sales)</h3>
            </div>
            <div className="card-body">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 0', color: '#4b5563' }}>Total Output GST (Credit transactions):</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700 }}>₹{gstCalculations.outputGst.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 0', color: '#6b7280', paddingLeft: '15px' }}>Central GST (CGST - 50%):</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: '#6b7280' }}>₹{gstCalculations.cgstOutput.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 0', color: '#6b7280', paddingLeft: '15px' }}>State GST (SGST - 50%):</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: '#6b7280' }}>₹{gstCalculations.sgstOutput.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Input Tax Credit (ITC Purchases) */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ color: '#dc2626' }}>Input GST Credit (ITC Purchases)</h3>
            </div>
            <div className="card-body">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 0', color: '#4b5563' }}>Total ITC GST (Debit transactions):</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700 }}>₹{gstCalculations.inputGst.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 0', color: '#6b7280', paddingLeft: '15px' }}>CGST Paid (Claimable):</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: '#6b7280' }}>₹{gstCalculations.cgstInput.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 0', color: '#6b7280', paddingLeft: '15px' }}>SGST Paid (Claimable):</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: '#6b7280' }}>₹{gstCalculations.sgstInput.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Consolidated GST Payable Summary */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-header">
              <h3 className="card-title">Consolidated Tax Settlement Summary</h3>
            </div>
            <div className="card-body" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{
                padding: '20px',
                borderRadius: '8px',
                backgroundColor: gstCalculations.netPayable >= 0 ? '#f0fdf4' : '#eff6ff',
                border: gstCalculations.netPayable >= 0 ? '1px solid #d1fae5' : '1px solid #bfdbfe',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {gstCalculations.netPayable >= 0 ? 'Net GST Payable to Govt' : 'Net Input Tax Credit Refundable'}
                </span>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  margin: '8px 0',
                  color: gstCalculations.netPayable >= 0 ? '#059669' : '#0284c7'
                }}>
                  ₹{Math.abs(gstCalculations.netPayable).toLocaleString('en-IN')}
                </h2>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280' }}>
                  {gstCalculations.netPayable >= 0
                    ? 'This represent GST output tax collected minus input GST credits paid to suppliers.'
                    : 'Your inputs credits exceed outputs tax. This amount can be carried forward or claimed as refund.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE MODAL OVERLAY */}
      {isExpenseModalOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1100, backdropFilter: 'blur(3px)'
        }} onClick={() => setIsExpenseModalOpen(false)}>
          <div className="card" style={{
            width: '95%',
            maxWidth: '550px',
            maxHeight: '90vh',
            overflowY: 'auto',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">
                <ArrowDownRight size={18} style={{ color: '#dc2626' }} /> Record Expense Voucher
              </h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsExpenseModalOpen(false)}>✕ Close</button>
            </div>
            
            <form className="card-body" onSubmit={handleCreateExpense}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Expense Category *</label>
                  <select
                    className="form-control"
                    required
                    value={expenseFormData.category}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                  >
                    <option value="Rent">Showroom Rent</option>
                    <option value="Salary">Staff Salaries</option>
                    <option value="Electricity">Electricity Bills</option>
                    <option value="Water">Water Bills</option>
                    <option value="Stationery">Office Stationery</option>
                    <option value="Snacks">Tea & Snacks</option>
                    <option value="Marketing">Advertising & Marketing</option>
                    <option value="Spares Repair">Machinery & Spares Repairs</option>
                    <option value="Others">Others / Misc</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Expense Amount (₹) *</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    min="1"
                    placeholder="Enter amount paid"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Paid To / Payee *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Beneficiary Name"
                    value={expenseFormData.payee}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, payee: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={expenseFormData.date}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-control"
                  value={expenseFormData.paymentMode}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, paymentMode: e.target.value })}
                >
                  <option value="Cash">Cash Handover</option>
                  <option value="UPI">UPI (GPay / PhonePe)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                  <option value="Card">Business Credit/Debit Card</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks / Description</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Notes detailing the transaction (Optional)"
                  value={expenseFormData.notes}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '11px', fontWeight: 600, marginTop: '10px' }}>
                Save Expense Voucher
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
