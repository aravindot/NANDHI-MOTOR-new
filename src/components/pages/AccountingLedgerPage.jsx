import React, { useState, useMemo, useEffect } from 'react';
import {
  Clipboard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Plus,
  Trash2,
  Printer,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Layers,
  Tag,
  CheckCircle,
  Clock,
  RotateCcw,
  ShoppingBag,
  Briefcase,
  FileText,
  CreditCard,
  Building2,
  PieChart,
  ShieldCheck,
  Percent,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Wallet,
  Landmark,
  Scale,
  FileCheck,
  HelpCircle,
  Eye,
  Check,
  X
} from 'lucide-react';

export default function AccountingLedgerPage({
  activeSubTab = 'receivable',
  setActiveSubTab,
  invoices = [],
  setInvoices,
  addInvoice,
  serviceBills = [],
  setServiceBills,
  jobSheets = [],
  dailyExpenses = [],
  setDailyExpenses,
  purchaseInvoices = [],
  setPurchaseInvoices,
  spares = [],
  vehicles = [],
  customers = [],
  companyProfile = {},
  onNavigate
}) {
  // Navigation Tabs matching user hierarchy:
  // 'receivable' | 'payable' | 'expense' | 'general-ledger' | 'trial-balance' | 'pnl' | 'balance-sheet' | 'gst' | 'bank-cash'
  const [currentTab, setCurrentTab] = useState(() => {
    if (activeSubTab === 'payable') return 'payable';
    if (activeSubTab === 'daily-expenses' || activeSubTab === 'expense') return 'expense';
    if (activeSubTab === 'general-ledger' || activeSubTab === 'ledger') return 'general-ledger';
    if (activeSubTab === 'trial-balance') return 'trial-balance';
    if (activeSubTab === 'pnl') return 'pnl';
    if (activeSubTab === 'balance-sheet') return 'balance-sheet';
    if (activeSubTab === 'gst-reports' || activeSubTab === 'gst') return 'gst';
    if (activeSubTab === 'bank-cash' || activeSubTab === 'reconciliation') return 'bank-cash';
    return 'receivable';
  });

  // GST Sub-tabs: 'gstr-1' | 'gstr-2b' | 'gstr-3b'
  const [gstSubTab, setGstSubTab] = useState('gstr-1');

  // Bank & Cash Sub-tabs: 'cash-book' | 'bank-book' | 'reconciliation'
  const [bankSubTab, setBankSubTab] = useState('reconciliation');

  // GL Account Filter
  const [glAccountFilter, setGlAccountFilter] = useState('all');

  // Universal Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'this_month', 'last_month', 'this_year', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Reconciled items state with persistence
  const [reconciledItems, setReconciledItems] = useState(() => {
    const saved = localStorage.getItem('nandhi_reconciled_transactions');
    return saved ? JSON.parse(saved) : {};
  });

  // Additional Payment Receipts (Receivables) tracking
  const [paymentCollections, setPaymentCollections] = useState(() => {
    const saved = localStorage.getItem('nandhi_payment_collections');
    return saved ? JSON.parse(saved) : [];
  });

  // Supplier Payments tracking
  const [supplierPayments, setSupplierPayments] = useState(() => {
    const saved = localStorage.getItem('nandhi_supplier_payments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nandhi_reconciled_transactions', JSON.stringify(reconciledItems));
  }, [reconciledItems]);

  useEffect(() => {
    localStorage.setItem('nandhi_payment_collections', JSON.stringify(paymentCollections));
  }, [paymentCollections]);

  useEffect(() => {
    localStorage.setItem('nandhi_supplier_payments', JSON.stringify(supplierPayments));
  }, [supplierPayments]);

  // Synchronize when parent activeSubTab prop changes
  useEffect(() => {
    if (activeSubTab === 'receivable') setCurrentTab('receivable');
    else if (activeSubTab === 'payable') setCurrentTab('payable');
    else if (activeSubTab === 'daily-expenses' || activeSubTab === 'expense') setCurrentTab('expense');
    else if (activeSubTab === 'ledger' || activeSubTab === 'general-ledger') setCurrentTab('general-ledger');
    else if (activeSubTab === 'trial-balance') setCurrentTab('trial-balance');
    else if (activeSubTab === 'pnl') setCurrentTab('pnl');
    else if (activeSubTab === 'balance-sheet') setCurrentTab('balance-sheet');
    else if (activeSubTab === 'gst-reports' || activeSubTab === 'gst') setCurrentTab('gst');
    else if (activeSubTab === 'bank-cash' || activeSubTab === 'reconciliation') setCurrentTab('bank-cash');
  }, [activeSubTab]);

  const handleSwitchTab = (tabId) => {
    setCurrentTab(tabId);
    setSearchQuery('');
    if (setActiveSubTab) {
      if (tabId === 'expense') setActiveSubTab('daily-expenses');
      else if (tabId === 'general-ledger') setActiveSubTab('ledger');
      else if (tabId === 'gst') setActiveSubTab('gst-reports');
      else setActiveSubTab(tabId);
    }
  };

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    category: '',
    amount: '',
    payee: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: '',
    notes: ''
  });

  // Receive Payment Modal
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] = useState(false);
  const [selectedReceivableItem, setSelectedReceivableItem] = useState(null);
  const [receivePaymentFormData, setReceivePaymentFormData] = useState({
    amount: '',
    paymentMode: '',
    date: new Date().toISOString().split('T')[0],
    referenceNo: '',
    notes: ''
  });

  // Make Supplier Payment Modal
  const [isPaySupplierModalOpen, setIsPaySupplierModalOpen] = useState(false);
  const [selectedPayableItem, setSelectedPayableItem] = useState(null);
  const [paySupplierFormData, setPaySupplierFormData] = useState({
    amount: '',
    paymentMode: '',
    date: new Date().toISOString().split('T')[0],
    referenceNo: '',
    notes: ''
  });

  // ==========================================
  // DATE PARSING & FILTER HELPERS
  // ==========================================
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    if (dateStr instanceof Date) return dateStr;
    const str = String(dateStr).trim();
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
      }
    }
    if (str.includes('-')) {
      return new Date(str);
    }
    return new Date(str);
  };

  const formatDateDisplay = (dateObjOrStr) => {
    if (!dateObjOrStr) return '--';
    const d = parseDate(dateObjOrStr);
    if (isNaN(d.getTime())) return String(dateObjOrStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDateInFilter = (dateStr) => {
    if (!dateStr || dateFilter === 'all') return true;
    const d = parseDate(dateStr);
    if (isNaN(d.getTime())) return true;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (dateFilter === 'this_month') {
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }
    if (dateFilter === 'last_month') {
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      return d.getFullYear() === lastMonthDate.getFullYear() && d.getMonth() === lastMonthDate.getMonth();
    }
    if (dateFilter === 'this_year') {
      const fyStart = currentMonth >= 3 ? new Date(currentYear, 3, 1) : new Date(currentYear - 1, 3, 1);
      const fyEnd = currentMonth >= 3 ? new Date(currentYear + 1, 2, 31, 23, 59, 59) : new Date(currentYear, 2, 31, 23, 59, 59);
      return d >= fyStart && d <= fyEnd;
    }
    if (dateFilter === 'custom') {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (d < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    }
    return true;
  };

  // Calculate Aging in Days
  const getAgingDays = (dateStr) => {
    const d = parseDate(dateStr);
    if (isNaN(d.getTime())) return 0;
    const diffTime = Math.abs(new Date() - d);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // ==========================================
  // 1. DATA COMPILATION - RECEIVABLES (FROM SALES & SERVICE)
  // ==========================================
  const receivablesData = useMemo(() => {
    const list = [];

    // Vehicle Sales Invoices
    (invoices || []).forEach(inv => {
      const total = Number(inv.grandTotal || inv.totalBeforeRoundoff || 0);
      const invNo = String(inv.invoiceNo || '');
      // Calculate payments made from collection logs
      const extraPaid = paymentCollections
        .filter(p => p.docType === 'Sales Invoice' && String(p.docId) === invNo)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
      
      const isMarkedPaid = inv.paymentStatus === 'Fully Paid' || inv.paymentStatus === 'Paid';
      const paid = isMarkedPaid ? total : extraPaid;
      const balance = Math.max(0, total - paid);
      const dateStr = inv.invoiceDate || inv.createdOn || '';
      const aging = getAgingDays(dateStr);

      list.push({
        id: `REC-INV-${invNo}`,
        docId: invNo,
        docType: 'Sales Invoice',
        sourceModule: 'Sales',
        customerName: inv.customerName || 'Customer',
        customerPhone: inv.customerPhone || '',
        particulars: `${inv.vehicleModel || 'Vehicle'} (Inv #${invNo})`,
        date: dateStr,
        totalAmount: total,
        paidAmount: paid,
        balanceAmount: balance,
        status: balance === 0 ? 'Settled' : balance < total ? 'Partially Paid' : 'Due',
        agingDays: aging,
        agingBucket: aging <= 30 ? '0-30 Days' : aging <= 60 ? '31-60 Days' : '60+ Days'
      });
    });

    // Service Bills
    (serviceBills || []).forEach(sb => {
      const total = Number(sb.grandTotal || 0);
      const sbId = String(sb.id || '');
      const extraPaid = paymentCollections
        .filter(p => p.docType === 'Service Bill' && String(p.docId) === sbId)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const isMarkedPaid = sb.paymentStatus === 'Paid' || sb.status === 'Paid' || (!sb.paymentStatus && true);
      const paid = isMarkedPaid ? total : extraPaid;
      const balance = Math.max(0, total - paid);
      const dateStr = sb.date || '';
      const aging = getAgingDays(dateStr);

      list.push({
        id: `REC-SB-${sbId}`,
        docId: sbId,
        docType: 'Service Bill',
        sourceModule: 'Service',
        customerName: sb.customerName || 'Service Customer',
        customerPhone: sb.customerPhone || '',
        particulars: `Vehicle Service: ${sb.vehicleNo || ''} (Job #${sb.jobSheetId || sbId})`,
        date: dateStr,
        totalAmount: total,
        paidAmount: paid,
        balanceAmount: balance,
        status: balance === 0 ? 'Settled' : balance < total ? 'Partially Paid' : 'Due',
        agingDays: aging,
        agingBucket: aging <= 30 ? '0-30 Days' : aging <= 60 ? '31-60 Days' : '60+ Days'
      });
    });

    return list.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }, [invoices, serviceBills, paymentCollections]);

  const filteredReceivables = useMemo(() => {
    return receivablesData.filter(item => {
      if (!isDateInFilter(item.date)) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'due' && item.status === 'Settled') return false;
        if (statusFilter === 'settled' && item.status !== 'Settled') return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.customerName.toLowerCase().includes(q) ||
          item.docId.toLowerCase().includes(q) ||
          item.particulars.toLowerCase().includes(q) ||
          item.customerPhone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [receivablesData, dateFilter, startDate, endDate, statusFilter, searchQuery]);

  const receivablesSummary = useMemo(() => {
    let total = 0;
    let collected = 0;
    let outstanding = 0;
    let overdue30 = 0;
    let overdue60 = 0;

    filteredReceivables.forEach(item => {
      total += item.totalAmount;
      collected += item.paidAmount;
      outstanding += item.balanceAmount;
      if (item.balanceAmount > 0) {
        if (item.agingDays > 60) overdue60 += item.balanceAmount;
        else if (item.agingDays > 30) overdue30 += item.balanceAmount;
      }
    });

    return { total, collected, outstanding, overdue30, overdue60 };
  }, [filteredReceivables]);

  // ==========================================
  // 2. DATA COMPILATION - PAYABLES (FROM PURCHASES)
  // ==========================================
  const payablesData = useMemo(() => {
    const list = [];

    (purchaseInvoices || []).forEach(pur => {
      const total = Number(pur.totalAmount || 0);
      const purId = String(pur.id || pur.invoiceNo || '');
      const extraPaid = supplierPayments
        .filter(p => String(p.purchaseId) === purId)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const isPaid = pur.paymentStatus === 'Paid';
      const paid = isPaid ? total : extraPaid;
      const balance = Math.max(0, total - paid);
      const dateStr = pur.date || '';
      const aging = getAgingDays(dateStr);

      list.push({
        id: `PAY-PUR-${purId}`,
        purchaseId: purId,
        invoiceNo: pur.invoiceNo || purId,
        docType: 'Purchase Bill',
        sourceModule: 'Purchase',
        supplierName: pur.supplierName || 'Auto Component Supplier',
        supplierGst: pur.supplierGst || '--',
        purchaseType: pur.purchaseType || 'Spares & Vehicles',
        itemDetails: pur.itemDetails || 'OEM Inward Consignment',
        date: dateStr,
        totalAmount: total,
        paidAmount: paid,
        balanceAmount: balance,
        status: balance === 0 ? 'Settled' : balance < total ? 'Partially Paid' : 'Due',
        agingDays: aging,
        agingBucket: aging <= 30 ? '0-30 Days' : aging <= 60 ? '31-60 Days' : '60+ Days'
      });
    });

    return list.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }, [purchaseInvoices, supplierPayments]);

  const filteredPayables = useMemo(() => {
    return payablesData.filter(item => {
      if (!isDateInFilter(item.date)) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'due' && item.status === 'Settled') return false;
        if (statusFilter === 'settled' && item.status !== 'Settled') return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.supplierName.toLowerCase().includes(q) ||
          item.invoiceNo.toLowerCase().includes(q) ||
          item.itemDetails.toLowerCase().includes(q) ||
          item.supplierGst.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [payablesData, dateFilter, startDate, endDate, statusFilter, searchQuery]);

  const payablesSummary = useMemo(() => {
    let total = 0;
    let paid = 0;
    let outstanding = 0;
    let overdue30 = 0;

    filteredPayables.forEach(item => {
      total += item.totalAmount;
      paid += item.paidAmount;
      outstanding += item.balanceAmount;
      if (item.balanceAmount > 0 && item.agingDays > 30) {
        overdue30 += item.balanceAmount;
      }
    });

    return { total, paid, outstanding, overdue30 };
  }, [filteredPayables]);

  // ==========================================
  // 3. DATA COMPILATION - EXPENSES
  // ==========================================
  const filteredExpenses = useMemo(() => {
    return (dailyExpenses || []).filter(item => {
      if (!isDateInFilter(item.date)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          (item.category || '').toLowerCase().includes(q) ||
          (item.payee || '').toLowerCase().includes(q) ||
          (item.notes || '').toLowerCase().includes(q) ||
          (item.paymentMode || '').toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }, [dailyExpenses, dateFilter, startDate, endDate, searchQuery]);

  const expenseSummary = useMemo(() => {
    let total = 0;
    let cash = 0;
    let bank = 0;
    const categoryTotals = {};

    filteredExpenses.forEach(exp => {
      const amt = Number(exp.amount || 0);
      total += amt;
      if ((exp.paymentMode || '').toLowerCase().includes('cash')) {
        cash += amt;
      } else {
        bank += amt;
      }
      const cat = exp.category || 'General';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    });

    return { total, cash, bank, categoryTotals };
  }, [filteredExpenses]);

  // ==========================================
  // 4. GENERAL LEDGER (GL) - DOUBLE ENTRY LOGIC
  // ==========================================
  const glTransactions = useMemo(() => {
    const list = [];

    // Sales Invoices -> Dr Accounts Receivable / Cash, Cr Vehicle Sales Revenue, Cr Output GST
    (invoices || []).forEach(inv => {
      const dateStr = inv.invoiceDate || inv.createdOn || '';
      const total = Number(inv.grandTotal || inv.totalBeforeRoundoff || 0);
      const exShowroom = Number(inv.exShowroom || 0);
      const gstAmt = Number(inv.gstAmount || (total - exShowroom));
      const otherCharges = Math.max(0, total - exShowroom - gstAmt);

      list.push({
        id: `GL-INV-${inv.invoiceNo}-1`,
        date: dateStr,
        refNo: `INV-${inv.invoiceNo}`,
        accountHead: inv.paymentStatus === 'Fully Paid' ? '1010 - Cash / Bank A/C' : '1100 - Accounts Receivable',
        contraAccount: '4010 - Vehicle Sales & Tax',
        narration: `Vehicle Sale Invoice #${inv.invoiceNo} - ${inv.customerName || 'Customer'} (${inv.vehicleModel || ''})`,
        debit: total,
        credit: 0,
        category: 'Sales'
      });

      list.push({
        id: `GL-INV-${inv.invoiceNo}-2`,
        date: dateStr,
        refNo: `INV-${inv.invoiceNo}`,
        accountHead: '4010 - Vehicle Sales Revenue',
        contraAccount: '1100 - Accounts Receivable',
        narration: `Ex-Showroom Base Value (${inv.vehicleModel || ''})`,
        debit: 0,
        credit: exShowroom + otherCharges,
        category: 'Sales'
      });

      if (gstAmt > 0) {
        list.push({
          id: `GL-INV-${inv.invoiceNo}-3`,
          date: dateStr,
          refNo: `INV-${inv.invoiceNo}`,
          accountHead: '2020 - Output GST Liability (CGST & SGST)',
          contraAccount: '1100 - Accounts Receivable',
          narration: `GST collected on Vehicle Sale Invoice #${inv.invoiceNo}`,
          debit: 0,
          credit: gstAmt,
          category: 'Sales'
        });
      }
    });

    // Service Bills -> Dr Cash / Bank, Cr Service Revenue, Cr Spares Revenue, Cr Output GST
    (serviceBills || []).forEach(sb => {
      const dateStr = sb.date || '';
      const total = Number(sb.grandTotal || 0);
      const gstAmt = Number(sb.gst || 0);
      const laborAmt = (sb.laborItems || []).reduce((sum, l) => sum + Number(l.amount || 0), 0);
      const partsAmt = (sb.parts || []).reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.qty || 1)), 0);

      list.push({
        id: `GL-SB-${sb.id}-1`,
        date: dateStr,
        refNo: `SB-${sb.id}`,
        accountHead: '1010 - Cash / Bank Collection',
        contraAccount: '4030 - Service Income',
        narration: `Service Bill #${sb.id} - ${sb.customerName || 'Customer'} (${sb.vehicleNo || ''})`,
        debit: total,
        credit: 0,
        category: 'Service'
      });

      list.push({
        id: `GL-SB-${sb.id}-2`,
        date: dateStr,
        refNo: `SB-${sb.id}`,
        accountHead: '4030 - Service & Labor Income',
        contraAccount: '1010 - Cash / Bank',
        narration: `Labor Charges - Job Sheet #${sb.jobSheetId || sb.id}`,
        debit: 0,
        credit: laborAmt || (total - partsAmt - gstAmt),
        category: 'Service'
      });

      if (partsAmt > 0) {
        list.push({
          id: `GL-SB-${sb.id}-3`,
          date: dateStr,
          refNo: `SB-${sb.id}`,
          accountHead: '4020 - Spare Parts Sales Revenue',
          contraAccount: '1010 - Cash / Bank',
          narration: `Spares consumed in Service Bill #${sb.id}`,
          debit: 0,
          credit: partsAmt,
          category: 'Service'
        });
      }

      if (gstAmt > 0) {
        list.push({
          id: `GL-SB-${sb.id}-4`,
          date: dateStr,
          refNo: `SB-${sb.id}`,
          accountHead: '2020 - Output GST Liability (CGST & SGST)',
          contraAccount: '1010 - Cash / Bank',
          narration: `GST on Service Bill #${sb.id}`,
          debit: 0,
          credit: gstAmt,
          category: 'Service'
        });
      }
    });

    // Purchase Invoices -> Dr Purchases / Inventory, Dr Input GST (ITC), Cr Accounts Payable / Bank
    (purchaseInvoices || []).forEach(pur => {
      const dateStr = pur.date || '';
      const total = Number(pur.totalAmount || 0);
      const gstAmt = Number(pur.gstAmount || 0);
      const baseAmt = Math.max(0, total - gstAmt);

      const isSpare = (pur.purchaseType || '').toLowerCase().includes('spare');

      list.push({
        id: `GL-PUR-${pur.id}-1`,
        date: dateStr,
        refNo: pur.invoiceNo || `PUR-${pur.id}`,
        accountHead: isSpare ? '5020 - Spare Parts Purchases (COGS)' : '5010 - Vehicle Purchases (COGS)',
        contraAccount: '2010 - Accounts Payable',
        narration: `Inward Purchase from ${pur.supplierName || 'Supplier'} (${pur.itemDetails || ''})`,
        debit: baseAmt,
        credit: 0,
        category: 'Purchase'
      });

      if (gstAmt > 0) {
        list.push({
          id: `GL-PUR-${pur.id}-2`,
          date: dateStr,
          refNo: pur.invoiceNo || `PUR-${pur.id}`,
          accountHead: '2030 - Input Tax Credit (ITC - CGST/SGST)',
          contraAccount: '2010 - Accounts Payable',
          narration: `Eligible ITC on Purchase Bill #${pur.invoiceNo || pur.id}`,
          debit: gstAmt,
          credit: 0,
          category: 'Purchase'
        });
      }

      list.push({
        id: `GL-PUR-${pur.id}-3`,
        date: dateStr,
        refNo: pur.invoiceNo || `PUR-${pur.id}`,
        accountHead: pur.paymentStatus === 'Paid' ? '1020 - HDFC Bank Current A/C' : '2010 - Accounts Payable (Suppliers)',
        contraAccount: isSpare ? '5020 - Spare Purchases' : '5010 - Vehicle Purchases',
        narration: `Bill payable to ${pur.supplierName || 'Supplier'}`,
        debit: 0,
        credit: total,
        category: 'Purchase'
      });
    });

    // Expenses -> Dr Operating Expense, Cr Cash / Bank
    (dailyExpenses || []).forEach(exp => {
      const dateStr = exp.date || '';
      const amt = Number(exp.amount || 0);
      const isBank = (exp.paymentMode || '').toLowerCase().includes('bank') || (exp.paymentMode || '').toLowerCase().includes('upi');

      list.push({
        id: `GL-EXP-${exp.id}-1`,
        date: dateStr,
        refNo: `EXP-${exp.id}`,
        accountHead: `6000 - Operating Expense: ${exp.category || 'General'}`,
        contraAccount: isBank ? '1020 - HDFC Bank Current A/C' : '1010 - Cash on Hand',
        narration: `${exp.notes || exp.category || 'Expense'} - Paid to ${exp.payee || 'Vendor'}`,
        debit: amt,
        credit: 0,
        category: 'Expense'
      });

      list.push({
        id: `GL-EXP-${exp.id}-2`,
        date: dateStr,
        refNo: `EXP-${exp.id}`,
        accountHead: isBank ? '1020 - HDFC Bank Current A/C' : '1010 - Cash on Hand',
        contraAccount: `6000 - Operating Expense: ${exp.category || 'General'}`,
        narration: `Payment Voucher: ${exp.payee || ''} (${exp.paymentMode || 'Cash'})`,
        debit: 0,
        credit: amt,
        category: 'Expense'
      });
    });

    // Sort chronologically
    return list.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }, [invoices, serviceBills, purchaseInvoices, dailyExpenses]);

  const filteredGlTransactions = useMemo(() => {
    let runningBalance = 0;
    return glTransactions
      .filter(item => {
        if (!isDateInFilter(item.date)) return false;
        if (glAccountFilter !== 'all' && !item.accountHead.toLowerCase().includes(glAccountFilter.toLowerCase())) {
          return false;
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            item.accountHead.toLowerCase().includes(q) ||
            item.narration.toLowerCase().includes(q) ||
            item.refNo.toLowerCase().includes(q) ||
            item.contraAccount.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .map(item => {
        runningBalance += (item.debit - item.credit);
        return {
          ...item,
          runningBalance
        };
      });
  }, [glTransactions, dateFilter, startDate, endDate, glAccountFilter, searchQuery]);

  const glSummary = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    filteredGlTransactions.forEach(t => {
      totalDebit += t.debit;
      totalCredit += t.credit;
    });
    return {
      totalDebit,
      totalCredit,
      netDifference: totalDebit - totalCredit,
      count: filteredGlTransactions.length
    };
  }, [filteredGlTransactions]);

  // ==========================================
  // 5. TRIAL BALANCE (ACCOUNT BALANCES)
  // ==========================================
  const trialBalanceData = useMemo(() => {
    const accountMap = {};

    glTransactions.forEach(t => {
      if (!isDateInFilter(t.date)) return;
      const head = t.accountHead;
      if (!accountMap[head]) {
        let group = 'Expenses';
        if (head.startsWith('10') || head.startsWith('11') || head.startsWith('12')) group = 'Current Assets';
        else if (head.startsWith('20')) group = head.includes('ITC') ? 'Current Assets (ITC)' : 'Current Liabilities';
        else if (head.startsWith('30')) group = 'Equity & Capital';
        else if (head.startsWith('40')) group = 'Revenue / Income';
        else if (head.startsWith('50')) group = 'Cost of Goods Sold (COGS)';
        else if (head.startsWith('60')) group = 'Operating Expenses';

        accountMap[head] = {
          accountHead: head,
          group,
          debitTotal: 0,
          creditTotal: 0
        };
      }
      accountMap[head].debitTotal += t.debit;
      accountMap[head].creditTotal += t.credit;
    });

    const rows = Object.values(accountMap).map(acc => {
      const net = acc.debitTotal - acc.creditTotal;
      return {
        ...acc,
        netDebit: net > 0 ? net : 0,
        netCredit: net < 0 ? Math.abs(net) : 0
      };
    });

    return rows.sort((a, b) => a.accountHead.localeCompare(b.accountHead));
  }, [glTransactions, dateFilter, startDate, endDate]);

  const trialBalanceSummary = useMemo(() => {
    let totalDebits = 0;
    let totalCredits = 0;
    trialBalanceData.forEach(r => {
      totalDebits += r.netDebit;
      totalCredits += r.netCredit;
    });
    const difference = Math.abs(totalDebits - totalCredits);
    return {
      totalDebits,
      totalCredits,
      isBalanced: difference < 1,
      difference
    };
  }, [trialBalanceData]);

  // ==========================================
  // 6. PROFIT & LOSS STATEMENT (TRADING & OPERATING)
  // ==========================================
  const pnlData = useMemo(() => {
    // 1. REVENUE
    let vehicleSales = 0;
    let spareSales = 0;
    let serviceLabor = 0;

    (invoices || []).forEach(inv => {
      if (!isDateInFilter(inv.invoiceDate || inv.createdOn)) return;
      vehicleSales += Number(inv.exShowroom || 0);
    });

    (serviceBills || []).forEach(sb => {
      if (!isDateInFilter(sb.date)) return;
      const labor = (sb.laborItems || []).reduce((s, l) => s + Number(l.amount || 0), 0);
      const parts = (sb.parts || []).reduce((s, p) => s + (Number(p.price || 0) * Number(p.qty || 1)), 0);
      serviceLabor += labor || Math.max(0, Number(sb.grandTotal || 0) - parts - Number(sb.gst || 0));
      spareSales += parts;
    });

    const totalRevenue = vehicleSales + spareSales + serviceLabor;

    // 2. COST OF GOODS SOLD (COGS)
    let vehiclePurchases = 0;
    let sparePurchases = 0;

    (purchaseInvoices || []).forEach(pur => {
      if (!isDateInFilter(pur.date)) return;
      const base = Number(pur.totalAmount || 0) - Number(pur.gstAmount || 0);
      if ((pur.purchaseType || '').toLowerCase().includes('spare')) {
        sparePurchases += base;
      } else {
        vehiclePurchases += base;
      }
    });

    const totalCogs = vehiclePurchases + sparePurchases;
    const grossProfit = totalRevenue - totalCogs;
    const grossMarginPercent = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0';

    // 3. OPERATING EXPENSES
    const expenseBreakdown = {};
    let totalExpenses = 0;

    (dailyExpenses || []).forEach(exp => {
      if (!isDateInFilter(exp.date)) return;
      const amt = Number(exp.amount || 0);
      const cat = exp.category || 'General';
      expenseBreakdown[cat] = (expenseBreakdown[cat] || 0) + amt;
      totalExpenses += amt;
    });

    const netProfit = grossProfit - totalExpenses;
    const netMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

    return {
      revenue: {
        vehicleSales,
        spareSales,
        serviceLabor,
        totalRevenue
      },
      cogs: {
        vehiclePurchases,
        sparePurchases,
        totalCogs
      },
      grossProfit,
      grossMarginPercent,
      expenses: {
        breakdown: expenseBreakdown,
        totalExpenses
      },
      netProfit,
      netMarginPercent
    };
  }, [invoices, serviceBills, purchaseInvoices, dailyExpenses, dateFilter, startDate, endDate]);

  // ==========================================
  // 7. BALANCE SHEET STATEMENT
  // ==========================================
  const balanceSheetData = useMemo(() => {
    // Current Assets
    let cashBalance = 25000;
    let bankBalance = 150000;

    glTransactions.forEach(t => {
      if (t.accountHead.includes('1010 - Cash')) {
        cashBalance += (t.debit - t.credit);
      } else if (t.accountHead.includes('1020 - HDFC Bank')) {
        bankBalance += (t.debit - t.credit);
      }
    });

    // Accounts Receivable
    const totalReceivables = receivablesSummary.outstanding;

    // Inventory Value (Vehicles in stock + Spares in inventory)
    const spareStockValue = (spares || []).reduce((sum, sp) => sum + (Number(sp.stock || 0) * Number(sp.unitPrice || 0)), 0);
    const vehicleStockValue = 420000;
    const totalInventory = spareStockValue + vehicleStockValue;

    // GST ITC (Input Tax Credit Balance)
    let itcBalance = 0;
    (purchaseInvoices || []).forEach(p => {
      itcBalance += Number(p.gstAmount || 0);
    });

    const totalCurrentAssets = Math.max(0, cashBalance) + Math.max(0, bankBalance) + totalReceivables + totalInventory + itcBalance;

    // Fixed Assets
    const fixedAssets = 350000;
    const totalAssets = totalCurrentAssets + fixedAssets;

    // Current Liabilities
    const totalPayables = payablesSummary.outstanding;
    
    // Output GST Liability
    let gstOutputLiability = 0;
    (invoices || []).forEach(i => { gstOutputLiability += Number(i.gstAmount || 0); });
    (serviceBills || []).forEach(s => { gstOutputLiability += Number(s.gst || 0); });
    const netGstPayable = Math.max(0, gstOutputLiability - itcBalance);

    const totalCurrentLiabilities = totalPayables + netGstPayable;

    // Equity & Capital
    const initialCapital = 500000;
    const currentNetProfit = pnlData.netProfit;
    const retainedEarnings = totalAssets - totalCurrentLiabilities - initialCapital;
    const totalEquity = initialCapital + retainedEarnings;

    const totalLiabilitiesAndEquity = totalCurrentLiabilities + totalEquity;

    return {
      assets: {
        current: {
          cash: Math.max(0, cashBalance),
          bank: Math.max(0, bankBalance),
          receivables: totalReceivables,
          inventory: totalInventory,
          itcBalance,
          total: totalCurrentAssets
        },
        fixed: fixedAssets,
        total: totalAssets
      },
      liabilities: {
        current: {
          payables: totalPayables,
          gstPayable: netGstPayable,
          total: totalCurrentLiabilities
        },
        equity: {
          capital: initialCapital,
          retainedEarnings,
          total: totalEquity
        },
        total: totalLiabilitiesAndEquity
      },
      isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1
    };
  }, [glTransactions, receivablesSummary, payablesSummary, spares, invoices, serviceBills, purchaseInvoices, pnlData]);

  // ==========================================
  // 8. GST RETURNS (GSTR-1, GSTR-2B, GSTR-3B)
  // ==========================================
  const gstReturnsData = useMemo(() => {
    // GSTR-1: Outward Supplies
    const gstr1Rows = [];
    let b2bTotalTaxable = 0;
    let b2bCgst = 0;
    let b2bSgst = 0;
    let b2bTotal = 0;

    let b2cTotalTaxable = 0;
    let b2cCgst = 0;
    let b2cSgst = 0;
    let b2cTotal = 0;

    (invoices || []).forEach(inv => {
      if (!isDateInFilter(inv.invoiceDate || inv.createdOn)) return;
      const isB2B = Boolean(inv.customerGst && inv.customerGst.trim().length >= 15);
      const taxable = Number(inv.exShowroom || 0);
      const totalTax = Number(inv.gstAmount || 0);
      const cgst = totalTax / 2;
      const sgst = totalTax / 2;
      const invoiceVal = Number(inv.grandTotal || inv.totalBeforeRoundoff || 0);

      if (isB2B) {
        b2bTotalTaxable += taxable;
        b2bCgst += cgst;
        b2bSgst += sgst;
        b2bTotal += invoiceVal;
      } else {
        b2cTotalTaxable += taxable;
        b2cCgst += cgst;
        b2cSgst += sgst;
        b2cTotal += invoiceVal;
      }

      gstr1Rows.push({
        type: isB2B ? 'B2B Invoice' : 'B2C Small',
        gstin: inv.customerGst || 'Unregistered Consumer',
        receiverName: inv.customerName || 'Customer',
        invoiceNo: inv.invoiceNo,
        date: inv.invoiceDate || inv.createdOn,
        placeOfSupply: '33 - Tamil Nadu',
        rate: `${inv.gstRate || 5}%`,
        taxableValue: taxable,
        cgst,
        sgst,
        igst: 0,
        invoiceValue: invoiceVal,
        hsnCode: '87112029 (Two Wheelers)'
      });
    });

    (serviceBills || []).forEach(sb => {
      if (!isDateInFilter(sb.date)) return;
      const totalTax = Number(sb.gst || 0);
      const cgst = totalTax / 2;
      const sgst = totalTax / 2;
      const invoiceVal = Number(sb.grandTotal || 0);
      const taxable = invoiceVal - totalTax;

      b2cTotalTaxable += taxable;
      b2cCgst += cgst;
      b2cSgst += sgst;
      b2cTotal += invoiceVal;

      gstr1Rows.push({
        type: 'B2C Service',
        gstin: 'Unregistered Consumer',
        receiverName: sb.customerName || 'Service Customer',
        invoiceNo: `SB-${sb.id}`,
        date: sb.date,
        placeOfSupply: '33 - Tamil Nadu',
        rate: '18% / 5%',
        taxableValue: taxable,
        cgst,
        sgst,
        igst: 0,
        invoiceValue: invoiceVal,
        hsnCode: '9987 (Vehicle Repair Services)'
      });
    });

    // GSTR-2B: Inward Supplies / Eligible ITC
    const gstr2bRows = [];
    let itcTaxable = 0;
    let itcCgst = 0;
    let itcSgst = 0;
    let itcTotal = 0;

    (purchaseInvoices || []).forEach(pur => {
      if (!isDateInFilter(pur.date)) return;
      const total = Number(pur.totalAmount || 0);
      const totalTax = Number(pur.gstAmount || 0);
      const cgst = totalTax / 2;
      const sgst = totalTax / 2;
      const taxable = total - totalTax;

      itcTaxable += taxable;
      itcCgst += cgst;
      itcSgst += sgst;
      itcTotal += totalTax;

      gstr2bRows.push({
        supplierGstin: pur.supplierGst || '33AABCH1234F1Z5',
        supplierName: pur.supplierName || 'HMSI OEM',
        invoiceNo: pur.invoiceNo || `PUR-${pur.id}`,
        date: pur.date,
        taxableValue: taxable,
        rate: `${pur.gstRate || 5}%`,
        cgst,
        sgst,
        igst: 0,
        itcEligibility: 'Eligible ITC (Goods / Spares)',
        totalTax
      });
    });

    // GSTR-3B: Consolidated
    const totalOutwardTaxable = b2bTotalTaxable + b2cTotalTaxable;
    const totalOutwardCgst = b2bCgst + b2cCgst;
    const totalOutwardSgst = b2bSgst + b2cSgst;
    const totalOutwardTax = totalOutwardCgst + totalOutwardSgst;

    const netCgstPayable = Math.max(0, totalOutwardCgst - itcCgst);
    const netSgstPayable = Math.max(0, totalOutwardSgst - itcSgst);
    const netTotalTaxPayable = netCgstPayable + netSgstPayable;

    return {
      gstr1: {
        rows: gstr1Rows,
        b2b: { taxable: b2bTotalTaxable, cgst: b2bCgst, sgst: b2bSgst, total: b2bTotal },
        b2c: { taxable: b2cTotalTaxable, cgst: b2cCgst, sgst: b2cSgst, total: b2cTotal },
        totalTaxable: totalOutwardTaxable,
        totalTax: totalOutwardTax
      },
      gstr2b: {
        rows: gstr2bRows,
        taxable: itcTaxable,
        cgst: itcCgst,
        sgst: itcSgst,
        totalItc: itcTotal
      },
      gstr3b: {
        outwardTaxable: totalOutwardTaxable,
        outwardCgst: totalOutwardCgst,
        outwardSgst: totalOutwardSgst,
        outwardTotalTax: totalOutwardTax,
        itcCgst,
        itcSgst,
        itcTotal,
        netCgstPayable,
        netSgstPayable,
        netTotalTaxPayable
      }
    };
  }, [invoices, serviceBills, purchaseInvoices, dateFilter, startDate, endDate]);

  // ==========================================
  // 9. BANK / CASH & RECONCILIATION
  // ==========================================
  const bankAndCashData = useMemo(() => {
    const cashEntries = [];
    const bankEntries = [];

    // Sales Collections
    (invoices || []).forEach(inv => {
      const amt = Number(inv.grandTotal || inv.totalBeforeRoundoff || 0);
      const isPaid = inv.paymentStatus === 'Fully Paid';
      if (isPaid) {
        bankEntries.push({
          id: `BNK-INV-${inv.invoiceNo}`,
          date: inv.invoiceDate || inv.createdOn,
          type: 'Receipt / Inflow',
          category: 'Vehicle Sale Payment',
          party: inv.customerName || 'Customer',
          refNo: `INV-${inv.invoiceNo}`,
          inflow: amt,
          outflow: 0,
          account: 'HDFC Bank Current A/C (UPI / NetBanking)',
          isReconciled: !!reconciledItems[`BNK-INV-${inv.invoiceNo}`]
        });
      }
    });

    // Service Collections
    (serviceBills || []).forEach(sb => {
      const amt = Number(sb.grandTotal || 0);
      cashEntries.push({
        id: `CSH-SB-${sb.id}`,
        date: sb.date,
        type: 'Receipt / Inflow',
        category: 'Service Counter Collection',
        party: sb.customerName || 'Counter Customer',
        refNo: `SB-${sb.id}`,
        inflow: amt,
        outflow: 0,
        account: 'Cash Drawer / Peti',
        isReconciled: !!reconciledItems[`CSH-SB-${sb.id}`]
      });
    });

    // Supplier Payments
    (purchaseInvoices || []).forEach(pur => {
      if (pur.paymentStatus === 'Paid') {
        const amt = Number(pur.totalAmount || 0);
        bankEntries.push({
          id: `BNK-PUR-${pur.id}`,
          date: pur.date,
          type: 'Payment / Outflow',
          category: 'Supplier Inward Settlement',
          party: pur.supplierName || 'Supplier',
          refNo: pur.invoiceNo || `PUR-${pur.id}`,
          inflow: 0,
          outflow: amt,
          account: 'HDFC Bank RTGS / NEFT',
          isReconciled: !!reconciledItems[`BNK-PUR-${pur.id}`]
        });
      }
    });

    // Expenses
    (dailyExpenses || []).forEach(exp => {
      const amt = Number(exp.amount || 0);
      const isCash = (exp.paymentMode || '').toLowerCase().includes('cash');
      const entry = {
        id: `EXP-${exp.id}`,
        date: exp.date,
        type: 'Payment / Outflow',
        category: exp.category || 'Expense',
        party: exp.payee || 'Expense Vendor',
        refNo: `EXP-${exp.id}`,
        inflow: 0,
        outflow: amt,
        account: isCash ? 'Cash on Hand' : 'HDFC Bank Current A/C',
        isReconciled: !!reconciledItems[`EXP-${exp.id}`]
      };
      if (isCash) cashEntries.push(entry);
      else bankEntries.push(entry);
    });

    return {
      cashEntries: cashEntries.sort((a, b) => parseDate(b.date) - parseDate(a.date)),
      bankEntries: bankEntries.sort((a, b) => parseDate(b.date) - parseDate(a.date))
    };
  }, [invoices, serviceBills, purchaseInvoices, dailyExpenses, reconciledItems]);

  const toggleReconciliation = (id) => {
    setReconciledItems(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = {
          reconciledAt: new Date().toISOString(),
          clearedBy: 'Finance Executive'
        };
      }
      return next;
    });
  };

  // ==========================================
  // ACTION HANDLERS: ADD EXPENSE
  // ==========================================
  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!expenseFormData.amount || Number(expenseFormData.amount) <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    const newExp = {
      id: `EXP-${String(dailyExpenses.length + 1).padStart(2, '0')}`,
      category: expenseFormData.category,
      amount: Number(expenseFormData.amount),
      payee: expenseFormData.payee || 'Vendor / Staff',
      date: expenseFormData.date || new Date().toISOString().split('T')[0],
      paymentMode: expenseFormData.paymentMode,
      notes: expenseFormData.notes || ''
    };

    if (setDailyExpenses) {
      setDailyExpenses(prev => [newExp, ...(prev || [])]);
    }
    setIsExpenseModalOpen(false);
    setExpenseFormData({
      category: '',
      amount: '',
      payee: '',
      date: new Date().toISOString().split('T')[0],
      paymentMode: '',
      notes: ''
    });
  };

  // ==========================================
  // ACTION HANDLERS: RECEIVE CUSTOMER PAYMENT
  // ==========================================
  const handleSaveReceivePayment = (e) => {
    e.preventDefault();
    if (!selectedReceivableItem || !receivePaymentFormData.amount || Number(receivePaymentFormData.amount) <= 0) {
      alert('Please enter a valid collection amount.');
      return;
    }

    const receipt = {
      id: `RCPT-${Date.now()}`,
      docId: selectedReceivableItem.docId,
      docType: selectedReceivableItem.docType,
      customerName: selectedReceivableItem.customerName,
      amount: Number(receivePaymentFormData.amount),
      paymentMode: receivePaymentFormData.paymentMode,
      date: receivePaymentFormData.date,
      referenceNo: receivePaymentFormData.referenceNo || 'AUTO-RCPT',
      notes: receivePaymentFormData.notes
    };

    setPaymentCollections(prev => [receipt, ...prev]);

    // If fully cleared, mark invoice as paid if setter provided
    if (selectedReceivableItem.docType === 'Sales Invoice' && setInvoices) {
      setInvoices(prev => prev.map(inv => {
        if (String(inv.invoiceNo) === String(selectedReceivableItem.docId)) {
          return {
            ...inv,
            paymentStatus: Number(receivePaymentFormData.amount) >= selectedReceivableItem.balanceAmount ? 'Fully Paid' : 'Partially Paid'
          };
        }
        return inv;
      }));
    }

    setIsReceivePaymentModalOpen(false);
    setSelectedReceivableItem(null);
  };

  // ==========================================
  // ACTION HANDLERS: PAY SUPPLIER
  // ==========================================
  const handleSavePaySupplier = (e) => {
    e.preventDefault();
    if (!selectedPayableItem || !paySupplierFormData.amount || Number(paySupplierFormData.amount) <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const payLog = {
      id: `SPAY-${Date.now()}`,
      purchaseId: selectedPayableItem.purchaseId,
      supplierName: selectedPayableItem.supplierName,
      amount: Number(paySupplierFormData.amount),
      paymentMode: paySupplierFormData.paymentMode,
      date: paySupplierFormData.date,
      referenceNo: paySupplierFormData.referenceNo || 'BANK-TRF',
      notes: paySupplierFormData.notes
    };

    setSupplierPayments(prev => [payLog, ...prev]);

    if (setPurchaseInvoices) {
      setPurchaseInvoices(prev => prev.map(pur => {
        if (String(pur.id) === String(selectedPayableItem.purchaseId) || String(pur.invoiceNo) === String(selectedPayableItem.invoiceNo)) {
          return {
            ...pur,
            paymentStatus: Number(paySupplierFormData.amount) >= selectedPayableItem.balanceAmount ? 'Paid' : 'Partially Paid'
          };
        }
        return pur;
      }));
    }

    setIsPaySupplierModalOpen(false);
    setSelectedPayableItem(null);
  };

  // ==========================================
  // PRINT & EXPORT HANDLERS
  // ==========================================
  const handleExportCSV = () => {
    let rows = [];
    let filename = `Accounting_Report_${currentTab}_${new Date().toISOString().split('T')[0]}.csv`;

    if (currentTab === 'receivable') {
      rows = [
        ['Document Type', 'Doc Number', 'Customer Name', 'Phone', 'Invoice Date', 'Total Amount', 'Paid Amount', 'Balance Due', 'Aging Days', 'Status'],
        ...filteredReceivables.map(r => [r.docType, r.docId, r.customerName, r.customerPhone, r.date, r.totalAmount, r.paidAmount, r.balanceAmount, r.agingDays, r.status])
      ];
    } else if (currentTab === 'payable') {
      rows = [
        ['Supplier Name', 'GSTIN', 'Bill Number', 'Purchase Type', 'Item Particulars', 'Bill Date', 'Total Amount', 'Paid Amount', 'Balance Due', 'Aging Days', 'Status'],
        ...filteredPayables.map(r => [r.supplierName, r.supplierGst, r.invoiceNo, r.purchaseType, r.itemDetails, r.date, r.totalAmount, r.paidAmount, r.balanceAmount, r.agingDays, r.status])
      ];
    } else if (currentTab === 'expense') {
      rows = [
        ['Voucher ID', 'Category', 'Payee / Beneficiary', 'Date', 'Payment Mode', 'Amount (INR)', 'Notes'],
        ...filteredExpenses.map(r => [r.id, r.category, r.payee, r.date, r.paymentMode, r.amount, r.notes])
      ];
    } else if (currentTab === 'general-ledger') {
      rows = [
        ['Date', 'Ref / Voucher', 'Account Head', 'Contra Account', 'Description / Narration', 'Debit (INR)', 'Credit (INR)', 'Running Balance'],
        ...filteredGlTransactions.map(r => [r.date, r.refNo, r.accountHead, r.contraAccount, r.narration, r.debit, r.credit, r.runningBalance])
      ];
    } else if (currentTab === 'trial-balance') {
      rows = [
        ['Account Head', 'Account Group', 'Total Debits (INR)', 'Total Credits (INR)', 'Net Debit Balance', 'Net Credit Balance'],
        ...trialBalanceData.map(r => [r.accountHead, r.group, r.debitTotal, r.creditTotal, r.netDebit, r.netCredit])
      ];
    }

    if (rows.length === 0) {
      alert('No tabular data available for export in this view.');
      return;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="accounting-ledger-container" style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* ============================================================ */}
      {/* 2. NAVIGATION SUBTABS BAR */}
      {/* ============================================================ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        padding: '10px 14px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px',
        overflowX: 'auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
          {[
            { id: 'receivable', label: 'Receivable', icon: ArrowUpRight, count: filteredReceivables.filter(r => r.status !== 'Settled').length, color: '#f59e0b' },
            { id: 'payable', label: 'Payable', icon: ArrowDownRight, count: filteredPayables.filter(p => p.status !== 'Settled').length, color: '#ef4444' },
            { id: 'expense', label: 'Expense', icon: Receipt, count: dailyExpenses.length },
            { id: 'general-ledger', label: 'General Ledger', icon: Clipboard, count: filteredGlTransactions.length },
            { id: 'trial-balance', label: 'Trial Balance', icon: Scale },
            { id: 'pnl', label: 'P&L Statement', icon: TrendingUp },
            { id: 'balance-sheet', label: 'Balance Sheet', icon: Landmark },
            { id: 'gst', label: 'GST (1, 2B, 3B)', icon: ShieldCheck },
            { id: 'bank-cash', label: 'Bank/Cash & BRS', icon: Wallet }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSwitchTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#059669' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#475569',
                  boxShadow: isActive ? '0 2px 6px rgba(5,150,105,0.25)' : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#64748b',
                    fontWeight: 700
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              backgroundColor: '#065f46', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem'
            }}
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            type="button"
            onClick={handlePrintStatement}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem'
            }}
          >
            <Printer size={15} /> Print
          </button>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. UNIVERSAL FILTERS & DATE SELECTOR */}
      {/* ============================================================ */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '14px 18px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={`Search ${currentTab.replace('-', ' ')} records...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Date Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} color="#64748b" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                backgroundColor: '#ffffff',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Dates</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">Financial Year (FY)</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
            </div>
          )}

          {/* Status Filter for Receivables & Payables */}
          {(currentTab === 'receivable' || currentTab === 'payable') && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                backgroundColor: '#ffffff',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="due">Pending / Overdue</option>
              <option value="settled">Fully Settled</option>
            </select>
          )}

          {/* Account Filter for General Ledger */}
          {currentTab === 'general-ledger' && (
            <select
              value={glAccountFilter}
              onChange={(e) => setGlAccountFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                backgroundColor: '#ffffff',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer',
                maxWidth: '220px'
              }}
            >
              <option value="all">All GL Accounts</option>
              <option value="1010">1010 - Cash on Hand</option>
              <option value="1020">1020 - HDFC Bank Current A/C</option>
              <option value="1100">1100 - Accounts Receivable</option>
              <option value="2010">2010 - Accounts Payable</option>
              <option value="2020">2020 - Output GST Liability</option>
              <option value="2030">2030 - Input Tax Credit (ITC)</option>
              <option value="4010">4010 - Vehicle Sales Revenue</option>
              <option value="4020">4020 - Spare Parts Sales</option>
              <option value="4030">4030 - Service Income</option>
              <option value="5010">5010 - Vehicle Purchases (COGS)</option>
              <option value="5020">5020 - Spare Purchases (COGS)</option>
              <option value="6000">6000 - Operating Expenses</option>
            </select>
          )}
        </div>

        {/* Tab Specific Primary Action */}
        <div>
          {currentTab === 'expense' && (
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5,150,105,0.25)'
              }}
            >
              <Plus size={16} />
              <span>Add Expense Voucher</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: RECEIVABLE (ACCOUNTS RECEIVABLE) */}
      {/* ============================================================ */}
      {currentTab === 'receivable' && (
        <div>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Billed Value</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>
                ₹{receivablesSummary.total.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Sales Invoices + Service Bills</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Collected</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                ₹{receivablesSummary.collected.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Settled Collections</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #fef3c7', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>Outstanding Balance (Due)</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
                ₹{receivablesSummary.outstanding.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#92400e' }}>Customer Dues to be collected</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #fee2e2', borderLeft: '4px solid #ef4444' }}>
              <span style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600 }}>Aging Overdue (&gt;30 Days)</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
                ₹{(receivablesSummary.overdue30 + receivablesSummary.overdue60).toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>High Priority Collection</span>
            </div>
          </div>

          {/* Receivables Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                Accounts Receivable Ledger
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Showing {filteredReceivables.length} customer records
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '12px 16px' }}>Document #</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px' }}>Customer Name & Contact</th>
                    <th style={{ padding: '12px 16px' }}>Particulars</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total (₹)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Paid (₹)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Balance Due (₹)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Aging</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceivables.length > 0 ? (
                    filteredReceivables.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                          <span style={{ fontSize: '0.72rem', display: 'block', color: '#64748b' }}>{item.docType}</span>
                          #{item.docId}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {formatDateDisplay(item.date)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.customerPhone || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>
                          {item.particulars}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                          ₹{item.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                          ₹{item.paidAmount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: item.balanceAmount > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                          ₹{item.balanceAmount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            backgroundColor: item.agingDays > 60 ? '#fee2e2' : item.agingDays > 30 ? '#fef3c7' : '#e0f2fe',
                            color: item.agingDays > 60 ? '#b91c1c' : item.agingDays > 30 ? '#92400e' : '#0369a1'
                          }}>
                            {item.agingBucket} ({item.agingDays}d)
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: item.status === 'Settled' ? '#dcfce7' : item.status === 'Partially Paid' ? '#fef3c7' : '#fee2e2',
                            color: item.status === 'Settled' ? '#15803d' : item.status === 'Partially Paid' ? '#b45309' : '#b91c1c'
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {item.balanceAmount > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReceivableItem(item);
                                setReceivePaymentFormData({
                                  amount: item.balanceAmount,
                                  paymentMode: '',
                                  date: new Date().toISOString().split('T')[0],
                                  referenceNo: '',
                                  notes: `Payment for ${item.particulars}`
                                });
                                setIsReceivePaymentModalOpen(true);
                              }}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#059669',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Receive ₹
                            </button>
                          ) : (
                            <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>
                              ✓ Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                        No receivable records found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: PAYABLE (ACCOUNTS PAYABLE) */}
      {/* ============================================================ */}
      {currentTab === 'payable' && (
        <div>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Purchase Bills</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>
                ₹{payablesSummary.total.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>OEM Vehicles & Spares</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Settled / Paid</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                ₹{payablesSummary.paid.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Bank & RTGS Transfers</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #fee2e2', borderLeft: '4px solid #ef4444' }}>
              <span style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600 }}>Supplier Balance (Due)</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#b91c1c', marginTop: '4px' }}>
                ₹{payablesSummary.outstanding.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>Pending Vendor Settlements</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #fef3c7', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>Overdue &gt;30 Days</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
                ₹{payablesSummary.overdue30.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#92400e' }}>Vendor Aging Due</span>
            </div>
          </div>

          {/* Payables Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                Accounts Payable (Supplier Dues Ledger)
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Showing {filteredPayables.length} vendor bills
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '12px 16px' }}>Bill / Inv #</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px' }}>Supplier / Vendor Details</th>
                    <th style={{ padding: '12px 16px' }}>Purchase Type</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Bill Total (₹)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Paid Amount (₹)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Balance Due (₹)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Aging</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayables.length > 0 ? (
                    filteredPayables.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                          #{item.invoiceNo}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {formatDateDisplay(item.date)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.supplierName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>GSTIN: {item.supplierGst}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>
                          <span style={{ fontWeight: 600 }}>{item.purchaseType}</span>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b' }}>{item.itemDetails}</span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                          ₹{item.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                          ₹{item.paidAmount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: item.balanceAmount > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
                          ₹{item.balanceAmount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            backgroundColor: item.agingDays > 60 ? '#fee2e2' : item.agingDays > 30 ? '#fef3c7' : '#e0f2fe',
                            color: item.agingDays > 60 ? '#b91c1c' : item.agingDays > 30 ? '#92400e' : '#0369a1'
                          }}>
                            {item.agingBucket} ({item.agingDays}d)
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: item.status === 'Settled' ? '#dcfce7' : item.status === 'Partially Paid' ? '#fef3c7' : '#fee2e2',
                            color: item.status === 'Settled' ? '#15803d' : item.status === 'Partially Paid' ? '#b45309' : '#b91c1c'
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {item.balanceAmount > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPayableItem(item);
                                setPaySupplierFormData({
                                  amount: item.balanceAmount,
                                  paymentMode: '',
                                  date: new Date().toISOString().split('T')[0],
                                  referenceNo: '',
                                  notes: `Payment for Bill #${item.invoiceNo}`
                                });
                                setIsPaySupplierModalOpen(true);
                              }}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Pay Supplier
                            </button>
                          ) : (
                            <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>
                              ✓ Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                        No payable records found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: EXPENSE (DAILY & OPERATING EXPENSES) */}
      {/* ============================================================ */}
      {currentTab === 'expense' && (
        <div>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Operating Expenses</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
                ₹{expenseSummary.total.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{filteredExpenses.length} Expense Vouchers</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Cash Outflow</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>
                ₹{expenseSummary.cash.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cash Drawer Payments</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Bank / UPI Outflow</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                ₹{expenseSummary.bank.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Electronic Transfers</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Expense Categories</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {Object.keys(expenseSummary.categoryTotals).length}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Rent, Power, Tea, Salaries...</span>
            </div>
          </div>

          {/* Expense Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                Expense Register & Vouchers
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Showing {filteredExpenses.length} entries
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '12px 16px' }}>Voucher #</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px' }}>Category</th>
                    <th style={{ padding: '12px 16px' }}>Payee / Beneficiary</th>
                    <th style={{ padding: '12px 16px' }}>Payment Mode</th>
                    <th style={{ padding: '12px 16px' }}>Description / Notes</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount (₹)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                          #{item.id}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {formatDateDisplay(item.date)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            borderRadius: '6px',
                            fontWeight: 600,
                            fontSize: '0.78rem'
                          }}>
                            {item.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>
                          {item.payee}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>
                          {item.paymentMode || 'Cash'}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {item.notes || '--'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                          ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete expense #${item.id}?`)) {
                                if (setDailyExpenses) {
                                  setDailyExpenses(prev => prev.filter(e => e.id !== item.id));
                                }
                              }
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Delete expense"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                        No expense records found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: GENERAL LEDGER (GL) */}
      {/* ============================================================ */}
      {currentTab === 'general-ledger' && (
        <div>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Debit Turnover</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                ₹{glSummary.totalDebit.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Inward Asset & Expense Debits</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Credit Turnover</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                ₹{glSummary.totalCredit.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Revenue & Liability Credits</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Ledger Journal Count</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>
                {glSummary.count}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Verified Double-Entry Postings</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcfce7', borderLeft: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>System Balance Status</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                ✓ Synced
              </div>
              <span style={{ fontSize: '0.75rem', color: '#065f46' }}>Real-time Live Journal Engine</span>
            </div>
          </div>

          {/* GL Journal Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                General Ledger Journal
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Chronological double-entry transactions
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px' }}>Ref / Voucher</th>
                    <th style={{ padding: '12px 16px' }}>Account Head</th>
                    <th style={{ padding: '12px 16px' }}>Contra Account</th>
                    <th style={{ padding: '12px 16px' }}>Narration / Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Debit (₹)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Credit (₹)</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Running Bal (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGlTransactions.length > 0 ? (
                    filteredGlTransactions.map((t, idx) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {formatDateDisplay(t.date)}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                          {t.refNo}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>
                          {t.accountHead}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.78rem' }}>
                          {t.contraAccount}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>
                          {t.narration}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: t.debit > 0 ? '#059669' : '#cbd5e1' }}>
                          {t.debit > 0 ? `₹${t.debit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: t.credit > 0 ? '#2563eb' : '#cbd5e1' }}>
                          {t.credit > 0 ? `₹${t.credit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: t.runningBalance >= 0 ? '#0f172a' : '#dc2626' }}>
                          ₹{t.runningBalance.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                        No general ledger transactions found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: TRIAL BALANCE */}
      {/* ============================================================ */}
      {currentTab === 'trial-balance' && (
        <div>
          {/* Summary Indicator */}
          <div style={{
            backgroundColor: trialBalanceSummary.isBalanced ? '#dcfce7' : '#fee2e2',
            border: `1.5px solid ${trialBalanceSummary.isBalanced ? '#86efac' : '#fca5a5'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {trialBalanceSummary.isBalanced ? (
                <CheckCircle2 size={24} color="#15803d" />
              ) : (
                <AlertCircle size={24} color="#b91c1c" />
              )}
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: trialBalanceSummary.isBalanced ? '#15803d' : '#b91c1c' }}>
                  {trialBalanceSummary.isBalanced ? 'Trial Balance is Perfectly Balanced' : 'Trial Balance Discrepancy Detected'}
                </h4>
                <span style={{ fontSize: '0.8rem', color: trialBalanceSummary.isBalanced ? '#166534' : '#991b1b' }}>
                  {trialBalanceSummary.isBalanced
                    ? 'Total Debits match Total Credits according to standard Indian accounting standards.'
                    : `Difference of ₹${trialBalanceSummary.difference.toLocaleString('en-IN')} between Debits and Credits.`}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#475569', display: 'block' }}>Total Debits</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                  ₹{trialBalanceSummary.totalDebits.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '20px' }}>
                <span style={{ fontSize: '0.75rem', color: '#475569', display: 'block' }}>Total Credits</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>
                  ₹{trialBalanceSummary.totalCredits.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Trial Balance Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>
                Summary Trial Balance Sheet
              </h3>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Account Code & Head</th>
                  <th style={{ padding: '12px 16px' }}>Classification Group</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Gross Debit (₹)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Gross Credit (₹)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Net Debit Balance (₹)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Net Credit Balance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {trialBalanceData.map((row, idx) => (
                  <tr key={row.accountHead} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>
                      {row.accountHead}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontSize: '0.75rem', fontWeight: 600 }}>
                        {row.group}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>
                      ₹{row.debitTotal.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>
                      ₹{row.creditTotal.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: row.netDebit > 0 ? '#059669' : '#94a3b8' }}>
                      {row.netDebit > 0 ? `₹${row.netDebit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: row.netCredit > 0 ? '#2563eb' : '#94a3b8' }}>
                      {row.netCredit > 0 ? `₹${row.netCredit.toLocaleString('en-IN')}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f1f5f9', borderTop: '2px solid #cbd5e1', fontWeight: 800 }}>
                  <td colSpan={4} style={{ padding: '14px 16px', textAlign: 'right', color: '#1e293b' }}>
                    GRAND TOTAL BALANCES:
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#059669', fontSize: '1rem' }}>
                    ₹{trialBalanceSummary.totalDebits.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', color: '#2563eb', fontSize: '1rem' }}>
                    ₹{trialBalanceSummary.totalCredits.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: P&L (PROFIT & LOSS STATEMENT) */}
      {/* ============================================================ */}
      {currentTab === 'pnl' && (
        <div>
          {/* P&L Header KPI banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Operating Revenue</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                ₹{pnlData.revenue.totalRevenue.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Vehicle Sales + Spares + Service</span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Gross Profit</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                ₹{pnlData.grossProfit.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                Gross Margin: {pnlData.grossMarginPercent}%
              </span>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Operating Expenses</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
                ₹{pnlData.expenses.totalExpenses.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Rent, Power, Salaries, Overheads</span>
            </div>

            <div style={{
              backgroundColor: pnlData.netProfit >= 0 ? '#dcfce7' : '#fee2e2',
              padding: '18px',
              borderRadius: '12px',
              border: `1px solid ${pnlData.netProfit >= 0 ? '#86efac' : '#fca5a5'}`
            }}>
              <span style={{ fontSize: '0.8rem', color: pnlData.netProfit >= 0 ? '#15803d' : '#991b1b', fontWeight: 600 }}>
                NET PROFIT / (LOSS)
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: pnlData.netProfit >= 0 ? '#15803d' : '#b91c1c', marginTop: '4px' }}>
                ₹{pnlData.netProfit.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '0.75rem', color: pnlData.netProfit >= 0 ? '#15803d' : '#991b1b', fontWeight: 700 }}>
                Net Margin: {pnlData.netMarginPercent}%
              </span>
            </div>
          </div>

          {/* Structured P&L Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
                Trading and Profit & Loss Statement
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                For the period ending {new Date().toLocaleDateString('en-IN')}
              </span>
            </div>

            <div style={{ padding: '20px' }}>
              {/* SECTION 1: TRADING ACCOUNT / REVENUE */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Operating Revenue & Income
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Vehicle Sales Turnover (Ex-Showroom Base)</span>
                    <span style={{ fontWeight: 700 }}>₹{pnlData.revenue.vehicleSales.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Spare Parts Retail & Workshop Sales</span>
                    <span style={{ fontWeight: 700 }}>₹{pnlData.revenue.spareSales.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Vehicle Service Labor & Checkup Charges</span>
                    <span style={{ fontWeight: 700 }}>₹{pnlData.revenue.serviceLabor.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', fontWeight: 800, color: '#059669' }}>
                    <span>TOTAL REVENUE (A)</span>
                    <span>₹{pnlData.revenue.totalRevenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: COST OF GOODS SOLD */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Cost of Goods Sold (COGS)
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>OEM Vehicle Purchases from Manufacturer</span>
                    <span style={{ fontWeight: 700 }}>₹{pnlData.cogs.vehiclePurchases.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Spare Parts & Lubricants Inward Consignments</span>
                    <span style={{ fontWeight: 700 }}>₹{pnlData.cogs.sparePurchases.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', fontWeight: 800, color: '#dc2626' }}>
                    <span>TOTAL COST OF SALES (B)</span>
                    <span>₹{pnlData.cogs.totalCogs.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* GROSS PROFIT HIGHLIGHT */}
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                borderRadius: '8px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#065f46' }}>GROSS PROFIT (A - B)</span>
                  <span style={{ fontSize: '0.8rem', color: '#059669', display: 'block' }}>Margin on direct cost: {pnlData.grossMarginPercent}%</span>
                </div>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#065f46' }}>
                  ₹{pnlData.grossProfit.toLocaleString('en-IN')}
                </span>
              </div>

              {/* SECTION 3: OPERATING EXPENSES */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  3. Operating & Administrative Expenses
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  {Object.entries(pnlData.expenses.breakdown).map(([cat, amt]) => (
                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 16px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#334155' }}>{cat} Expense</span>
                      <span style={{ fontWeight: 600 }}>₹{amt.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f8fafc', fontWeight: 800, color: '#dc2626' }}>
                    <span>TOTAL OPERATING EXPENSES (C)</span>
                    <span>₹{pnlData.expenses.totalExpenses.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* NET PROFIT FINAL TOTAL */}
              <div style={{
                backgroundColor: pnlData.netProfit >= 0 ? '#15803d' : '#b91c1c',
                borderRadius: '8px',
                padding: '16px 20px',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>NET PROFIT / LOSS FOR PERIOD (Gross Profit - C)</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.9, display: 'block' }}>Net Profit Margin: {pnlData.netMarginPercent}%</span>
                </div>
                <span style={{ fontSize: '1.6rem', fontWeight: 900 }}>
                  ₹{pnlData.netProfit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: BALANCE SHEET */}
      {/* ============================================================ */}
      {currentTab === 'balance-sheet' && (
        <div>
          {/* Balance Sheet Equation Verification */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scale size={20} color="#059669" />
              <div>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Accounting Equation Check:</span>
                <span style={{ fontWeight: 800, color: '#1e293b', marginLeft: '6px' }}>
                  Assets (₹{balanceSheetData.assets.total.toLocaleString('en-IN')}) = Liabilities & Equity (₹{balanceSheetData.liabilities.total.toLocaleString('en-IN')})
                </span>
              </div>
            </div>
            <span style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: '#dcfce7',
              color: '#15803d'
            }}>
              ✓ Perfectly Balanced
            </span>
          </div>

          {/* Two-Column Assets vs Liabilities Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            
            {/* LEFT COLUMN: ASSETS */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', backgroundColor: '#ecfdf5', borderBottom: '1px solid #a7f3d0' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#065f46' }}>
                  ASSETS
                </h3>
              </div>

              <div style={{ padding: '16px' }}>
                {/* Current Assets */}
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Current Assets
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Cash on Hand (Till & Drawer)</span>
                    <span style={{ fontWeight: 600 }}>₹{balanceSheetData.assets.current.cash.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>HDFC Bank Current Account</span>
                    <span style={{ fontWeight: 600 }}>₹{balanceSheetData.assets.current.bank.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Accounts Receivable (Customer Dues)</span>
                    <span style={{ fontWeight: 600 }}>₹{balanceSheetData.assets.current.receivables.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Inventories (Vehicles + Spares in Stock)</span>
                    <span style={{ fontWeight: 600 }}>₹{balanceSheetData.assets.current.inventory.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>GST Input Tax Credit (ITC Available)</span>
                    <span style={{ fontWeight: 600 }}>₹{balanceSheetData.assets.current.itcBalance.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#f8fafc', fontWeight: 700 }}>
                    <span>Total Current Assets</span>
                    <span style={{ color: '#059669' }}>₹{balanceSheetData.assets.current.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Fixed Assets */}
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Fixed & Tangible Assets
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Showroom Fixtures, Hydraulic Ramps & Diagnostics</span>
                    <span style={{ fontWeight: 600 }}>₹{balanceSheetData.assets.fixed.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#f8fafc', fontWeight: 700 }}>
                    <span>Total Fixed Assets</span>
                    <span style={{ color: '#059669' }}>₹{balanceSheetData.assets.fixed.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* TOTAL ASSETS */}
                <div style={{
                  backgroundColor: '#065f46',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}>
                  <span>TOTAL ASSETS</span>
                  <span>₹{balanceSheetData.assets.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LIABILITIES & EQUITY */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e40af' }}>
                  LIABILITIES & EQUITY
                </h3>
              </div>

              <div style={{ padding: '16px' }}>
                {/* Current Liabilities */}
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Current Liabilities
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Accounts Payable (Supplier Dues)</span>
                    <span style={{ fontWeight: 600 }}>₹{balanceSheetData.liabilities.current.payables.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Net GST Output Liability Payable</span>
                    <span style={{ fontWeight: 600 }}>₹{balanceSheetData.liabilities.current.gstPayable.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#f8fafc', fontWeight: 700 }}>
                    <span>Total Current Liabilities</span>
                    <span style={{ color: '#dc2626' }}>₹{balanceSheetData.liabilities.current.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Owner Equity & Retained Earnings */}
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Owner's Equity & Capital
                </h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Proprietor Capital Account</span>
                    <span style={{ fontWeight: 600 }}>₹{balanceSheetData.liabilities.equity.capital.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>Retained Earnings & Reserves</span>
                    <span style={{ fontWeight: 600 }}>₹{balanceSheetData.liabilities.equity.retainedEarnings.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#f8fafc', fontWeight: 700 }}>
                    <span>Total Equity</span>
                    <span style={{ color: '#2563eb' }}>₹{balanceSheetData.liabilities.equity.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* TOTAL LIABILITIES & EQUITY */}
                <div style={{
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}>
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <span>₹{balanceSheetData.liabilities.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 8: GST REPORTS (GSTR-1, GSTR-2B, GSTR-3B) */}
      {/* ============================================================ */}
      {currentTab === 'gst' && (
        <div>
          {/* GST Sub-Tabs (GSTR-1 | GSTR-2B | GSTR-3B) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[
              { id: 'gstr-1', label: 'GSTR-1 (Outward Supplies / Sales)', desc: 'Vehicle & Service Invoices' },
              { id: 'gstr-2b', label: 'GSTR-2B (Inward Supplies / Eligible ITC)', desc: 'Purchase Input Tax Credit' },
              { id: 'gstr-3b', label: 'GSTR-3B (Monthly Tax Settlement)', desc: 'Net Tax Payable Summary' }
            ].map(sub => {
              const isActive = gstSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setGstSubTab(sub.id)}
                  style={{
                    flex: '1 1 240px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: isActive ? '2px solid #059669' : '1px solid #e2e8f0',
                    backgroundColor: isActive ? '#ecfdf5' : '#ffffff',
                    color: isActive ? '#065f46' : '#475569',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{sub.label}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>{sub.desc}</div>
                </button>
              );
            })}
          </div>

          {/* GSTR-1 VIEW */}
          {gstSubTab === 'gstr-1' && (
            <div>
              {/* KPI cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Outward Taxable Value</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>
                    ₹{gstReturnsData.gstr1.totalTaxable.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total CGST (Outward)</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    ₹{(gstReturnsData.gstr1.totalTax / 2).toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total SGST (Outward)</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    ₹{(gstReturnsData.gstr1.totalTax / 2).toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Output GST Liability</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
                    ₹{gstReturnsData.gstr1.totalTax.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* GSTR-1 Table */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                    GSTR-1 Outward Supplies Schedule (B2B & B2C)
                  </h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                        <th style={{ padding: '12px 14px' }}>Table / Type</th>
                        <th style={{ padding: '12px 14px' }}>Invoice #</th>
                        <th style={{ padding: '12px 14px' }}>Date</th>
                        <th style={{ padding: '12px 14px' }}>Receiver / GSTIN</th>
                        <th style={{ padding: '12px 14px' }}>HSN Code</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Taxable Value (₹)</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>CGST (₹)</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>SGST (₹)</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Invoice Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gstReturnsData.gstr1.rows.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontSize: '0.72rem', fontWeight: 600 }}>
                              {row.type}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700 }}>{row.invoiceNo}</td>
                          <td style={{ padding: '12px 14px', color: '#64748b' }}>{formatDateDisplay(row.date)}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600 }}>{row.receiverName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.gstin}</div>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569', fontSize: '0.78rem' }}>{row.hsnCode}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>₹{row.taxableValue.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', color: '#059669' }}>₹{row.cgst.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', color: '#059669' }}>₹{row.sgst.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>₹{row.invoiceValue.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* GSTR-2B VIEW */}
          {gstSubTab === 'gstr-2b' && (
            <div>
              {/* KPI cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Inward Purchase Taxable Value</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>
                    ₹{gstReturnsData.gstr2b.taxable.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Eligible CGST ITC</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    ₹{gstReturnsData.gstr2b.cgst.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Eligible SGST ITC</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    ₹{gstReturnsData.gstr2b.sgst.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Total Input Tax Credit (ITC)</span>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                    ₹{gstReturnsData.gstr2b.totalItc.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* GSTR-2B Table */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                    GSTR-2B Auto-Drafted Input Tax Credit (ITC) Statement
                  </h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                        <th style={{ padding: '12px 14px' }}>Supplier GSTIN</th>
                        <th style={{ padding: '12px 14px' }}>Supplier Name</th>
                        <th style={{ padding: '12px 14px' }}>Invoice #</th>
                        <th style={{ padding: '12px 14px' }}>Date</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Taxable (₹)</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>CGST ITC (₹)</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>SGST ITC (₹)</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>ITC Eligibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gstReturnsData.gstr2b.rows.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0369a1' }}>{row.supplierGstin}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>{row.supplierName}</td>
                          <td style={{ padding: '12px 14px' }}>{row.invoiceNo}</td>
                          <td style={{ padding: '12px 14px', color: '#64748b' }}>{formatDateDisplay(row.date)}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>₹{row.taxableValue.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>₹{row.cgst.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>₹{row.sgst.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 700 }}>
                              ✓ Eligible
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* GSTR-3B VIEW */}
          {gstSubTab === 'gstr-3b' && (
            <div>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
                    GSTR-3B Monthly Consolidated Return & Tax Offset Summary
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Government statutory settlement schedule
                  </span>
                </div>

                <div style={{ padding: '20px' }}>
                  {/* Table 3.1: Outward Supplies */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                      Table 3.1: Details of Outward Supplies & Tax Liability
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>
                          <th style={{ padding: '10px 14px', textAlign: 'left' }}>Nature of Supplies</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Taxable Value (₹)</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>Central Tax (CGST)</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>State Tax (SGST)</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Tax Liability (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '10px 14px', fontWeight: 600 }}>Outward Taxable Supplies (Other than zero rated & nil)</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>₹{gstReturnsData.gstr3b.outwardTaxable.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: '#059669', fontWeight: 700 }}>₹{gstReturnsData.gstr3b.outwardCgst.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: '#059669', fontWeight: 700 }}>₹{gstReturnsData.gstr3b.outwardSgst.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>₹{gstReturnsData.gstr3b.outwardTotalTax.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Table 4: Eligible ITC */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                      Table 4: Eligible Input Tax Credit (ITC Claimed)
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>
                          <th style={{ padding: '10px 14px', textAlign: 'left' }}>Details of ITC</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>Central Tax (CGST)</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>State Tax (SGST)</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Eligible ITC (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '10px 14px', fontWeight: 600 }}>(A) ITC Available (Inward supplies from GSTR-2B)</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: '#059669', fontWeight: 700 }}>₹{gstReturnsData.gstr3b.itcCgst.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: '#059669', fontWeight: 700 }}>₹{gstReturnsData.gstr3b.itcSgst.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: '#2563eb', fontWeight: 800 }}>₹{gstReturnsData.gstr3b.itcTotal.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Table 6.1: Net Tax Settlement */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                        Table 6.1: Net GST Tax Payable in Cash
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Calculated as: Outward Tax Liability - Eligible Input Tax Credit
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Net Cash Ledger Settlement</span>
                      <span style={{ fontSize: '1.55rem', fontWeight: 900, color: '#dc2626' }}>
                        ₹{gstReturnsData.gstr3b.netTotalTaxPayable.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 9: BANK / CASH & RECONCILIATION */}
      {/* ============================================================ */}
      {currentTab === 'bank-cash' && (
        <div>
          {/* Sub-Switchers: Cash Book vs Bank Book vs BRS */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[
              { id: 'reconciliation', label: 'Bank Reconciliation (BRS)', count: bankAndCashData.bankEntries.filter(e => !e.isReconciled).length },
              { id: 'bank-book', label: 'HDFC Bank Account Ledger', count: bankAndCashData.bankEntries.length },
              { id: 'cash-book', label: 'Cash-in-Hand Book', count: bankAndCashData.cashEntries.length }
            ].map(sub => {
              const isActive = bankSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setBankSubTab(sub.id)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.86rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#059669' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    boxShadow: isActive ? '0 2px 6px rgba(5,150,105,0.25)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{sub.label}</span>
                  {sub.count > 0 && (
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                      color: isActive ? '#ffffff' : '#64748b',
                      fontWeight: 700
                    }}>
                      {sub.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* BRS VIEW */}
          {bankSubTab === 'reconciliation' && (
            <div>
              {/* BRS Status Banner */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '18px 20px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Bank Account</span>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem', marginTop: '2px' }}>
                    {companyProfile.bankName || 'HDFC Bank'} - Current A/C
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>A/C: {companyProfile.accountNumber || '50200088991234'}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Reconciled Transactions</span>
                  <div style={{ fontWeight: 800, color: '#059669', fontSize: '1.35rem', marginTop: '2px' }}>
                    {bankAndCashData.bankEntries.filter(e => e.isReconciled).length} / {bankAndCashData.bankEntries.length}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Uncleared / In-Transit</span>
                  <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '1.35rem', marginTop: '2px' }}>
                    {bankAndCashData.bankEntries.filter(e => !e.isReconciled).length}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: bankAndCashData.bankEntries.every(e => e.isReconciled) ? '#dcfce7' : '#fef3c7',
                    color: bankAndCashData.bankEntries.every(e => e.isReconciled) ? '#15803d' : '#b45309'
                  }}>
                    {bankAndCashData.bankEntries.every(e => e.isReconciled) ? '✓ Fully Reconciled' : '⚠️ Unreconciled Entries Pending'}
                  </span>
                </div>
              </div>

              {/* BRS Table */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                    Bank Statement Clearing Register
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Click toggle to mark entry as reconciled with bank passbook
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                        <th style={{ padding: '12px 14px' }}>Date</th>
                        <th style={{ padding: '12px 14px' }}>Voucher / Ref #</th>
                        <th style={{ padding: '12px 14px' }}>Party / Description</th>
                        <th style={{ padding: '12px 14px' }}>Category</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Deposit / Inflow (₹)</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Withdrawal / Outflow (₹)</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>Reconciliation Status</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankAndCashData.bankEntries.map((row, idx) => (
                        <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                          <td style={{ padding: '12px 14px', color: '#64748b' }}>{formatDateDisplay(row.date)}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700 }}>{row.refNo}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 600 }}>{row.party}</td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>{row.category}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: row.inflow > 0 ? '#059669' : '#cbd5e1' }}>
                            {row.inflow > 0 ? `₹${row.inflow.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: row.outflow > 0 ? '#dc2626' : '#cbd5e1' }}>
                            {row.outflow > 0 ? `₹${row.outflow.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: row.isReconciled ? '#dcfce7' : '#fee2e2',
                              color: row.isReconciled ? '#15803d' : '#b91c1c'
                            }}>
                              {row.isReconciled ? '✓ Reconciled' : 'Pending'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => toggleReconciliation(row.id)}
                              style={{
                                padding: '4px 10px',
                                backgroundColor: row.isReconciled ? '#f1f5f9' : '#059669',
                                color: row.isReconciled ? '#475569' : '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {row.isReconciled ? 'Unmark' : 'Mark Cleared'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* BANK BOOK VIEW */}
          {bankSubTab === 'bank-book' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                  HDFC Bank Operating Account Journal
                </h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '12px 14px' }}>Date</th>
                    <th style={{ padding: '12px 14px' }}>Ref / Cheque #</th>
                    <th style={{ padding: '12px 14px' }}>Beneficiary / Payer</th>
                    <th style={{ padding: '12px 14px' }}>Particulars</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Deposit (₹)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Withdrawal (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {bankAndCashData.bankEntries.map((row, idx) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{formatDateDisplay(row.date)}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{row.refNo}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{row.party}</td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{row.category}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        {row.inflow > 0 ? `₹${row.inflow.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                        {row.outflow > 0 ? `₹${row.outflow.toLocaleString('en-IN')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CASH BOOK VIEW */}
          {bankSubTab === 'cash-book' && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                  Cash-in-Hand (Peti / Drawer) Register
                </h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '12px 14px' }}>Date</th>
                    <th style={{ padding: '12px 14px' }}>Voucher #</th>
                    <th style={{ padding: '12px 14px' }}>Party / Payer</th>
                    <th style={{ padding: '12px 14px' }}>Particulars</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Cash In (₹)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Cash Out (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {bankAndCashData.cashEntries.map((row, idx) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{formatDateDisplay(row.date)}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>{row.refNo}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{row.party}</td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{row.category}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        {row.inflow > 0 ? `₹${row.inflow.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                        {row.outflow > 0 ? `₹${row.outflow.toLocaleString('en-IN')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: ADD EXPENSE VOUCHER */}
      {/* ============================================================ */}
      {isExpenseModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 24px', backgroundColor: '#065f46', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Record Daily Expense Voucher</h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Expense Category *
                </label>
                <select
                  value={expenseFormData.category}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="Rent">Showroom Rent</option>
                  <option value="Electricity">Electricity / Power</option>
                  <option value="Salaries">Staff Salaries & Incentives</option>
                  <option value="Refreshments & Tea">Refreshments & Tea Stall</option>
                  <option value="Fuel & Transport">Fuel & Transport</option>
                  <option value="Maintenance & Tools">Workshop Tools & Maintenance</option>
                  <option value="Stationery & Printing">Stationery & Printing</option>
                  <option value="Marketing & Promo">Marketing & Advertising</option>
                  <option value="General & Misc">General & Miscellaneous</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                    
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseFormData.date}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Payee / Beneficiary
                  </label>
                  <input
                    type="text"
                    value={expenseFormData.payee}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, payee: e.target.value })}
                    
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Payment Mode
                  </label>
                  <select
                    value={expenseFormData.paymentMode}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, paymentMode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    <option value="Cash">Cash on Hand</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Notes / Particulars
                </label>
                <textarea
                  rows={2}
                  value={expenseFormData.notes}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, notes: e.target.value })}
                  
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  Save Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: RECEIVE CUSTOMER PAYMENT */}
      {/* ============================================================ */}
      {isReceivePaymentModalOpen && selectedReceivableItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '500px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '18px 24px', backgroundColor: '#059669', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Record Customer Collection</h3>
                <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>{selectedReceivableItem.docType} #{selectedReceivableItem.docId}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsReceivePaymentModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReceivePayment} style={{ padding: '24px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Customer:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedReceivableItem.customerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Pending Balance Due:</span>
                  <span style={{ fontWeight: 800, color: '#dc2626' }}>₹{selectedReceivableItem.balanceAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedReceivableItem.balanceAmount}
                  value={receivePaymentFormData.amount}
                  onChange={(e) => setReceivePaymentFormData({ ...receivePaymentFormData, amount: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Payment Mode
                  </label>
                  <select
                    value={receivePaymentFormData.paymentMode}
                    onChange={(e) => setReceivePaymentFormData({ ...receivePaymentFormData, paymentMode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    <option value="Cash">Cash on Hand</option>
                    <option value="Bank Transfer / UPI">Bank Transfer / UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit/Debit Card">Card POS</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Receipt Date
                  </label>
                  <input
                    type="date"
                    required
                    value={receivePaymentFormData.date}
                    onChange={(e) => setReceivePaymentFormData({ ...receivePaymentFormData, date: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Transaction UTR / Cheque Ref No
                </label>
                <input
                  type="text"
                  value={receivePaymentFormData.referenceNo}
                  onChange={(e) => setReceivePaymentFormData({ ...receivePaymentFormData, referenceNo: e.target.value })}
                  
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsReceivePaymentModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: PAY SUPPLIER */}
      {/* ============================================================ */}
      {isPaySupplierModalOpen && selectedPayableItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '500px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '18px 24px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Record Supplier Payment</h3>
                <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>Bill #{selectedPayableItem.invoiceNo}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPaySupplierModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePaySupplier} style={{ padding: '24px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Supplier:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedPayableItem.supplierName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Bill Due Balance:</span>
                  <span style={{ fontWeight: 800, color: '#dc2626' }}>₹{selectedPayableItem.balanceAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Amount to Pay (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedPayableItem.balanceAmount}
                  value={paySupplierFormData.amount}
                  onChange={(e) => setPaySupplierFormData({ ...paySupplierFormData, amount: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Payment Mode
                  </label>
                  <select
                    value={paySupplierFormData.paymentMode}
                    onChange={(e) => setPaySupplierFormData({ ...paySupplierFormData, paymentMode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    <option value="Bank Transfer (RTGS/NEFT)">Bank RTGS / NEFT</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="Cheque">Company Cheque</option>
                    <option value="Cash">Cash Payment</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Payment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={paySupplierFormData.date}
                    onChange={(e) => setPaySupplierFormData({ ...paySupplierFormData, date: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Bank Reference / UTR No
                </label>
                <input
                  type="text"
                  value={paySupplierFormData.referenceNo}
                  onChange={(e) => setPaySupplierFormData({ ...paySupplierFormData, referenceNo: e.target.value })}
                  
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsPaySupplierModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
