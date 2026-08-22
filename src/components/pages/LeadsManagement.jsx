import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Phone, CheckCircle, Trash2, Calendar, Clipboard, Calculator, Printer, FileCode, Edit2, MessageCircle, BarChart3, Download, Filter, TrendingUp, DollarSign, FileDown } from 'lucide-react';
import PrintPreviewModal from '../PrintPreviewModal';
import { generateQuotationPdfAndShare, generateInvoicePdfAndShare } from '../../utils/pdfShareUtil';
import { API_BASE_URL } from '../../config/api';

export default function LeadsManagement({
  activeSubTab,
  setActiveSubTab,
  leads = [],
  setLeads,
  addLead,
  updateLead,
  deleteLead,
  addCustomer,
  vehicles = [],
  showPreviews = true,
  invoices = [],
  addInvoice,
  deleteInvoice,
  quotations = [],
  addQuotation,
  deleteQuotation
}) {
  const [printModalConfig, setPrintModalConfig] = useState({ isOpen: false, type: 'invoice', data: null });

  // Dynamic Vehicle Data Registry for Dropdowns built from active database list
  const vehicleList = React.useMemo(() => {
    const activeVehicles = vehicles && vehicles.length > 0 ? vehicles : [
      { id: 'VEH-01', brand: 'Honda', model: 'Activa 6G', color: 'Blue', hsnCode: '87112029' },
      { id: 'VEH-02', brand: 'Honda', model: 'Shine 125', color: 'Black', hsnCode: '87112029' },
      { id: 'VEH-03', brand: 'Honda', model: 'SP 125', color: 'Red', hsnCode: '87112029' }
    ];

    const grouped = {};
    activeVehicles.forEach(v => {
      const name = `${v.brand} ${v.model}`;
      if (!grouped[name]) {
        const staticMatch = [
          { name: 'Honda Activa 6G', basePrice: 82000 },
          { name: 'Honda Shine 125', basePrice: 89000 },
          { name: 'Honda SP 125', basePrice: 94000 },
          { name: 'Honda Unicorn 160', basePrice: 115000 },
          { name: 'Honda Hornet 2.0', basePrice: 145000 }
        ].find(s => s.name.toLowerCase() === name.toLowerCase());

        grouped[name] = {
          name,
          basePrice: staticMatch ? staticMatch.basePrice : 85000,
          colors: new Set()
        };
      }
      if (v.color && v.color !== 'Choose Option') {
        grouped[name].colors.add(v.color);
      }
    });

    return Object.values(grouped).map(item => {
      const colorsArr = Array.from(item.colors);
      return {
        ...item,
        colors: colorsArr.length > 0 ? colorsArr : ['Choose Option']
      };
    });
  }, [vehicles]);

  const allVehicleColors = React.useMemo(() => {
    const defaultColors = ['Blue', 'Black', 'Red', 'Yellow', 'Green'];
    const colorSet = new Set(defaultColors);

    if (vehicles && vehicles.length > 0) {
      vehicles.forEach(v => {
        if (v.color && v.color !== 'Choose Option') {
          colorSet.add(v.color);
        }
      });
    }

    return Array.from(colorSet);
  }, [vehicles]);

  const executiveList = ['Kishore Kumar', 'Shiva Ram', 'Ankita Sen', 'K. Kumar'];

  const [editingLead, setEditingLead] = useState(null);
  const [leadSuccessMsg, setLeadSuccessMsg] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('ALL');
  const [leadTempFilter, setLeadTempFilter] = useState('ALL');

  // Sale Lead Form State (initialized with first vehicle in list)
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    aadhar: '',
    address: '',
    sourceType: 'Walk-In',
    executive: executiveList[0],
    vehicleModel: (vehicleList && vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G',
    vehicleColor: (allVehicleColors && allVehicleColors[0]) || 'Blue',
    price: (vehicleList && vehicleList[0] && vehicleList[0].basePrice) || 82000,
    leadType: 'Hot',
    status: 'Entered',
    followupDate: '',
    note: ''
  });

  // Quotation Calculator Form State (all fields empty initially)
  const [quoteFormData, setQuoteFormData] = useState({
    customerName: '',
    customerPhone: '',
    vehicleModel: '',
    vehicleColor: '',
    exShowroom: '',
    rto: '',
    insurance: '',
    accessories: '',
    handling: '',
    discount: ''
  });

  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState('');
  const [invoiceSuccessMsg, setInvoiceSuccessMsg] = useState('');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');

  const [generatedQuote, setGeneratedQuote] = useState(() => (quotations && quotations.length > 0 ? quotations[0] : null));
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    month: 'ALL',
    customerName: '',
    vehicleModel: 'ALL',
    paymentStatus: 'ALL',
    minSaleAmount: '',
    maxSaleAmount: '',
    minGstAmount: '',
    maxGstAmount: ''
  });
  const [visibleColumns, setVisibleColumns] = useState({
    invoiceNo: true,
    invoiceDate: true,
    customerName: true,
    customerPhone: true,
    customerAddress: false,
    customerAadhar: false,
    customerGst: false,
    vehicleModel: true,
    vehicleColor: true,
    vinNumber: true,
    engineNo: false,
    batteryNumber: false,
    exShowroom: true,
    gstRate: false,
    gstAmount: true,
    insurance: false,
    rto: false,
    subsidy: false,
    discount: false,
    grandTotal: true,
    paymentStatus: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFormTab, setActiveFormTab] = useState(null); // 'lead' | 'quote' | 'booking' | 'invoice' | null

  // Booking Form State with localStorage Persistence
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('nandhi_bookings');
    return saved ? JSON.parse(saved) : [
      { id: 'BK-01', customerName: 'Rajesh Kumar', mobile: '9842155670', vehicleModel: (vehicleList && vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G', vehicleColor: (allVehicleColors && allVehicleColors[0]) || 'Blue', bookingDate: '2026-08-14', deliveryDate: '2026-08-20', bookingAmount: 5000, paymentMode: 'UPI', createdOn: '14/08/2026' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('nandhi_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    mobile: '',
    vehicleModel: (vehicleList && vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G',
    vehicleColor: (allVehicleColors && allVehicleColors[0]) || 'Blue',
    bookingDate: '',
    deliveryDate: '',
    bookingAmount: '',
    paymentMode: 'Cash',
    notes: ''
  });
  const [generatedBooking, setGeneratedBooking] = useState(() => (bookings && bookings.length > 0 ? bookings[0] : null));

  // Invoice Form State
  const [invoiceFormData, setInvoiceFormData] = useState({
    invoiceNo: '01',
    invoiceDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerAadhar: '',
    customerGst: '',
    vehicleModel: vehicleList[0] ? vehicleList[0].name : '',
    vehicleColor: allVehicleColors[0] || 'Blue',
    vinNumber: '',
    batteryNumber: '',
    chargerNumber: '',
    controllerNumber: '',
    warrantyDetails: '3 Years or 40,000 KMs for Motor, Controller, Cluster & Battery (Whichever is earlier)',
    exShowroom: '',
    gstRate: 5,
    insurance: '',
    rto: '',
    subsidy: '0',
    discount: '0',
    paymentStatus: 'Fully Paid'
  });
  const [generatedInvoice, setGeneratedInvoice] = useState(() => (invoices && invoices.length > 0 ? invoices[0] : null));

  // Sync previews if list updates and nothing was loaded
  useEffect(() => {
    if (!generatedQuote && quotations && quotations.length > 0) {
      setGeneratedQuote(quotations[0]);
    }
  }, [quotations, generatedQuote]);

  useEffect(() => {
    if (!generatedInvoice && invoices && invoices.length > 0) {
      setGeneratedInvoice(invoices[0]);
    }
  }, [invoices, generatedInvoice]);

  useEffect(() => {
    if (!generatedBooking && bookings && bookings.length > 0) {
      setGeneratedBooking(bookings[0]);
    }
  }, [bookings, generatedBooking]);

  // Analytics Metrics summaries
  const leadsSummaryStats = React.useMemo(() => {
    const total = leads.length;
    const hot = leads.filter(l => l.leadType === 'Hot').length;
    const walkIn = leads.filter(l => l.sourceType === 'Walk-In').length;
    const digital = total - walkIn;
    return { total, hot, walkIn, digital };
  }, [leads]);

  // Monthly Wise Grouping for Invoices
  const monthlyInvoiceReportData = React.useMemo(() => {
    const monthGroups = {};

    invoices.forEach(inv => {
      const dateStr = inv.invoiceDate || inv.createdOn || '';
      let monthKey = '2026-08'; // default
      if (dateStr) {
        if (dateStr.includes('-') && dateStr.length >= 7) {
          monthKey = dateStr.substring(0, 7);
        } else if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            monthKey = `${parts[2]}-${parts[1].padStart(2, '0')}`;
          }
        }
      }

      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = {
          monthKey,
          invoices: [],
          count: 0,
          totalRevenue: 0,
          totalTaxable: 0,
          totalGst: 0,
          totalInsurance: 0,
          totalRto: 0,
          totalSubsidy: 0,
          totalDiscount: 0,
          fullyPaid: 0,
          partiallyPaid: 0,
          unpaid: 0
        };
      }

      const g = monthGroups[monthKey];
      g.invoices.push(inv);
      g.count += 1;
      g.totalRevenue += Number(inv.grandTotal || 0);
      g.totalTaxable += Number(inv.exShowroom || (inv.grandTotal * 0.78) || 0);
      g.totalGst += Number(inv.gstAmount || Math.round(Number(inv.exShowroom || 0) * 0.05) || 0);
      g.totalInsurance += Number(inv.insurance || 0);
      g.totalRto += Number(inv.rto || 0);
      g.totalSubsidy += Number(inv.subsidy || 0);
      g.totalDiscount += Number(inv.discount || 0);

      if (inv.paymentStatus === 'Fully Paid') g.fullyPaid += 1;
      else if (inv.paymentStatus === 'Partially Paid') g.partiallyPaid += 1;
      else g.unpaid += 1;
    });

    const monthList = Object.keys(monthGroups).sort().reverse();
    return { monthGroups, monthList };
  }, [invoices]);

  // Filtered Invoices for the Report based on all user criteria
  const filteredReportInvoices = React.useMemo(() => {
    return invoices.filter(inv => {
      // 1. Month filter
      if (reportFilters.month !== 'ALL') {
        const d = inv.invoiceDate || inv.createdOn || '';
        let m = '2026-08';
        if (d.includes('-') && d.length >= 7) m = d.substring(0, 7);
        else if (d.includes('/')) {
          const parts = d.split('/');
          if (parts.length === 3) m = `${parts[2]}-${parts[1].padStart(2, '0')}`;
        }
        if (m !== reportFilters.month) return false;
      }

      // 2. Customer Name / Search filter
      if (reportFilters.customerName.trim()) {
        const q = reportFilters.customerName.toLowerCase().trim();
        const matchName = (inv.customerName || '').toLowerCase().includes(q);
        const matchPhone = (inv.customerPhone || inv.customerMobile || '').includes(q);
        const matchInv = (inv.invoiceNo || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchInv) return false;
      }

      // 3. Vehicle Model filter
      if (reportFilters.vehicleModel !== 'ALL') {
        if (inv.vehicleModel !== reportFilters.vehicleModel) return false;
      }

      // 4. Payment Status filter
      if (reportFilters.paymentStatus !== 'ALL') {
        if (inv.paymentStatus !== reportFilters.paymentStatus) return false;
      }

      // 5. Min & Max Sale Amount (Grand Total)
      const grandTotal = Number(inv.grandTotal || 0);
      if (reportFilters.minSaleAmount && grandTotal < Number(reportFilters.minSaleAmount)) return false;
      if (reportFilters.maxSaleAmount && grandTotal > Number(reportFilters.maxSaleAmount)) return false;

      // 6. Min & Max GST Amount
      const gstAmt = Number(inv.gstAmount || Math.round(Number(inv.exShowroom || 0) * 0.05) || 0);
      if (reportFilters.minGstAmount && gstAmt < Number(reportFilters.minGstAmount)) return false;
      if (reportFilters.maxGstAmount && gstAmt > Number(reportFilters.maxGstAmount)) return false;

      return true;
    });
  }, [invoices, reportFilters]);

  // Export Monthly Report to CSV dynamically reflecting active filters & visible fields
  const handleExportMonthlyCSV = () => {
    if (filteredReportInvoices.length === 0) {
      alert('No matching invoices to export for this filter criteria.');
      return;
    }

    const availableCols = [
      { key: 'invoiceNo', label: 'Invoice No', getter: inv => inv.invoiceNo },
      { key: 'invoiceDate', label: 'Invoice Date', getter: inv => inv.invoiceDate || inv.createdOn },
      { key: 'customerName', label: 'Customer Name', getter: inv => `"${inv.customerName || ''}"` },
      { key: 'customerPhone', label: 'Mobile Number', getter: inv => inv.customerPhone || inv.customerMobile || '' },
      { key: 'customerAddress', label: 'Customer Address', getter: inv => `"${inv.customerAddress || ''}"` },
      { key: 'customerAadhar', label: 'Aadhaar No', getter: inv => inv.customerAadhar || '' },
      { key: 'customerGst', label: 'Customer GSTIN', getter: inv => inv.customerGst || '' },
      { key: 'vehicleModel', label: 'Vehicle Model', getter: inv => `"${inv.vehicleModel || ''}"` },
      { key: 'vehicleColor', label: 'Vehicle Color', getter: inv => `"${inv.vehicleColor || ''}"` },
      { key: 'vinNumber', label: 'Chassis / VIN', getter: inv => inv.vinNumber || inv.vin || inv.chassisNo || '' },
      { key: 'engineNo', label: 'Motor / Engine No', getter: inv => inv.engineNo || inv.motorNumber || '' },
      { key: 'batteryNumber', label: 'Battery Serial No', getter: inv => inv.batteryNumber || inv.batteryNo || '' },
      { key: 'exShowroom', label: 'Taxable Sale Amount (₹)', getter: inv => inv.exShowroom || (inv.grandTotal * 0.78) || 0 },
      { key: 'gstRate', label: 'GST Rate %', getter: inv => inv.gstRate || 5 },
      { key: 'gstAmount', label: 'GST Amount (₹)', getter: inv => inv.gstAmount || Math.round(Number(inv.exShowroom || 0) * 0.05) || 0 },
      { key: 'insurance', label: 'Insurance (₹)', getter: inv => inv.insurance || 0 },
      { key: 'rto', label: 'RTO & Life Tax (₹)', getter: inv => inv.rto || 0 },
      { key: 'subsidy', label: 'Govt Subsidy (₹)', getter: inv => inv.subsidy || 0 },
      { key: 'discount', label: 'Discount (₹)', getter: inv => inv.discount || 0 },
      { key: 'grandTotal', label: 'Grand Total Amount (₹)', getter: inv => inv.grandTotal || 0 },
      { key: 'paymentStatus', label: 'Payment Status', getter: inv => inv.paymentStatus || 'Fully Paid' }
    ];

    const activeCols = availableCols.filter(col => visibleColumns[col.key]);
    const headers = activeCols.map(c => c.label);
    const rows = filteredReportInvoices.map(inv => activeCols.map(c => c.getter(inv)));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NandhiMotors_Custom_Invoice_Report_${reportFilters.month}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const quoteSummaryStats = React.useMemo(() => {
    const totalCount = quotations.length;
    const totalSum = quotations.reduce((acc, q) => acc + (q.total || 0), 0);
    const avgVal = totalCount > 0 ? Math.round(totalSum / totalCount) : 0;
    return { totalCount, avgVal };
  }, [quotations]);

  const bookingSummaryStats = React.useMemo(() => {
    const totalCount = bookings.length;
    const totalAdvance = bookings.reduce((sum, b) => sum + Number(b.bookingAmount || 0), 0);
    return { totalCount, totalAdvance };
  }, [bookings]);

  const invoiceSummaryStats = React.useMemo(() => {
    const totalCount = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
    const avgVal = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
    const fullyPaid = invoices.filter(inv => inv.paymentStatus === 'Fully Paid').length;
    const partiallyPaid = invoices.filter(inv => inv.paymentStatus === 'Partially Paid').length;
    const unpaid = invoices.filter(inv => inv.paymentStatus === 'Unpaid').length;
    return { totalCount, totalAmount, avgVal, fullyPaid, partiallyPaid, unpaid };
  }, [invoices]);

  // Auto-increment invoice number
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      const numericInvoiceNos = invoices
        .map(inv => parseInt(inv.invoiceNo, 10))
        .filter(num => !isNaN(num));
      const maxNo = numericInvoiceNos.length > 0 ? Math.max(...numericInvoiceNos) : invoices.length;
      setInvoiceFormData(prev => ({
        ...prev,
        invoiceNo: String(maxNo + 1).padStart(2, '0')
      }));
    } else {
      setInvoiceFormData(prev => ({
        ...prev,
        invoiceNo: '01'
      }));
    }
  }, [invoices]);

  const calculateInvoiceTotalDetails = () => {
    const ex = Number(invoiceFormData.exShowroom || 0);
    const gstRate = Number(invoiceFormData.gstRate || 0);
    const gstAmount = Math.round(ex * (gstRate / 100));
    const ins = Number(invoiceFormData.insurance || 0);
    const rtoVal = Number(invoiceFormData.rto || 0);
    const sub = Number(invoiceFormData.subsidy || 0);
    const disc = Number(invoiceFormData.discount || 0);

    const totalBeforeRoundoff = ex + gstAmount + ins + rtoVal - sub - disc;
    const grandTotal = Math.round(totalBeforeRoundoff);
    const roundoffAdjustment = Number((grandTotal - totalBeforeRoundoff).toFixed(2));

    return {
      gstAmount,
      totalBeforeRoundoff,
      grandTotal,
      roundoffAdjustment
    };
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    const details = calculateInvoiceTotalDetails();
    const nextInvNum = invoices.reduce((max, inv) => {
      const n = parseInt((inv.invoiceNo || '').replace(/\D/g, ''), 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0) + 1;
    const invoiceNo = editingInvoiceId || invoiceFormData.invoiceNo || String(nextInvNum).padStart(2, '0');
    const invoicePayload = {
      ...invoiceFormData,
      invoiceNo,
      vinNumber: (invoiceFormData.vinNumber || '').toUpperCase(),
      batteryNumber: (invoiceFormData.batteryNumber || '').toUpperCase(),
      chargerNumber: (invoiceFormData.chargerNumber || '').toUpperCase(),
      controllerNumber: (invoiceFormData.controllerNumber || '').toUpperCase(),
      customerGst: (invoiceFormData.customerGst || '').toUpperCase(),
      invoiceDate: invoiceFormData.invoiceDate || new Date().toISOString().split('T')[0],
      createdOn: invoiceFormData.createdOn || new Date().toLocaleDateString('en-IN'),
      exShowroom: Number(invoiceFormData.exShowroom || 0),
      gstRate: Number(invoiceFormData.gstRate || 0),
      insurance: Number(invoiceFormData.insurance || 0),
      rto: Number(invoiceFormData.rto || 0),
      subsidy: Number(invoiceFormData.subsidy || 0),
      discount: Number(invoiceFormData.discount || 0),
      gstAmount: details.gstAmount,
      totalBeforeRoundoff: details.totalBeforeRoundoff,
      grandTotal: details.grandTotal,
      roundoffAdjustment: details.roundoffAdjustment
    };
    
    // Save to database & set preview
    const saved = await addInvoice(invoicePayload);
    setGeneratedInvoice(saved || invoicePayload);
    setEditingInvoiceId(null);
    setActiveFormTab(null);
    setInvoiceSuccessMsg(`Tax Invoice #${invoiceNo} saved successfully!`);
    setTimeout(() => setInvoiceSuccessMsg(''), 4000);
  };

  // Convert Quotation directly into a Tax Invoice
  const handleConvertQuoteToInvoice = (q) => {
    setInvoiceFormData(prev => ({
      ...prev,
      customerName: q.customerName || '',
      customerPhone: q.customerPhone || '',
      customerAddress: q.customerAddress || '',
      customerAadhar: q.customerAadhar || '',
      customerGst: (q.customerGst || '').toUpperCase(),
      vehicleModel: q.vehicleModel || (vehicleList[0] && vehicleList[0].name) || '',
      vehicleColor: q.vehicleColor || (allVehicleColors && allVehicleColors[0]) || '',
      exShowroom: q.exShowroom ? Number(q.exShowroom) : '',
      insurance: q.insurance ? Number(q.insurance) : '',
      rto: q.rto ? Number(q.rto) : '',
      discount: q.discount ? Number(q.discount) : 0,
      vinNumber: '',
      batteryNumber: '',
      chargerNumber: '',
      controllerNumber: '',
      paymentStatus: 'Fully Paid'
    }));
    setEditingInvoiceId(null);
    setActiveSubTab('invoice');
    setActiveFormTab('invoice');
  };

  // Edit Handlers for Quotation and Invoice
  const handleEditQuotation = (q) => {
    setEditingQuoteId(q.quoteId);
    setQuoteFormData({
      customerName: q.customerName || '',
      customerPhone: q.customerPhone || '',
      vehicleModel: q.vehicleModel || (vehicleList[0] && vehicleList[0].name) || '',
      vehicleColor: q.vehicleColor || (allVehicleColors && allVehicleColors[0]) || '',
      exShowroom: q.exShowroom || '',
      rto: q.rto || '',
      insurance: q.insurance || '',
      accessories: q.accessories || '',
      handling: q.handling || '',
      discount: q.discount || ''
    });
    setActiveFormTab('quote');
  };

  const handleEditInvoice = (inv) => {
    setEditingInvoiceId(inv.invoiceNo);
    setInvoiceFormData({
      invoiceNo: inv.invoiceNo,
      invoiceDate: inv.invoiceDate || new Date().toISOString().split('T')[0],
      customerName: inv.customerName || '',
      customerPhone: inv.customerPhone || inv.customerMobile || '',
      customerAddress: inv.customerAddress || '',
      customerAadhar: inv.customerAadhar || '',
      customerGst: (inv.customerGst || '').toUpperCase(),
      vehicleModel: inv.vehicleModel || (vehicleList[0] && vehicleList[0].name) || '',
      vehicleColor: inv.vehicleColor || (allVehicleColors && allVehicleColors[0]) || '',
      vinNumber: (inv.vinNumber || inv.vin || inv.chassisNo || '').toUpperCase(),
      batteryNumber: (inv.batteryNumber || inv.batteryNo || '').toUpperCase(),
      chargerNumber: (inv.chargerNumber || inv.chargerNo || '').toUpperCase(),
      controllerNumber: (inv.controllerNumber || inv.controllerNo || '').toUpperCase(),
      warrantyDetails: inv.warrantyDetails || '3 Years or 40,000 KMs for Motor, Controller, Cluster & Battery (Whichever is earlier)',
      exShowroom: inv.exShowroom || '',
      gstRate: inv.gstRate || 5,
      insurance: inv.insurance || inv.insuranceCharges || '',
      rto: inv.rto || inv.rtoCharges || '',
      subsidy: inv.subsidy || '0',
      discount: inv.discount || '0',
      paymentStatus: inv.paymentStatus || 'Fully Paid'
    });
    setActiveFormTab('invoice');
  };

  // WhatsApp Messaging & PDF Dispatch Helpers
  const handleShareQuoteWhatsApp = async (q) => {
    await generateQuotationPdfAndShare(q);
  };

  const handleDownloadQuotePdf = async (q) => {
    await generateQuotationPdfAndShare(q, null, true);
  };

  const handleShareInvoiceWhatsApp = async (inv) => {
    await generateInvoicePdfAndShare(inv);
  };

  const handleDownloadInvoicePdf = async (inv) => {
    await generateInvoicePdfAndShare(inv, null, true);
  };

  // Fetch bookings on subtab load (without deleting existing entries)
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBookings(data);
          }
        }
      } catch (err) {
        console.warn('Backend server fallback to local bookings storage.');
      }
    };
    if (activeSubTab === 'booking') {
      fetchBookings();
    }
  }, [activeSubTab]);

  const deleteBooking = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete booking:', err);
    }
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const nextBkNum = bookings.reduce((max, b) => {
      const n = parseInt((b.id || '').replace(/\D/g, ''), 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0) + 1;
    const id = `BK-${String(nextBkNum).padStart(2, '0')}`;
    const newBooking = {
      ...bookingForm,
      id,
      createdOn: new Date().toLocaleDateString('en-IN')
    };

    setBookings(prev => [newBooking, ...prev]);
    setGeneratedBooking(newBooking);
    setActiveFormTab(null);
    setBookingSuccessMsg(`Booking #${id} registered for ${newBooking.customerName}!`);
    setTimeout(() => setBookingSuccessMsg(''), 4000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
      if (res.ok) {
        const saved = await res.json();
        setBookings(prev => prev.map(b => b.id === id ? saved : b));
        setGeneratedBooking(saved);
      }
    } catch (err) {
      console.error('Failed to save booking to MongoDB:', err);
    }
  };

  const clearBookingForm = () => {
    setBookingForm({
      customerName: '',
      mobile: '',
      vehicleModel: vehicleList[0].name,
      vehicleColor: vehicleList[0].colors[0],
      bookingDate: '',
      deliveryDate: '',
      bookingAmount: '',
      paymentMode: 'Cash',
      notes: ''
    });
    setGeneratedBooking(null);
  };

  // Handle vehicle model change in Booking Form
  const handleBookingVehicleChange = (modelName) => {
    setBookingForm(prev => ({
      ...prev,
      vehicleModel: modelName
    }));
  };

  // Handle vehicle model change in Lead Form to update colors and price
  const handleLeadVehicleChange = (modelName) => {
    const selectedVeh = (vehicleList && vehicleList.find(v => v.name === modelName)) || vehicleList[0] || { name: modelName, basePrice: 82000 };
    setLeadFormData(prev => ({
      ...prev,
      vehicleModel: modelName,
      price: selectedVeh.basePrice || prev.price
    }));
  };

  const handleOpenAddLead = () => {
    setEditingLead(null);
    setLeadFormData({
      name: '',
      mobile: '',
      email: '',
      aadhar: '',
      address: '',
      sourceType: 'Walk-In',
      executive: executiveList[0] || 'Kishore Kumar',
      vehicleModel: (vehicleList && vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G',
      vehicleColor: (vehicleList && vehicleList[0] && vehicleList[0].colors && vehicleList[0].colors[0]) || (allVehicleColors && allVehicleColors[0]) || 'Blue',
      price: (vehicleList && vehicleList[0] && vehicleList[0].basePrice) || 82000,
      leadType: 'Hot',
      status: 'Entered',
      followupDate: '',
      note: ''
    });
    setActiveFormTab('lead');
  };

  const handleOpenEditLead = (lead) => {
    setEditingLead(lead);
    setLeadFormData({
      name: lead.name || '',
      mobile: lead.mobile || '',
      email: lead.email || '',
      aadhar: lead.aadhar || '',
      address: lead.address || '',
      sourceType: lead.sourceType || 'Walk-In',
      executive: lead.executive || executiveList[0],
      vehicleModel: lead.vehicle || (vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G',
      vehicleColor: lead.color || (allVehicleColors && allVehicleColors[0]) || 'Blue',
      price: lead.price || 82000,
      leadType: lead.leadType || 'Hot',
      status: lead.status || 'Entered',
      followupDate: lead.followupDate || '',
      note: lead.note || ''
    });
    setActiveFormTab('lead');
  };

  // Submit Sale Lead (Create or Edit)
  const handleLeadFormSubmit = async (e) => {
    e.preventDefault();

    if (editingLead) {
      const updatedItem = {
        ...editingLead,
        name: leadFormData.name,
        mobile: leadFormData.mobile,
        email: leadFormData.email,
        aadhar: leadFormData.aadhar,
        address: leadFormData.address || 'N/A',
        sourceType: leadFormData.sourceType,
        executive: leadFormData.executive,
        vehicle: leadFormData.vehicleModel,
        color: leadFormData.vehicleColor,
        price: leadFormData.price ? Number(leadFormData.price) : 0,
        leadType: leadFormData.leadType,
        status: leadFormData.status,
        followupDate: leadFormData.followupDate,
        note: leadFormData.note
      };

      if (updateLead) {
        await updateLead(editingLead.id, updatedItem);
      } else if (setLeads) {
        setLeads(prev => prev.map(l => (l.id === editingLead.id ? updatedItem : l)));
      }
      setEditingLead(null);
      setLeadSuccessMsg(`Lead ${editingLead.id} updated successfully!`);
      setTimeout(() => setLeadSuccessMsg(''), 4000);
    } else {
      // Robust unique ID generation
      const nextNum = leads.reduce((max, l) => {
        const n = parseInt((l.id || '').replace(/\D/g, ''), 10);
        return !isNaN(n) && n > max ? n : max;
      }, 0) + 1;
      const newLeadId = `L-${String(nextNum).padStart(2, '0')}`;

      const newLeadItem = {
        id: newLeadId,
        name: leadFormData.name,
        mobile: leadFormData.mobile,
        email: leadFormData.email,
        aadhar: leadFormData.aadhar,
        address: leadFormData.address || 'N/A',
        sourceType: leadFormData.sourceType,
        executive: leadFormData.executive,
        vehicle: leadFormData.vehicleModel,
        color: leadFormData.vehicleColor,
        price: leadFormData.price ? Number(leadFormData.price) : 0,
        leadType: leadFormData.leadType,
        status: leadFormData.status || 'Entered',
        followupDate: leadFormData.followupDate,
        note: leadFormData.note,
        createdOn: new Date().toLocaleDateString('en-IN')
      };

      if (addLead) {
        await addLead(newLeadItem);
      } else if (setLeads) {
        setLeads([newLeadItem, ...leads]);
      }

      // Auto-save customer details
      if (addCustomer) {
        addCustomer(newLeadItem);
      }

      // Pre-fill quotation state
      setQuoteFormData({
        customerName: leadFormData.name,
        customerPhone: leadFormData.mobile,
        vehicleModel: leadFormData.vehicleModel,
        vehicleColor: leadFormData.vehicleColor || '',
        exShowroom: leadFormData.price ? Number(leadFormData.price) : '',
        rto: '',
        insurance: '',
        accessories: '',
        handling: '',
        discount: ''
      });

      setLeadSuccessMsg(`New Sale Lead #${newLeadId} added successfully for ${newLeadItem.name}!`);
      setTimeout(() => setLeadSuccessMsg(''), 4000);
    }

    // Reset Lead Form fields
    setLeadFormData({
      name: '',
      mobile: '',
      email: '',
      aadhar: '',
      address: '',
      sourceType: 'Walk-In',
      executive: executiveList[0] || 'Kishore Kumar',
      vehicleModel: (vehicleList && vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G',
      vehicleColor: (vehicleList && vehicleList[0] && vehicleList[0].colors && vehicleList[0].colors[0]) || (allVehicleColors && allVehicleColors[0]) || 'Blue',
      price: (vehicleList && vehicleList[0] && vehicleList[0].basePrice) || 82000,
      leadType: 'Hot',
      status: 'Entered',
      followupDate: '',
      note: ''
    });

    setActiveFormTab(null);
  };

  const handleQuickStatusChange = async (lead, newStatus) => {
    const updated = { ...lead, status: newStatus };
    if (updateLead) {
      await updateLead(lead.id, updated);
    } else if (setLeads) {
      setLeads(prev => prev.map(l => (l.id === lead.id ? updated : l)));
    }
  };

  const handleConvertToQuotation = (lead) => {
    setQuoteFormData({
      customerName: lead.name || '',
      customerPhone: lead.mobile || '',
      vehicleModel: lead.vehicle || (vehicleList[0] && vehicleList[0].name) || '',
      vehicleColor: lead.color || '',
      exShowroom: lead.price ? Number(lead.price) : '',
      rto: '',
      insurance: '',
      accessories: '',
      handling: '',
      discount: ''
    });
    setGeneratedQuote(null);
    setEditingQuoteId(null);
    setActiveSubTab('quotation');
    setActiveFormTab('quote');
  };

  const handleDeleteLeadAction = async (id) => {
    if (confirm(`Are you sure you want to delete lead ${id}?`)) {
      if (deleteLead) {
        await deleteLead(id);
      } else if (setLeads) {
        setLeads(leads.filter(l => l.id !== id));
      }
    }
  };

  // Compute Total On-Road Price
  const calculateOnRoadTotal = () => {
    const total = Number(quoteFormData.exShowroom || 0) +
                  Number(quoteFormData.rto || 0) +
                  Number(quoteFormData.insurance || 0) +
                  Number(quoteFormData.accessories || 0) +
                  Number(quoteFormData.handling || 0) -
                  Number(quoteFormData.discount || 0);
    return isNaN(total) ? 0 : total;
  };

  // Submit Quotation
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    const details = calculateOnRoadTotal();
    const nextQuoteNum = quotations.reduce((max, q) => {
      const n = parseInt((q.quoteId || '').replace(/\D/g, ''), 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0) + 1;
    const quoteId = editingQuoteId || `QT-${String(nextQuoteNum).padStart(2, '0')}`;
    const quotePayload = {
      ...quoteFormData,
      quoteId,
      createdOn: quoteFormData.createdOn || new Date().toLocaleDateString('en-IN'),
      exShowroom: Number(quoteFormData.exShowroom || 0),
      rto: Number(quoteFormData.rto || 0),
      insurance: Number(quoteFormData.insurance || 0),
      accessories: Number(quoteFormData.accessories || 0),
      handling: Number(quoteFormData.handling || 0),
      discount: Number(quoteFormData.discount || 0),
      total: details
    };
    const saved = await addQuotation(quotePayload);
    setGeneratedQuote(saved || quotePayload);
    setEditingQuoteId(null);
    setActiveFormTab(null);
    setQuoteSuccessMsg(`Quotation #${quoteId} saved successfully!`);
    setTimeout(() => setQuoteSuccessMsg(''), 4000);
  };

  const filteredLeads = leads.filter(l => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || (l.name || '').toLowerCase().includes(q) || (l.mobile || '').includes(q) || (l.id || '').toLowerCase().includes(q);
    const matchStatus = leadStatusFilter === 'ALL' || l.status === leadStatusFilter;
    const matchTemp = leadTempFilter === 'ALL' || l.leadType === leadTempFilter;
    return matchQuery && matchStatus && matchTemp;
  });


  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Sub Tabs */}
      <div className="sub-tabs-container">
        <span className={`sub-tab ${activeSubTab === 'sale-lead' ? 'active' : ''}`} onClick={() => setActiveSubTab('sale-lead')}>
          Sale Lead
        </span>
        <span className={`sub-tab ${activeSubTab === 'quotation' ? 'active' : ''}`} onClick={() => setActiveSubTab('quotation')}>
          Quotation
        </span>
        <span className={`sub-tab ${activeSubTab === 'invoice' ? 'active' : ''}`} onClick={() => setActiveSubTab('invoice')}>
          Invoice
        </span>
        <span className={`sub-tab ${activeSubTab === 'booking' ? 'active' : ''}`} onClick={() => setActiveSubTab('booking')}>
          Booking
        </span>
      </div>

      {/* Success Alert Banner */}
      {leadSuccessMsg && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #10b981',
          color: '#065f46',
          padding: '10px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          <CheckCircle size={16} color="#059669" />
          <span>{leadSuccessMsg}</span>
        </div>
      )}

      {/* SUBTAB 1: SALE LEAD */}
      {activeSubTab === 'sale-lead' && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          {/* Leads List Side */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h3 className="card-title">Submitted Sale Leads Ledger</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="quick-search">
                  <Search size={14} className="quick-search-icon" />
                  <input
                    type="text"
                    placeholder="Search name/phone/ID..."
                    style={{ width: '180px', padding: '6px 10px 6px 30px', fontSize: '0.8rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenAddLead}
                >
                  <UserPlus size={14} /> + Add Sale Lead
                </button>
              </div>
            </div>

            {/* Filter & Metric Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              padding: '12px 20px',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb'
            }}>
              {/* Metric stats */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.8rem' }}>
                  <span style={{ color: '#6b7280' }}>Total: </span>
                  <strong style={{ color: '#1f2937' }}>{leadsSummaryStats.total}</strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.8rem' }}>
                  <span style={{ color: '#ef4444' }}>🔥 Hot: </span>
                  <strong style={{ color: '#ef4444' }}>{leadsSummaryStats.hot}</strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.8rem' }}>
                  <span style={{ color: '#059669' }}>Walk-in: </span>
                  <strong style={{ color: '#059669' }}>{leadsSummaryStats.walkIn}</strong>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '0.8rem' }}>
                  <span style={{ color: '#2563eb' }}>Digital: </span>
                  <strong style={{ color: '#2563eb' }}>{leadsSummaryStats.digital}</strong>
                </div>
              </div>

              {/* Status Filter Chips */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Filter:</span>
                {['ALL', 'Entered', 'Follow-up', 'Convert'].map(st => (
                  <button
                    key={st}
                    type="button"
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor: leadStatusFilter === st ? '#059669' : '#d1d5db',
                      backgroundColor: leadStatusFilter === st ? '#ecfdf5' : '#ffffff',
                      color: leadStatusFilter === st ? '#059669' : '#4b5563',
                      cursor: 'pointer',
                      fontWeight: leadStatusFilter === st ? 600 : 400
                    }}
                    onClick={() => setLeadStatusFilter(st)}
                  >
                    {st === 'ALL' ? 'All Statuses' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-body" style={{ padding: 0, maxHeight: '720px', overflowY: 'auto' }}>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      backgroundColor: lead.leadType === 'Hot' ? '#fffaf8' : '#ffffff',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                          {lead.id}
                        </span>
                        <span className={`badge ${lead.leadType === 'Hot' ? 'badge-danger' : 'badge-info'}`}>
                          {lead.leadType === 'Hot' ? '🔥 Hot' : lead.leadType}
                        </span>
                        {/* Status dropdown quick toggle */}
                        <select
                          value={lead.status || 'Entered'}
                          onChange={(e) => handleQuickStatusChange(lead, e.target.value)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            backgroundColor: lead.status === 'Convert' ? '#ecfdf5' : lead.status === 'Follow-up' ? '#fffbeb' : '#f3f4f6',
                            color: lead.status === 'Convert' ? '#047857' : lead.status === 'Follow-up' ? '#b45309' : '#374151',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Entered">Entered</option>
                          <option value="Follow-up">In Follow-up</option>
                          <option value="Convert">Converted</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {/* WhatsApp Action */}
                        <a
                          href={`https://wa.me/91${lead.mobile}?text=${encodeURIComponent(`Hello ${lead.name}, greetings from Nandhi Motors regarding your inquiry for ${lead.vehicle || 'two-wheeler'}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#16a34a', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                          title="WhatsApp Customer"
                        >
                          <MessageCircle size={13} /> WhatsApp
                        </a>

                        {/* Convert to Quotation Action */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#059669', borderColor: '#a7f3d0', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                          onClick={() => handleConvertToQuotation(lead)}
                          title="Generate Quotation for this Lead"
                        >
                          <Calculator size={13} /> Create Quote
                        </button>

                        {/* Edit Lead Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
                          onClick={() => handleOpenEditLead(lead)}
                          title="Edit Lead Details"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Lead Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#ef4444', borderColor: '#fca5a5' }}
                          onClick={() => handleDeleteLeadAction(lead.id)}
                          title="Delete Lead"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {lead.name}
                        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#6b7280' }}>
                          (Registered: {lead.createdOn || 'Recent'})
                        </span>
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <Phone size={12} /> <a href={`tel:${lead.mobile}`} style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500 }}>{lead.mobile}</a>
                        {lead.email ? ` | ✉️ ${lead.email}` : ''}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                        <strong>Aadhar:</strong> {lead.aadhar || 'Not Provided'} | <strong>Source:</strong> {lead.sourceType || 'Walk-In'} {lead.address && lead.address !== 'N/A' ? `| 📍 ${lead.address}` : ''}
                      </p>
                    </div>

                    <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ color: '#6b7280' }}>Vehicle Choice:</span>
                        <strong>{lead.vehicle} {lead.color ? `(${lead.color})` : ''}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ color: '#6b7280' }}>Ex-Showroom Base:</span>
                        <strong style={{ color: '#059669' }}>₹{Number(lead.price || 0).toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Assigned Executive:</span>
                        <strong>{lead.executive || 'Unassigned'}</strong>
                      </div>
                    </div>

                    {lead.followupDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                        <Calendar size={12} /> Follow-up Scheduled: {lead.followupDate}
                      </div>
                    )}

                    {lead.note && (
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '6px 10px', borderRadius: '4px' }}>
                        <strong>Note:</strong> {lead.note}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: '50px 20px', textAlign: 'center', color: '#9ca3af' }}>
                  <Clipboard size={48} strokeWidth={1} style={{ marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#6b7280' }}>No leads found matching current filter or search.</p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '12px' }}
                    onClick={handleOpenAddLead}
                  >
                    + Create First Lead
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: QUOTATION CALCULATOR */}
      {activeSubTab === 'quotation' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: showPreviews ? '1.2fr 1fr' : '1fr',
          gap: '24px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {/* Left Column: Saved On-Road Quotations */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Saved On-Road Quotations</h3>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveFormTab('quote')}
              >
                + Create Quotation
              </button>
            </div>
            <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {quoteSuccessMsg && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  borderRadius: '6px',
                  border: '1px solid #a7f3d0',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>✅</span> <span>{quoteSuccessMsg}</span>
                </div>
              )}

              {/* Summary Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                backgroundColor: '#f9fafb',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Quotes</span>
                  <strong style={{ fontSize: '1.1rem', color: '#1f2937' }}>{quoteSummaryStats.totalCount}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Average Quote Value</span>
                  <strong style={{ fontSize: '1.1rem', color: '#059669' }}>₹{quoteSummaryStats.avgVal.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Scrollable list */}
              <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {quotations && quotations.length > 0 ? (
                  quotations.map((q, idx) => (
                    <div
                      key={idx}
                      onClick={() => setGeneratedQuote(q)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: (generatedQuote?.quoteId === q.quoteId) ? '#f0fdf4' : '#ffffff',
                        borderColor: (generatedQuote?.quoteId === q.quoteId) ? '#86efac' : '#e5e7eb',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <strong>Quote #{q.quoteId}</strong> | {q.customerName || 'Walk-in'}<br />
                        <span style={{ color: '#6b7280' }}>Date: {q.createdOn} | {q.vehicleModel} ({q.vehicleColor})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <strong style={{ color: '#059669', marginRight: '4px' }}>₹{Number(q.total || 0).toLocaleString('en-IN')}</strong>
                        
                        {/* Convert to Invoice Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#059669', borderColor: '#a7f3d0', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 600 }}
                          onClick={() => handleConvertQuoteToInvoice(q)}
                          title="Convert this Quotation to Tax Invoice"
                        >
                          <FileText size={12} /> Convert to Invoice
                        </button>

                        {/* WhatsApp Share Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#16a34a', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}
                          onClick={() => handleShareQuoteWhatsApp(q)}
                          title="Share Quotation on WhatsApp"
                        >
                          <MessageCircle size={13} />
                        </button>

                        {/* Edit Quotation Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
                          onClick={() => handleEditQuotation(q)}
                          title="Edit Quotation"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Print Preview Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => {
                            setGeneratedQuote(q);
                            setPrintModalConfig({ isOpen: true, type: 'quotation', data: q });
                          }}
                          title="Print Preview Popup"
                        >
                          <Printer size={12} />
                        </button>

                        {/* Delete Quotation Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#ef4444', borderColor: '#fca5a5' }}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete Quotation ${q.quoteId}?`)) {
                              deleteQuotation(q.quoteId);
                              if (generatedQuote?.quoteId === q.quoteId) {
                                  setGeneratedQuote(null);
                              }
                            }
                          }}
                          title="Delete Quotation"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#9ca3af', fontSize: '0.8rem' }}>
                    No saved quotations. Generate one to store.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quotation Preview Card */}
          {showPreviews && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Quotation PDF Preview</h3>
              </div>
              <div className="card-body">
                {generatedQuote ? (
                  <div className="invoice-container">
                    <div className="invoice-title">NANDHI MOTORS</div>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b7280', marginBottom: '18px' }}>
                      128, Bangalore Main Road, Hosur - 635109
                    </p>
                    
                    <div className="invoice-meta">
                      <div>
                        <strong>Quoted To:</strong> {generatedQuote.customerName || 'Walk-in Customer'}<br />
                        <strong>Phone No:</strong> {generatedQuote.customerPhone || 'N/A'}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong>Date:</strong> {generatedQuote.createdOn || new Date().toLocaleDateString('en-IN')}<br />
                        <strong>Vehicle:</strong> {generatedQuote.vehicleModel}<br />
                        <strong>Colour:</strong> {generatedQuote.vehicleColor}
                      </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', margin: '18px 0' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1.5px solid #000' }}>
                          <th style={{ textAlign: 'left', padding: '6px 8px' }}>Price Component</th>
                          <th style={{ textAlign: 'right', padding: '6px 8px' }}>Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px dotted #ccc' }}>
                          <td style={{ padding: '6px 8px' }}>Ex-Showroom Base Price</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px' }}>₹{Number(generatedQuote.exShowroom || 0).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px dotted #ccc' }}>
                          <td style={{ padding: '6px 8px' }}>RTO Registration, Tax & Plates</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px' }}>₹{Number(generatedQuote.rto || 0).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px dotted #ccc' }}>
                          <td style={{ padding: '6px 8px' }}>Comprehensive Insurance</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px' }}>₹{Number(generatedQuote.insurance || 0).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px dotted #ccc' }}>
                          <td style={{ padding: '6px 8px' }}>Showroom Accessories / Helmet</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px' }}>₹{Number(generatedQuote.accessories || 0).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px dotted #ccc' }}>
                          <td style={{ padding: '6px 8px' }}>Logistics, Handling & Number Plate</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px' }}>₹{Number(generatedQuote.handling || 0).toLocaleString('en-IN')}</td>
                        </tr>
                        {Number(generatedQuote.discount || 0) > 0 && (
                          <tr style={{ color: '#ef4444', borderBottom: '1px dotted #ccc' }}>
                            <td style={{ padding: '6px 8px' }}>Special Dealer Discount (-)</td>
                            <td style={{ textAlign: 'right', padding: '6px 8px' }}>-₹{Number(generatedQuote.discount).toLocaleString('en-IN')}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    <div className="invoice-totals">
                      <div className="invoice-row bold" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '1rem', borderBottom: '1px solid #000' }}>
                        <span>Consolidated On-Road:</span>
                        <span style={{ color: '#059669' }}>₹{Number(generatedQuote.total || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#059669', color: '#fff', fontWeight: 600 }}
                        onClick={() => handleConvertQuoteToInvoice(generatedQuote)}
                      >
                        <FileText size={14} /> Convert to Tax Invoice
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, minWidth: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#15803d' }}
                        onClick={() => handleShareQuoteWhatsApp(generatedQuote)}
                      >
                        <MessageCircle size={14} /> Send WhatsApp
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, minWidth: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#eff6ff', borderColor: '#93c5fd', color: '#1d4ed8' }}
                        onClick={() => handleEditQuotation(generatedQuote)}
                      >
                        <Edit2 size={14} /> Edit Quote
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, minWidth: '120px' }}
                        onClick={() => setPrintModalConfig({ isOpen: true, type: 'quotation', data: generatedQuote })}
                      >
                        <Printer size={14} /> Print Preview
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', color: '#9ca3af', textAlign: 'center' }}>
                    <Clipboard size={48} strokeWidth={1} style={{ marginBottom: '12px' }} />
                    <p>Select a quotation from the ledger on the left to preview.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: BOOKING */}
      {activeSubTab === 'booking' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: showPreviews ? '1.2fr 1fr' : '1fr',
          gap: '24px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {/* Left Column: Saved Bookings Ledger */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Saved Booking Ledger</h3>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveFormTab('booking')}
              >
                + New Booking
              </button>
            </div>
            <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {bookingSuccessMsg && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  borderRadius: '6px',
                  border: '1px solid #a7f3d0',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>✅</span> <span>{bookingSuccessMsg}</span>
                </div>
              )}

              {/* Summary Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                backgroundColor: '#f9fafb',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Bookings</span>
                  <strong style={{ fontSize: '1.1rem', color: '#1f2937' }}>{bookingSummaryStats.totalCount}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Advance Collected</span>
                  <strong style={{ fontSize: '1.1rem', color: '#059669' }}>₹{bookingSummaryStats.totalAdvance.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* List of bookings */}
              <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bookings && bookings.length > 0 ? (
                  bookings.map((b, idx) => (
                    <div
                      key={idx}
                      onClick={() => setGeneratedBooking(b)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: generatedBooking?.id === b.id ? '#f0fdf4' : '#ffffff',
                        borderColor: generatedBooking?.id === b.id ? '#86efac' : '#e5e7eb',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <strong>Booking #{b.id}</strong> | {b.customerName}<br />
                        <span style={{ color: '#6b7280' }}>Date: {b.bookingDate} | {b.vehicleModel} ({b.vehicleColor})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                        <strong style={{ color: '#059669', marginRight: '4px' }}>₹{Number(b.bookingAmount || 0).toLocaleString('en-IN')}</strong>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => {
                            setGeneratedBooking(b);
                            setPrintModalConfig({ isOpen: true, type: 'booking', data: b });
                          }}
                          title="Print Preview Popup"
                        >
                          <Printer size={12} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#ef4444', borderColor: '#fca5a5' }}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete Booking ${b.id}?`)) {
                              deleteBooking(b.id);
                              if (generatedBooking?.id === b.id) {
                                setGeneratedBooking(null);
                              }
                            }
                          }}
                          title="Delete Booking"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#9ca3af', fontSize: '0.8rem' }}>
                    No saved bookings. Confirm a booking to store.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Preview / Print Card */}
          {showPreviews && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Printer size={18} style={{ color: '#059669' }} /> Booking Receipt Preview
                </h3>
              </div>
              <div className="card-body">
                {generatedBooking ? (
                  <div className="invoice-container">
                    {/* Header */}
                    <div className="invoice-title">NANDHI MOTORS</div>
                    <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#6b7280', marginBottom: '4px' }}>
                      128, Bangalore Main Road, Hosur - 635109
                    </p>
                    <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#6b7280', marginBottom: '18px' }}>
                      Ph: 04344-000000 | GSTIN: 33XXXXX0000X1ZX
                    </p>

                    <div style={{
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      letterSpacing: '1px',
                      borderTop: '1px solid #000',
                      borderBottom: '1px solid #000',
                      padding: '5px 0',
                      marginBottom: '14px'
                    }}>
                      VEHICLE BOOKING RECEIPT
                    </div>

                    <div className="invoice-meta">
                      <div>
                        <strong>Booking ID:</strong> {generatedBooking.id}<br />
                        <strong>Customer:</strong> {generatedBooking.customerName}<br />
                        <strong>Mobile:</strong> {generatedBooking.mobile}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong>Date:</strong> {generatedBooking.bookingDate}<br />
                        <strong>Created:</strong> {generatedBooking.createdOn}
                      </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', margin: '18px 0' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1.5px solid #000' }}>
                          <th style={{ textAlign: 'left', padding: '6px 8px' }}>Details / Item</th>
                          <th style={{ textAlign: 'right', padding: '6px 8px' }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px dotted #ccc' }}>
                          <td style={{ padding: '6px 8px' }}>Vehicle Model Chosen</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px' }}>{generatedBooking.vehicleModel}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px dotted #ccc' }}>
                          <td style={{ padding: '6px 8px' }}>Vehicle Color Chosen</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px' }}>{generatedBooking.vehicleColor}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px dotted #ccc' }}>
                          <td style={{ padding: '6px 8px' }}>Booking Advance Deposited</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px' }}><strong>₹{Number(generatedBooking.bookingAmount).toLocaleString('en-IN')}</strong></td>
                        </tr>
                        <tr style={{ borderBottom: '1px dotted #ccc' }}>
                          <td style={{ padding: '6px 8px' }}>Payment Mode Chosen</td>
                          <td style={{ textAlign: 'right', padding: '6px 8px' }}>{generatedBooking.paymentMode}</td>
                        </tr>
                        {generatedBooking.deliveryDate && (
                          <tr style={{ borderBottom: '1px dotted #ccc' }}>
                            <td style={{ padding: '6px 8px' }}>Expected Delivery Date</td>
                            <td style={{ textAlign: 'right', padding: '6px 8px' }}>{generatedBooking.deliveryDate}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {generatedBooking.notes && (
                      <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#6b7280', backgroundColor: '#f9fafb', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                        <strong>Notes:</strong> {generatedBooking.notes}
                      </div>
                    )}

                    <div style={{ marginTop: '28px', borderTop: '1px dashed #ccc', paddingTop: '12px', fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center' }}>
                      This is a computer-generated booking receipt. Signature not required.<br />
                      Thank you for choosing Nandhi Motors!
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => setPrintModalConfig({ isOpen: true, type: 'booking', data: generatedBooking })}
                      >
                        <Printer size={14} /> Print Preview & Print
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={clearBookingForm}
                      >
                        New Booking
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '340px', color: '#9ca3af', textAlign: 'center' }}>
                    <Calendar size={48} strokeWidth={1} style={{ marginBottom: '14px' }} />
                    <p>Select a booking from the ledger on the left to preview.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: INVOICE */}
      {activeFormTab === 'invoice' && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(3px)'
        }} onClick={() => setActiveFormTab(null)}>
          <div className="card" style={{
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">
                <FileCode size={18} style={{ color: '#059669' }} /> {editingInvoiceId ? `Edit Tax Invoice #${editingInvoiceId}` : 'Tax Invoice Generator'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingInvoiceId && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditingInvoiceId(null);
                      setInvoiceFormData(prev => ({ ...prev, invoiceNo: '01' }));
                    }}
                    style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#b91c1c' }}
                  >
                    Reset Form
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setActiveFormTab(null); setEditingInvoiceId(null); }}
                  style={{ padding: '4px 10px', minWidth: 'auto' }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <form className="card-body" onSubmit={(e) => { handleInvoiceSubmit(e); setActiveFormTab(null); }}>
              {/* SECTION 1: CUSTOMER DETAILS */}
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontWeight: 700 }}>
                  1. Customer & Invoice Info
                </h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Invoice Number (Auto-Generated)</label>
                    <input
                      type="text"
                      className="form-control"
                      disabled
                      value={invoiceFormData.invoiceNo}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Invoice Date</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={invoiceFormData.invoiceDate}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, invoiceDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Customer Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rahul Kumar"
                      required
                      value={invoiceFormData.customerName}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="form-control"
                      placeholder="10-digit number"
                      required
                      pattern="[0-9]{10}"
                      value={invoiceFormData.customerPhone}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Aadhar Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="12-digit Aadhar"
                      pattern="[0-9]{12}"
                      value={invoiceFormData.customerAadhar}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerAadhar: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customer GSTIN (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="15-digit GSTIN"
                      style={{ textTransform: 'uppercase' }}
                      value={invoiceFormData.customerGst}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerGst: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter complete billing address"
                    value={invoiceFormData.customerAddress}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerAddress: e.target.value })}
                  />
                </div>
              </div>

              {/* SECTION 2: VEHICLE TECHNICAL DETAILS */}
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontWeight: 700 }}>
                  2. Vehicle Technical Details (Uppercase)
                </h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Choose Model *</label>
                    <select
                      className="form-control"
                      required
                      value={invoiceFormData.vehicleModel}
                      onChange={(e) => {
                        const model = e.target.value;
                        setInvoiceFormData({
                          ...invoiceFormData,
                          vehicleModel: model
                        });
                      }}
                    >
                      {vehicleList.map((veh, idx) => (
                        <option key={idx} value={veh.name}>{veh.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Choose Color *</label>
                    <select
                      className="form-control"
                      required
                      value={invoiceFormData.vehicleColor}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, vehicleColor: e.target.value })}
                    >
                      {allVehicleColors.map((color, idx) => (
                        <option key={idx} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">VIN / Chassis Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter 17-digit Chassis VIN"
                      style={{ textTransform: 'uppercase' }}
                      value={invoiceFormData.vinNumber}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, vinNumber: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Battery Serial Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Battery serial number"
                      style={{ textTransform: 'uppercase' }}
                      value={invoiceFormData.batteryNumber}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, batteryNumber: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Charger Serial Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Charger serial number"
                      style={{ textTransform: 'uppercase' }}
                      value={invoiceFormData.chargerNumber}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, chargerNumber: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Controller Serial Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Controller serial number"
                      style={{ textTransform: 'uppercase' }}
                      value={invoiceFormData.controllerNumber}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, controllerNumber: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Warranty Details</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="3 Year Warranty on Battery & Motor"
                    value={invoiceFormData.warrantyDetails}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, warrantyDetails: e.target.value })}
                  />
                </div>
              </div>

              {/* SECTION 3: BILLING DETAILS */}
              <div style={{ marginBottom: '8px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontWeight: 700 }}>
                  3. Billing & Tax Pricing
                </h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Ex-Showroom Price (₹) *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      required
                      value={invoiceFormData.exShowroom}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*$/.test(val)) {
                          setInvoiceFormData({ ...invoiceFormData, exShowroom: val });
                        }
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST Tax Rate *</label>
                    <select
                      className="form-control"
                      required
                      value={invoiceFormData.gstRate}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, gstRate: Number(e.target.value) })}
                    >
                      <option value={28}>28% GST (Standard)</option>
                      <option value={18}>18% GST</option>
                      <option value={12}>12% GST</option>
                      <option value={5}>5% GST (EV Standard)</option>
                      <option value={0}>0% GST (Exempted)</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">RTO Registration Charges (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      value={invoiceFormData.rto}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*$/.test(val)) {
                          setInvoiceFormData({ ...invoiceFormData, rto: val });
                        }
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comprehensive Insurance (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      value={invoiceFormData.insurance}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*$/.test(val)) {
                          setInvoiceFormData({ ...invoiceFormData, insurance: val });
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Subsidy Amount (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      style={{ color: '#059669', fontWeight: 600 }}
                      value={invoiceFormData.subsidy}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*$/.test(val)) {
                          setInvoiceFormData({ ...invoiceFormData, subsidy: val });
                        }
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dealer Discount (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      style={{ color: '#ef4444', fontWeight: 600 }}
                      value={invoiceFormData.discount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*$/.test(val)) {
                          setInvoiceFormData({ ...invoiceFormData, discount: val });
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Payment Status *</label>
                    <select
                      className="form-control"
                      required
                      value={invoiceFormData.paymentStatus}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, paymentStatus: e.target.value })}
                    >
                      <option value="Fully Paid">Fully Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Grand Total (Rounded):</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#059669' }}>
                  ₹{calculateInvoiceTotalDetails().grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '11px', fontWeight: 600 }}>
                Save & Preview Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 4: INVOICE */}
      {activeSubTab === 'invoice' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: showPreviews ? '1.2fr 1fr' : '1fr',
          gap: '24px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {/* Left Column: Saved Tax Invoices */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h3 className="card-title">Saved Tax Invoices</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe', fontWeight: 600 }}
                  onClick={() => setIsMonthlyReportOpen(true)}
                  title="View Monthly Sales & GST Tax Reports"
                >
                  <BarChart3 size={14} /> Monthly Report
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveFormTab('invoice')}
                >
                  + Generate Invoice
                </button>
              </div>
            </div>
            <div className="card-body" style={{ maxHeight: '680px', overflowY: 'auto', padding: '12px' }}>
              {invoiceSuccessMsg && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  borderRadius: '6px',
                  border: '1px solid #a7f3d0',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <span>✅</span> <span>{invoiceSuccessMsg}</span>
                </div>
              )}

              {/* Invoice History Stats Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                backgroundColor: '#f9fafb',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Invoiced</span>
                  <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>₹{invoiceSummaryStats.totalAmount.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Avg Order</span>
                  <strong style={{ fontSize: '0.9rem', color: '#059669' }}>₹{invoiceSummaryStats.avgVal.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Fully / Part / Unpaid</span>
                  <span style={{ fontSize: '0.72rem', color: '#1f2937', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                    {invoiceSummaryStats.fullyPaid}F / {invoiceSummaryStats.partiallyPaid}P / {invoiceSummaryStats.unpaid}U
                  </span>
                </div>
              </div>

              {invoices && invoices.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {invoices.map((inv, idx) => (
                    <div
                      key={idx}
                      onClick={() => setGeneratedInvoice(inv)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: generatedInvoice?.invoiceNo === inv.invoiceNo ? '#f0fdf4' : '#ffffff',
                        borderColor: generatedInvoice?.invoiceNo === inv.invoiceNo ? '#86efac' : '#e5e7eb',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <strong>Inv #{inv.invoiceNo}</strong> | {inv.customerName}<br />
                        <span style={{ color: '#6b7280' }}>Date: {inv.invoiceDate || inv.createdOn} | {inv.vehicleModel}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <strong style={{ color: '#059669', marginRight: '4px' }}>₹{Number(inv.grandTotal || 0).toLocaleString('en-IN')}</strong>
                        
                        {/* WhatsApp Share Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#16a34a', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}
                          onClick={() => handleShareInvoiceWhatsApp(inv)}
                          title="Share Tax Invoice on WhatsApp"
                        >
                          <MessageCircle size={13} />
                        </button>

                        {/* Edit Invoice Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
                          onClick={() => handleEditInvoice(inv)}
                          title="Edit Invoice"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Print Preview Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', display: 'flex', alignItems: 'center' }}
                          onClick={() => {
                            setGeneratedInvoice(inv);
                            setPrintModalConfig({ isOpen: true, type: 'invoice', data: inv });
                          }}
                          title="Print Preview Popup"
                        >
                          <Printer size={12} />
                        </button>

                        {/* Delete Invoice Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', color: '#ef4444', borderColor: '#fca5a5' }}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete Invoice #${inv.invoiceNo}?`)) {
                              deleteInvoice(inv.invoiceNo);
                              if (generatedInvoice?.invoiceNo === inv.invoiceNo) {
                                setGeneratedInvoice(null);
                              }
                            }
                          }}
                          title="Delete Invoice"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
                  <Clipboard size={32} strokeWidth={1} style={{ marginBottom: '8px' }} />
                  <p>No saved invoices found. Generate one to start.</p>
                </div>
              )}
            </div>
          </div>

          {/* Print Preview Card */}
          {showPreviews && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Printer size={18} style={{ color: '#059669' }} /> Print Preview
                </h3>
              </div>
              <div className="card-body">
                {generatedInvoice ? (
                  <div className="invoice-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div className="invoice-title" style={{ textAlign: 'left', margin: 0 }}>NANDHI MOTORS</div>
                        <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>
                          128, Bangalore Main Road, Hosur - 635109<br />
                          GSTIN: 33XXXXX0000X1ZX
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge" style={{
                          backgroundColor: generatedInvoice.paymentStatus === 'Fully Paid' ? '#ecfdf5' : generatedInvoice.paymentStatus === 'Partially Paid' ? '#fffbeb' : '#fef2f2',
                          color: generatedInvoice.paymentStatus === 'Fully Paid' ? '#047857' : generatedInvoice.paymentStatus === 'Partially Paid' ? '#b45309' : '#b91c1c',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: '4px'
                        }}>
                          {generatedInvoice.paymentStatus}
                        </span>
                        <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>
                          Invoice Date: {generatedInvoice.invoiceDate}<br />
                          Invoice ID: <strong>#{generatedInvoice.invoiceNo}</strong>
                        </p>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', margin: '12px 0', padding: '6px 0', fontSize: '0.8rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <strong>BILL TO:</strong><br />
                        Name: {generatedInvoice.customerName}<br />
                        Phone: {generatedInvoice.customerPhone}<br />
                        Address: {generatedInvoice.customerAddress || 'N/A'}<br />
                        {generatedInvoice.customerAadhar && <>Aadhar: {generatedInvoice.customerAadhar}<br /></>}
                        {generatedInvoice.customerGst && <>Customer GST: {generatedInvoice.customerGst}<br /></>}
                      </div>
                      <div>
                        <strong>VEHICLE DETAILS:</strong><br />
                        Model: {generatedInvoice.vehicleModel}<br />
                        Color: {generatedInvoice.vehicleColor}<br />
                        VIN: {generatedInvoice.vin || 'N/A'}<br />
                        Battery: {generatedInvoice.batteryNo || 'N/A'}<br />
                        Charger: {generatedInvoice.chargerNo || 'N/A'}<br />
                        Controller: {generatedInvoice.controllerNo || 'N/A'}
                      </div>
                    </div>

                    {generatedInvoice.warrantyDetails && (
                      <div style={{ fontSize: '0.72rem', color: '#374151', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '6px 10px', borderRadius: '4px', marginBottom: '12px' }}>
                        <strong>Warranty Coverage:</strong> {generatedInvoice.warrantyDetails}
                      </div>
                    )}

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', margin: '10px 0' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1.5px solid #000' }}>
                          <th style={{ textAlign: 'left', padding: '4px 6px' }}>Item Description</th>
                          <th style={{ textAlign: 'right', padding: '4px 6px' }}>Qty</th>
                          <th style={{ textAlign: 'right', padding: '4px 6px' }}>Rate (₹)</th>
                          <th style={{ textAlign: 'right', padding: '4px 6px' }}>GST Rate</th>
                          <th style={{ textAlign: 'right', padding: '4px 6px' }}>GST (₹)</th>
                          <th style={{ textAlign: 'right', padding: '4px 6px' }}>Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px dotted #ccc' }}>
                          <td style={{ padding: '4px 6px' }}>{generatedInvoice.vehicleModel} EV Vehicle</td>
                          <td style={{ textAlign: 'right', padding: '4px 6px' }}>1</td>
                          <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹{Number(generatedInvoice.vehiclePrice || 0).toLocaleString('en-IN')}</td>
                          <td style={{ textAlign: 'right', padding: '4px 6px' }}>{generatedInvoice.gstChoose}%</td>
                          <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹{Number(generatedInvoice.gstTax || 0).toLocaleString('en-IN')}</td>
                          <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹{Number(generatedInvoice.totalWithGst || 0).toLocaleString('en-IN')}</td>
                        </tr>
                        {Number(generatedInvoice.insurance || 0) > 0 && (
                          <tr style={{ borderBottom: '1px dotted #ccc' }}>
                            <td style={{ padding: '4px 6px' }}>Comprehensive Insurance</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>1</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹{Number(generatedInvoice.insurance).toLocaleString('en-IN')}</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>0%</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹0</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹{Number(generatedInvoice.insurance).toLocaleString('en-IN')}</td>
                          </tr>
                        )}
                        {Number(generatedInvoice.rto || 0) > 0 && (
                          <tr style={{ borderBottom: '1px dotted #ccc' }}>
                            <td style={{ padding: '4px 6px' }}>RTO Registration & Plate Charges</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>1</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹{Number(generatedInvoice.rto).toLocaleString('en-IN')}</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>0%</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹0</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹{Number(generatedInvoice.rto).toLocaleString('en-IN')}</td>
                          </tr>
                        )}
                        {Number(generatedInvoice.handlingCharges || 0) > 0 && (
                          <tr style={{ borderBottom: '1px dotted #ccc' }}>
                            <td style={{ padding: '4px 6px' }}>Logistics & Showroom Handling Fees</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>1</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹{Number(generatedInvoice.handlingCharges).toLocaleString('en-IN')}</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>0%</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹0</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹{Number(generatedInvoice.handlingCharges).toLocaleString('en-IN')}</td>
                          </tr>
                        )}
                        {Number(generatedInvoice.accessoriesPrice || 0) > 0 && (
                          <tr style={{ borderBottom: '1px dotted #ccc' }}>
                            <td style={{ padding: '4px 6px' }}>Showroom Accessories Kit</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>1</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹{Number(generatedInvoice.accessoriesPrice).toLocaleString('en-IN')}</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>0%</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹0</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹{Number(generatedInvoice.accessoriesPrice).toLocaleString('en-IN')}</td>
                          </tr>
                        )}
                        {Number(generatedInvoice.subsidyDiscount || 0) > 0 && (
                          <tr style={{ color: '#ef4444', borderBottom: '1px dotted #ccc' }}>
                            <td style={{ padding: '4px 6px' }}>FAME-II Govt Subsidy Credit (-)</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>1</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>-₹{Number(generatedInvoice.subsidyDiscount).toLocaleString('en-IN')}</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>0%</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹0</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>-₹{Number(generatedInvoice.subsidyDiscount).toLocaleString('en-IN')}</td>
                          </tr>
                        )}
                        {Number(generatedInvoice.dealerDiscount || 0) > 0 && (
                          <tr style={{ color: '#ef4444', borderBottom: '1px dotted #ccc' }}>
                            <td style={{ padding: '4px 6px' }}>Dealer Festival Promotion (-)</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>1</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>-₹{Number(generatedInvoice.dealerDiscount).toLocaleString('en-IN')}</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>0%</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>₹0</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>-₹{Number(generatedInvoice.dealerDiscount).toLocaleString('en-IN')}</td>
                          </tr>
                        )}
                        {Math.abs(Number(generatedInvoice.roundOffDiff || 0)) > 0.01 && (
                          <tr style={{ borderBottom: '1px dotted #ccc', fontStyle: 'italic', color: '#6b7280' }}>
                            <td style={{ padding: '4px 6px' }}>Total Roundoff Adjustment</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>1</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>
                              {Number(generatedInvoice.roundOffDiff) > 0 ? '+' : ''}₹{Number(generatedInvoice.roundOffDiff).toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>-</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>-</td>
                            <td style={{ textAlign: 'right', padding: '4px 6px' }}>
                              {Number(generatedInvoice.roundOffDiff) > 0 ? '+' : ''}₹{Number(generatedInvoice.roundOffDiff).toFixed(2)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    <div className="invoice-totals" style={{ margin: '8px 0' }}>
                      <div className="invoice-row bold" style={{ fontSize: '0.98rem', display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #000' }}>
                        <span>Invoice Grand Total:</span>
                        <span style={{ color: '#059669' }}>₹{generatedInvoice.grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '10px', fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center' }}>
                      Certified that the particulars given above are true and correct.<br />
                      This is a computer generated invoice printout.
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, minWidth: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#15803d' }}
                        onClick={() => handleShareInvoiceWhatsApp(generatedInvoice)}
                      >
                        <MessageCircle size={14} /> Send WhatsApp
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, minWidth: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#eff6ff', borderColor: '#93c5fd', color: '#1d4ed8' }}
                        onClick={() => handleEditInvoice(generatedInvoice)}
                      >
                        <Edit2 size={14} /> Edit Invoice
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, minWidth: '130px' }}
                        onClick={() => setPrintModalConfig({ isOpen: true, type: 'invoice', data: generatedInvoice })}
                      >
                        <Printer size={14} /> Print Preview
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ padding: '6px 14px' }}
                        onClick={() => setGeneratedInvoice(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#9ca3af', textAlign: 'center' }}>
                    <FileCode size={48} strokeWidth={1} style={{ marginBottom: '14px' }} />
                    <p>Select an invoice from the ledger on the left to preview.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {/* SUBTAB 1 Lead Form Modal */}
      {activeFormTab === 'lead' && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(3px)'
        }} onClick={() => setActiveFormTab(null)}>
          <div className="card" style={{
            width: '90%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">
                <UserPlus size={18} style={{ color: '#059669' }} /> {editingLead ? `Edit Sale Lead (${editingLead.id})` : 'New Sale Lead Entry'}
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setActiveFormTab(null); setEditingLead(null); }}
                style={{ padding: '4px 10px', minWidth: 'auto' }}
              >
                ✕ Close
              </button>
            </div>
            <form className="card-body" onSubmit={handleLeadFormSubmit}>
              {/* SECTION A: CUSTOMER DETAILS */}
              <div style={{ marginBottom: '24px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontWeight: 700 }}>
                  1. Customer Details
                </h4>
                
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter customer name"
                    required
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="form-control"
                      placeholder="10-digit number"
                      required
                      pattern="[0-9]{10}"
                      value={leadFormData.mobile}
                      onChange={(e) => setLeadFormData({ ...leadFormData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={leadFormData.email}
                      onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Aadhar Card Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="12-digit number"
                      maxLength="14"
                      value={leadFormData.aadhar}
                      onChange={(e) => setLeadFormData({ ...leadFormData, aadhar: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lead Type Choose (Source)</label>
                    <select
                      className="form-control"
                      value={leadFormData.sourceType}
                      onChange={(e) => setLeadFormData({ ...leadFormData, sourceType: e.target.value })}
                    >
                      <option value="Walk-In">Walk-In Showroom Visit</option>
                      <option value="Phone Inquiry">Phone Inquiry Call</option>
                      <option value="Social Media">Social Media Lead</option>
                      <option value="Customer Reference">Customer Reference</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="House No, Street, Landmark, Area"
                      value={leadFormData.address}
                      onChange={(e) => setLeadFormData({ ...leadFormData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Executive *</label>
                  <select
                    className="form-control"
                    value={leadFormData.executive}
                    onChange={(e) => setLeadFormData({ ...leadFormData, executive: e.target.value })}
                  >
                    {executiveList.map((exec, idx) => (
                      <option key={idx} value={exec}>{exec}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION B: VEHICLE DETAILS */}
              <div style={{ marginBottom: '24px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontWeight: 700 }}>
                  2. Vehicle Details
                </h4>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Choose Vehicle Model *</label>
                    <select
                      className="form-control"
                      required
                      value={leadFormData.vehicleModel}
                      onChange={(e) => handleLeadVehicleChange(e.target.value)}
                    >
                      {vehicleList.map((veh, idx) => (
                        <option key={idx} value={veh.name}>{veh.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Choose Color *</label>
                    <select
                      className="form-control"
                      required
                      value={leadFormData.vehicleColor}
                      onChange={(e) => setLeadFormData({ ...leadFormData, vehicleColor: e.target.value })}
                    >
                      {allVehicleColors.map((color, idx) => (
                        <option key={idx} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ex-Showroom Price (₹) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    required
                    placeholder="Enter ex-showroom price"
                    value={leadFormData.price}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*$/.test(val)) {
                        setLeadFormData({ ...leadFormData, price: val });
                      }
                    }}
                  />
                </div>
              </div>

              {/* SECTION C: LEAD FOLLOWUP */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontWeight: 700 }}>
                  3. Lead Followup
                </h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Lead Type (Temperature)</label>
                    <select
                      className="form-control"
                      value={leadFormData.leadType}
                      onChange={(e) => setLeadFormData({ ...leadFormData, leadType: e.target.value })}
                    >
                      <option value="Hot">🔥 Hot Lead</option>
                      <option value="Cold">❄️ Cold Lead</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lead Status</label>
                    <select
                      className="form-control"
                      value={leadFormData.status}
                      onChange={(e) => setLeadFormData({ ...leadFormData, status: e.target.value })}
                    >
                      <option value="Entered">Entered (New)</option>
                      <option value="Follow-up">In Follow-up</option>
                      <option value="Convert">Converted (Booking Done)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Follow-up Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={leadFormData.followupDate}
                      onChange={(e) => setLeadFormData({ ...leadFormData, followupDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Note / Action Description</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder=""
                      value={leadFormData.note}
                      onChange={(e) => setLeadFormData({ ...leadFormData, note: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 600 }}>
                {editingLead ? 'UPDATE SALE LEAD' : 'SUBMIT SALE LEAD'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 2 Quotation Form Modal */}
      {activeFormTab === 'quote' && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(3px)'
        }} onClick={() => setActiveFormTab(null)}>
          <div className="card" style={{
            width: '90%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">
                <Calculator size={18} style={{ color: '#059669' }} /> {editingQuoteId ? `Edit Quotation #${editingQuoteId}` : 'On-Road Quotation Builder'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingQuoteId && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingQuoteId(null)}
                    style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#b91c1c' }}
                  >
                    Reset Form
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setActiveFormTab(null); setEditingQuoteId(null); }}
                  style={{ padding: '4px 10px', minWidth: 'auto' }}
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <form className="card-body" onSubmit={(e) => { handleQuoteSubmit(e); setActiveFormTab(null); }}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter customer name"
                    value={quoteFormData.customerName}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, customerName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className="form-control"
                    placeholder="10-digit mobile"
                    pattern="[0-9]{10}"
                    value={quoteFormData.customerPhone}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vehicle Model *</label>
                  <select
                    className="form-control"
                    required
                    value={quoteFormData.vehicleModel}
                    onChange={(e) => {
                      const selectedModel = e.target.value;
                      const matchedVeh = vehicleList.find(v => v.name === selectedModel);
                      setQuoteFormData({ 
                        ...quoteFormData, 
                        vehicleModel: selectedModel,
                        exShowroom: matchedVeh ? matchedVeh.basePrice : ''
                      });
                    }}
                  >
                    <option value="">Choose Option</option>
                    {vehicleList.map((veh, idx) => (
                      <option key={idx} value={veh.name}>{veh.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Choose Color *</label>
                  <select
                    className="form-control"
                    required
                    value={quoteFormData.vehicleColor}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, vehicleColor: e.target.value })}
                  >
                    <option value="">Choose Color</option>
                    {allVehicleColors.map((color, idx) => (
                      <option key={idx} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Ex-Showroom Base Price (₹) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    placeholder="Enter ex-showroom price"
                    required
                    value={quoteFormData.exShowroom}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*$/.test(val)) {
                        setQuoteFormData({ ...quoteFormData, exShowroom: val });
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Special Dealer Discount (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    placeholder="Enter dealer discount"
                    style={{ color: '#ef4444', fontWeight: 600 }}
                    value={quoteFormData.discount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*$/.test(val)) {
                        setQuoteFormData({ ...quoteFormData, discount: val });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">RTO Registration Charges (₹) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    placeholder="Enter RTO road tax"
                    required
                    value={quoteFormData.rto}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*$/.test(val)) {
                        setQuoteFormData({ ...quoteFormData, rto: val });
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Comprehensive Insurance (₹) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    placeholder="Enter insurance premium"
                    required
                    value={quoteFormData.insurance}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*$/.test(val)) {
                        setQuoteFormData({ ...quoteFormData, insurance: val });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Standard Accessories / Helmet (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    placeholder="Enter accessories cost"
                    value={quoteFormData.accessories}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*$/.test(val)) {
                        setQuoteFormData({ ...quoteFormData, accessories: val });
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Logistics / Handling (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    placeholder="Enter handling fees"
                    value={quoteFormData.handling}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*$/.test(val)) {
                        setQuoteFormData({ ...quoteFormData, handling: val });
                      }
                    }}
                  />
                </div>
              </div>

              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Estimated On-Road Price:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#059669' }}>
                  ₹{calculateOnRoadTotal().toLocaleString('en-IN')}
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '10px', fontWeight: 600 }}>
                Generate On-Road Quotation Printout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 3 Booking Form Modal */}
      {activeFormTab === 'booking' && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(3px)'
        }} onClick={() => setActiveFormTab(null)}>
          <div className="card" style={{
            width: '90%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">
                <Calendar size={18} style={{ color: '#059669' }} /> New Vehicle Booking
              </h3>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveFormTab(null)}
                style={{ padding: '4px 10px', minWidth: 'auto' }}
              >
                ✕ Close
              </button>
            </div>
            <form className="card-body" onSubmit={(e) => { handleBookingSubmit(e); setActiveFormTab(null); }}>
              <h4 style={{ fontSize: '0.82rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontWeight: 700 }}>
                Customer Details
              </h4>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter customer name"
                    required
                    value={bookingForm.customerName}
                    onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className="form-control"
                    placeholder="10-digit number"
                    required
                    pattern="[0-9]{10}"
                    value={bookingForm.mobile}
                    onChange={(e) => setBookingForm({ ...bookingForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: '4px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.82rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontWeight: 700 }}>
                  Vehicle Details
                </h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Choose Vehicle Model *</label>
                  <select
                    className="form-control"
                    required
                    value={bookingForm.vehicleModel}
                    onChange={(e) => handleBookingVehicleChange(e.target.value)}
                  >
                    {vehicleList.map((veh, idx) => (
                      <option key={idx} value={veh.name}>{veh.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Choose Color *</label>
                  <select
                    className="form-control"
                    required
                    value={bookingForm.vehicleColor}
                    onChange={(e) => setBookingForm({ ...bookingForm, vehicleColor: e.target.value })}
                  >
                    {allVehicleColors.map((color, idx) => (
                      <option key={idx} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: '4px', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.82rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontWeight: 700 }}>
                  Booking Details
                </h4>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Booking Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={bookingForm.bookingDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Delivery Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={bookingForm.deliveryDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, deliveryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Booking Amount (₹) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    placeholder="Enter booking advance amount"
                    required
                    value={bookingForm.bookingAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^\d*$/.test(val)) {
                        setBookingForm({ ...bookingForm, bookingAmount: val });
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select
                    className="form-control"
                    value={bookingForm.paymentMode}
                    onChange={(e) => setBookingForm({ ...bookingForm, paymentMode: e.target.value })}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cheque">Cheque</option>
                    <option value="NEFT">NEFT / Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder=""
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '11px', fontWeight: 600 }}>
                  Confirm Booking & Preview
                </button>
                <button type="button" className="btn btn-secondary" style={{ padding: '11px 16px' }} onClick={clearBookingForm}>
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MONTHLY WISE INVOICE REPORT MODAL */}
      {isMonthlyReportOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1200,
          padding: '20px'
        }} onClick={() => setIsMonthlyReportOpen(false)}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '1050px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            margin: 0,
            backgroundColor: '#ffffff'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Report Header */}
            <div className="card-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#1f2937',
              color: '#ffffff',
              padding: '14px 20px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BarChart3 size={24} style={{ color: '#10b981' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                    Monthly Invoice Sales & GST Tax Report
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' }}>
                    Multi-field filters &bull; Name, Sale Amount, GST Amount & Column selector
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: showColumnSelector ? '#059669' : '#374151', color: '#ffffff', border: '1px solid #4b5563', fontSize: '0.78rem' }}
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                  title="Select which fields to display in report"
                >
                  ⚙️ Select Fields ({Object.values(visibleColumns).filter(Boolean).length})
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#059669', color: '#ffffff', border: 'none', fontWeight: 600, fontSize: '0.78rem' }}
                  onClick={handleExportMonthlyCSV}
                >
                  <Download size={13} /> Export CSV
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsMonthlyReportOpen(false)}
                  style={{ backgroundColor: '#4b5563', color: '#ffffff', border: 'none', padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Report Body */}
            <div className="card-body" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              
              {/* INTERACTIVE MULTI-FIELD FILTER BAR */}
              <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.82rem', color: '#111827' }}>
                    <Filter size={15} style={{ color: '#059669' }} /> Filter Invoices by Fields
                  </div>
                  <button
                    type="button"
                    onClick={() => setReportFilters({
                      month: 'ALL',
                      customerName: '',
                      vehicleModel: 'ALL',
                      paymentStatus: 'ALL',
                      minSaleAmount: '',
                      maxSaleAmount: '',
                      minGstAmount: '',
                      maxGstAmount: ''
                    })}
                    style={{ background: 'none', border: 'none', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Reset All Filters
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                  {/* Month Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#4b5563', marginBottom: '3px' }}>
                      Month / Period
                    </label>
                    <select
                      className="form-control"
                      style={{ fontSize: '0.78rem', padding: '5px 8px', height: '32px' }}
                      value={reportFilters.month}
                      onChange={(e) => setReportFilters({ ...reportFilters, month: e.target.value })}
                    >
                      <option value="ALL">All Recorded Months</option>
                      {monthlyInvoiceReportData.monthList.map((m, idx) => (
                        <option key={idx} value={m}>
                          {m} ({monthlyInvoiceReportData.monthGroups[m]?.count || 0} Invoices)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Name Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#4b5563', marginBottom: '3px' }}>
                      Customer Name / Mobile
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '0.78rem', padding: '5px 8px', height: '32px' }}
                      placeholder="Search customer..."
                      value={reportFilters.customerName}
                      onChange={(e) => setReportFilters({ ...reportFilters, customerName: e.target.value })}
                    />
                  </div>

                  {/* Vehicle Model Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#4b5563', marginBottom: '3px' }}>
                      Vehicle Model
                    </label>
                    <select
                      className="form-control"
                      style={{ fontSize: '0.78rem', padding: '5px 8px', height: '32px' }}
                      value={reportFilters.vehicleModel}
                      onChange={(e) => setReportFilters({ ...reportFilters, vehicleModel: e.target.value })}
                    >
                      <option value="ALL">All Vehicle Models</option>
                      {vehicleList.map((v, idx) => (
                        <option key={idx} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Status Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#4b5563', marginBottom: '3px' }}>
                      Payment Status
                    </label>
                    <select
                      className="form-control"
                      style={{ fontSize: '0.78rem', padding: '5px 8px', height: '32px' }}
                      value={reportFilters.paymentStatus}
                      onChange={(e) => setReportFilters({ ...reportFilters, paymentStatus: e.target.value })}
                    >
                      <option value="ALL">All Payment Statuses</option>
                      <option value="Fully Paid">Fully Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>

                {/* Second Filter Row: Sale Amount Range & GST Amount Range */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#4b5563', marginBottom: '3px' }}>
                      Min Sale Amount (₹)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ fontSize: '0.78rem', padding: '5px 8px', height: '32px' }}
                      placeholder="e.g. 50000"
                      value={reportFilters.minSaleAmount}
                      onChange={(e) => setReportFilters({ ...reportFilters, minSaleAmount: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#4b5563', marginBottom: '3px' }}>
                      Max Sale Amount (₹)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ fontSize: '0.78rem', padding: '5px 8px', height: '32px' }}
                      placeholder="e.g. 150000"
                      value={reportFilters.maxSaleAmount}
                      onChange={(e) => setReportFilters({ ...reportFilters, maxSaleAmount: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#4b5563', marginBottom: '3px' }}>
                      Min GST Amount (₹)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ fontSize: '0.78rem', padding: '5px 8px', height: '32px' }}
                      placeholder="e.g. 2000"
                      value={reportFilters.minGstAmount}
                      onChange={(e) => setReportFilters({ ...reportFilters, minGstAmount: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#4b5563', marginBottom: '3px' }}>
                      Max GST Amount (₹)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ fontSize: '0.78rem', padding: '5px 8px', height: '32px' }}
                      placeholder="e.g. 10000"
                      value={reportFilters.maxGstAmount}
                      onChange={(e) => setReportFilters({ ...reportFilters, maxGstAmount: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SELECT REPORT FIELDS TO DISPLAY / EXPORT ACCORDION */}
              {showColumnSelector && (
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px', marginBottom: '18px', animation: 'fadeIn 0.2s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af' }}>
                      📋 Select All Fields to Display in Report & Export:
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const allTrue = {};
                          Object.keys(visibleColumns).forEach(k => allTrue[k] = true);
                          setVisibleColumns(allTrue);
                        }}
                        style={{ backgroundColor: '#ffffff', border: '1px solid #93c5fd', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Select All Fields
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisibleColumns({
                          invoiceNo: true,
                          invoiceDate: true,
                          customerName: true,
                          customerPhone: true,
                          customerAddress: false,
                          customerAadhar: false,
                          customerGst: false,
                          vehicleModel: true,
                          vehicleColor: true,
                          vinNumber: true,
                          engineNo: false,
                          batteryNumber: false,
                          exShowroom: true,
                          gstRate: false,
                          gstAmount: true,
                          insurance: false,
                          rto: false,
                          subsidy: false,
                          discount: false,
                          grandTotal: true,
                          paymentStatus: true
                        })}
                        style={{ backgroundColor: '#ffffff', border: '1px solid #93c5fd', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Reset Defaults
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', fontSize: '0.75rem' }}>
                    {[
                      { key: 'invoiceNo', label: 'Invoice No' },
                      { key: 'invoiceDate', label: 'Invoice Date' },
                      { key: 'customerName', label: 'Customer Name' },
                      { key: 'customerPhone', label: 'Mobile Number' },
                      { key: 'customerAddress', label: 'Address' },
                      { key: 'customerAadhar', label: 'Aadhaar No' },
                      { key: 'customerGst', label: 'Customer GSTIN' },
                      { key: 'vehicleModel', label: 'Vehicle Model' },
                      { key: 'vehicleColor', label: 'Vehicle Color' },
                      { key: 'vinNumber', label: 'VIN / Chassis' },
                      { key: 'engineNo', label: 'Motor / Engine No' },
                      { key: 'batteryNumber', label: 'Battery / Charger' },
                      { key: 'exShowroom', label: 'Sale Amount (Base)' },
                      { key: 'gstRate', label: 'GST Rate %' },
                      { key: 'gstAmount', label: 'GST Amount (₹)' },
                      { key: 'insurance', label: 'Insurance (₹)' },
                      { key: 'rto', label: 'RTO & Tax (₹)' },
                      { key: 'subsidy', label: 'Govt Subsidy (₹)' },
                      { key: 'discount', label: 'Discount (₹)' },
                      { key: 'grandTotal', label: 'Grand Total (₹)' },
                      { key: 'paymentStatus', label: 'Payment Status' }
                    ].map((col, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#1f2937' }}>
                        <input
                          type="checkbox"
                          checked={!!visibleColumns[col.key]}
                          onChange={(e) => setVisibleColumns({ ...visibleColumns, [col.key]: e.target.checked })}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(() => {
                const dynamicStats = {
                  count: filteredReportInvoices.length,
                  totalRevenue: filteredReportInvoices.reduce((s, i) => s + Number(i.grandTotal || 0), 0),
                  totalTaxable: filteredReportInvoices.reduce((s, i) => s + Number(i.exShowroom || (i.grandTotal * 0.78) || 0), 0),
                  totalGst: filteredReportInvoices.reduce((s, i) => s + Number(i.gstAmount || Math.round(Number(i.exShowroom || 0) * 0.05) || 0), 0),
                  fullyPaid: filteredReportInvoices.filter(i => i.paymentStatus === 'Fully Paid').length,
                  partiallyPaid: filteredReportInvoices.filter(i => i.paymentStatus === 'Partially Paid').length,
                  unpaid: filteredReportInvoices.filter(i => i.paymentStatus === 'Unpaid').length
                };

                return (
                  <div>
                    {/* 4 Summary Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
                      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Filtered Sales Revenue
                        </span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
                          ₹{dynamicStats.totalRevenue.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#166534', marginTop: '2px' }}>
                          {dynamicStats.count} Invoices Matched
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '14px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Filtered Sale Amount (Base)
                        </span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1d4ed8', marginTop: '4px' }}>
                          ₹{dynamicStats.totalTaxable.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#1e40af', marginTop: '2px' }}>
                          Ex-Showroom Net Value
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '14px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Filtered GST Amount
                        </span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309', marginTop: '4px' }}>
                          ₹{dynamicStats.totalGst.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#92400e', marginTop: '2px' }}>
                          CGST (2.5%) + SGST (2.5%)
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', padding: '14px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Realization Status
                        </span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7e22ce', marginTop: '4px' }}>
                          {dynamicStats.fullyPaid} Paid
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#6b21a8', marginTop: '2px' }}>
                          {dynamicStats.partiallyPaid + dynamicStats.unpaid} Due / Partial
                        </div>
                      </div>
                    </div>

                    {/* Detailed Filtered Invoice Ledger Table with Dynamic Columns */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileCode size={16} style={{ color: '#2563eb' }} /> Filtered Invoices Report ({filteredReportInvoices.length} records found)
                        </h4>
                      </div>

                      <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f3f4f6', borderBottom: '1.5px solid #d1d5db' }}>
                            <tr>
                              {visibleColumns.invoiceNo && <th style={{ padding: '8px 10px', textAlign: 'left' }}>Inv No</th>}
                              {visibleColumns.invoiceDate && <th style={{ padding: '8px 10px', textAlign: 'left' }}>Date</th>}
                              {visibleColumns.customerName && <th style={{ padding: '8px 10px', textAlign: 'left' }}>Customer Name</th>}
                              {visibleColumns.customerPhone && <th style={{ padding: '8px 10px', textAlign: 'left' }}>Mobile</th>}
                              {visibleColumns.customerAddress && <th style={{ padding: '8px 10px', textAlign: 'left' }}>Address</th>}
                              {visibleColumns.customerAadhar && <th style={{ padding: '8px 10px', textAlign: 'left' }}>Aadhaar</th>}
                              {visibleColumns.customerGst && <th style={{ padding: '8px 10px', textAlign: 'left' }}>GSTIN</th>}
                              {visibleColumns.vehicleModel && <th style={{ padding: '8px 10px', textAlign: 'left' }}>Model</th>}
                              {visibleColumns.vehicleColor && <th style={{ padding: '8px 10px', textAlign: 'left' }}>Color</th>}
                              {visibleColumns.vinNumber && <th style={{ padding: '8px 10px', textAlign: 'left' }}>VIN / Chassis</th>}
                              {visibleColumns.engineNo && <th style={{ padding: '8px 10px', textAlign: 'left' }}>Motor / Engine</th>}
                              {visibleColumns.batteryNumber && <th style={{ padding: '8px 10px', textAlign: 'left' }}>Battery No</th>}
                              {visibleColumns.exShowroom && <th style={{ padding: '8px 10px', textAlign: 'right' }}>Sale Amount (₹)</th>}
                              {visibleColumns.gstRate && <th style={{ padding: '8px 10px', textAlign: 'center' }}>GST %</th>}
                              {visibleColumns.gstAmount && <th style={{ padding: '8px 10px', textAlign: 'right' }}>GST Amount (₹)</th>}
                              {visibleColumns.insurance && <th style={{ padding: '8px 10px', textAlign: 'right' }}>Insurance (₹)</th>}
                              {visibleColumns.rto && <th style={{ padding: '8px 10px', textAlign: 'right' }}>RTO (₹)</th>}
                              {visibleColumns.subsidy && <th style={{ padding: '8px 10px', textAlign: 'right' }}>Subsidy (₹)</th>}
                              {visibleColumns.discount && <th style={{ padding: '8px 10px', textAlign: 'right' }}>Discount (₹)</th>}
                              {visibleColumns.grandTotal && <th style={{ padding: '8px 10px', textAlign: 'right' }}>Grand Total (₹)</th>}
                              {visibleColumns.paymentStatus && <th style={{ padding: '8px 10px', textAlign: 'center' }}>Status</th>}
                              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredReportInvoices.length > 0 ? (
                              filteredReportInvoices.map((inv, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                                  {visibleColumns.invoiceNo && <td style={{ padding: '8px 10px', fontWeight: 700, color: '#059669', fontFamily: 'monospace' }}>#{inv.invoiceNo}</td>}
                                  {visibleColumns.invoiceDate && <td style={{ padding: '8px 10px', color: '#6b7280' }}>{inv.invoiceDate || inv.createdOn}</td>}
                                  {visibleColumns.customerName && <td style={{ padding: '8px 10px', fontWeight: 600 }}>{inv.customerName}</td>}
                                  {visibleColumns.customerPhone && <td style={{ padding: '8px 10px', color: '#4b5563' }}>{inv.customerPhone || inv.customerMobile || 'N/A'}</td>}
                                  {visibleColumns.customerAddress && <td style={{ padding: '8px 10px', color: '#6b7280', fontSize: '0.72rem' }}>{inv.customerAddress || 'Showroom Direct'}</td>}
                                  {visibleColumns.customerAadhar && <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{inv.customerAadhar || 'N/A'}</td>}
                                  {visibleColumns.customerGst && <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{inv.customerGst || 'N/A'}</td>}
                                  {visibleColumns.vehicleModel && <td style={{ padding: '8px 10px', fontWeight: 600 }}>{inv.vehicleModel}</td>}
                                  {visibleColumns.vehicleColor && <td style={{ padding: '8px 10px' }}>{inv.vehicleColor || 'Std'}</td>}
                                  {visibleColumns.vinNumber && <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#6b7280', fontSize: '0.7rem' }}>{inv.vinNumber || inv.vin || inv.chassisNo || 'OEM'}</td>}
                                  {visibleColumns.engineNo && <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#6b7280', fontSize: '0.7rem' }}>{inv.engineNo || inv.motorNumber || 'OEM'}</td>}
                                  {visibleColumns.batteryNumber && <td style={{ padding: '8px 10px', fontSize: '0.7rem' }}>{inv.batteryNumber || inv.batteryNo || 'BAT-OEM'}</td>}
                                  {visibleColumns.exShowroom && <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>₹{Number(inv.exShowroom || 0).toLocaleString('en-IN')}</td>}
                                  {visibleColumns.gstRate && <td style={{ padding: '8px 10px', textAlign: 'center' }}>{inv.gstRate || 5}%</td>}
                                  {visibleColumns.gstAmount && <td style={{ padding: '8px 10px', textAlign: 'right', color: '#b45309', fontWeight: 600 }}>₹{Number(inv.gstAmount || 0).toLocaleString('en-IN')}</td>}
                                  {visibleColumns.insurance && <td style={{ padding: '8px 10px', textAlign: 'right' }}>₹{Number(inv.insurance || 0).toLocaleString('en-IN')}</td>}
                                  {visibleColumns.rto && <td style={{ padding: '8px 10px', textAlign: 'right' }}>₹{Number(inv.rto || 0).toLocaleString('en-IN')}</td>}
                                  {visibleColumns.subsidy && <td style={{ padding: '8px 10px', textAlign: 'right', color: '#059669' }}>-₹{Number(inv.subsidy || 0).toLocaleString('en-IN')}</td>}
                                  {visibleColumns.discount && <td style={{ padding: '8px 10px', textAlign: 'right', color: '#dc2626' }}>-₹{Number(inv.discount || 0).toLocaleString('en-IN')}</td>}
                                  {visibleColumns.grandTotal && <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>₹{Number(inv.grandTotal || 0).toLocaleString('en-IN')}</td>}
                                  {visibleColumns.paymentStatus && (
                                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                      <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: inv.paymentStatus === 'Fully Paid' ? '#ecfdf5' : '#fef2f2',
                                        color: inv.paymentStatus === 'Fully Paid' ? '#047857' : '#b91c1c'
                                      }}>
                                        {inv.paymentStatus || 'Fully Paid'}
                                      </span>
                                    </td>
                                  )}
                                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '2px 6px', color: '#16a34a' }}
                                        onClick={() => handleShareInvoiceWhatsApp(inv)}
                                        title="Share via WhatsApp"
                                      >
                                        <MessageCircle size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '2px 6px', color: '#2563eb' }}
                                        onClick={() => {
                                          setIsMonthlyReportOpen(false);
                                          handleEditInvoice(inv);
                                        }}
                                        title="Edit Invoice"
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '2px 6px' }}
                                        onClick={() => {
                                          setPrintModalConfig({ isOpen: true, type: 'invoice', data: inv });
                                        }}
                                        title="Print Preview"
                                      >
                                        <Printer size={12} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={22} style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                                  No invoices match the selected filter criteria. Try adjusting or clearing filters above.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Global Print Preview Modal */}
      <PrintPreviewModal
        isOpen={printModalConfig.isOpen}
        onClose={() => setPrintModalConfig(prev => ({ ...prev, isOpen: false }))}
        type={printModalConfig.type}
        data={printModalConfig.data}
      />
    </div>
  );
}
