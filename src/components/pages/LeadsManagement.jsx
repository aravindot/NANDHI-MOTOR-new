import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Phone, CheckCircle, Trash2, Calendar, Clipboard, Calculator, Printer, FileCode, Edit2, MessageCircle, BarChart3, Download, Filter, TrendingUp, DollarSign, FileDown, FileText, Bell, BellOff, Clock, AlertTriangle, AlertCircle, Receipt, ArrowRight, SlidersHorizontal, RotateCcw, Users, FileSpreadsheet, Layers, PieChart, CheckCheck, ArrowUpRight } from 'lucide-react';
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
  deleteQuotation,
  companyProfile,
  customers = []
}) {
  const [printModalConfig, setPrintModalConfig] = useState({ isOpen: false, type: 'invoice', data: null });

  // Dynamic Vehicle Data Registry for Dropdowns built from active database list
  const vehicleList = React.useMemo(() => {
    const activeVehicles = vehicles || [];

    const grouped = {};
    activeVehicles.forEach(v => {
      const name = `${v.brand} ${v.model}`;
      if (!grouped[name]) {
        grouped[name] = {
          name,
          basePrice: v.price || 85000,
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
  const [leadReminderFilter, setLeadReminderFilter] = useState('ALL'); // 'ALL' | 'REMINDER_ON' | 'DUE_TODAY' | 'OVERDUE' | 'REMINDER_OFF'

  // Helper for followup status calculation
  const getFollowupStatus = (followupDate, reminder) => {
    if (!followupDate) return { isSet: false, isOverdue: false, isToday: false, isReminderOn: reminder !== 'OFF', label: 'No Date Set' };
    const todayStr = new Date().toISOString().split('T')[0];
    let compDate = followupDate;
    if (followupDate.includes('/')) {
      const parts = followupDate.split('/');
      if (parts.length === 3) compDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }

    const isReminderOn = reminder !== 'OFF';
    const isOverdue = compDate < todayStr;
    const isToday = compDate === todayStr;

    let label = `Scheduled for ${followupDate}`;
    if (isOverdue) label = `Overdue (${followupDate})`;
    else if (isToday) label = `Due Today! (${followupDate})`;

    return {
      isSet: true,
      isOverdue,
      isToday,
      isReminderOn,
      label,
      compDate
    };
  };

  // Sale Lead Form State (initialized with first vehicle in list)
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    aadhar: '',
    address: '',
    sourceType: 'Walk-In',
    entryDate: new Date().toISOString().split('T')[0],
    executive: executiveList[0],
    vehicleModel: (vehicleList && vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G',
    vehicleColor: (allVehicleColors && allVehicleColors[0]) || 'Blue',
    price: (vehicleList && vehicleList[0] && vehicleList[0].basePrice) || 82000,
    leadType: 'Hot',
    status: 'Entered',
    followupDate: '',
    reminder: 'ON',
    reminderTime: '10:00',
    note: ''
  });

  // Quotation Calculator Form State (all fields empty initially)
  const [quoteFormData, setQuoteFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerEmail: '',
    customerAadhar: '',
    customerGst: '',
    executive: executiveList[0] || 'Kishore Kumar',
    vehicleModel: '',
    vehicleColor: '',
    exShowroom: '',
    gstRate: 5,
    rto: '',
    insurance: '',
    accessories: '',
    handling: '',
    discount: ''
  });

  const [quoteSearchQuery, setQuoteSearchQuery] = useState('');
  const [showLeadNameSuggestions, setShowLeadNameSuggestions] = useState(false);
  const [showLeadPhoneSuggestions, setShowLeadPhoneSuggestions] = useState(false);
  const [showInvoiceNameSuggestions, setShowInvoiceNameSuggestions] = useState(false);
  const [showInvoicePhoneSuggestions, setShowInvoicePhoneSuggestions] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState('');
  const [invoiceSuccessMsg, setInvoiceSuccessMsg] = useState('');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');

  const [generatedQuote, setGeneratedQuote] = useState(() => (quotations && quotations.length > 0 ? quotations[0] : null));
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
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
    customerBirthday: '',
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
  const [generatedLead, setGeneratedLead] = useState(() => (leads && leads.length > 0 ? leads[0] : null));

  // Sync previews if list updates and nothing was loaded
  useEffect(() => {
    if (!generatedLead && leads && leads.length > 0) {
      setGeneratedLead(leads[0]);
    }
  }, [leads, generatedLead]);

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
    const remindersOn = leads.filter(l => l.reminder !== 'OFF' && l.followupDate).length;
    const dueToday = leads.filter(l => l.reminder !== 'OFF' && getFollowupStatus(l.followupDate, l.reminder).isToday).length;
    const overdue = leads.filter(l => l.reminder !== 'OFF' && getFollowupStatus(l.followupDate, l.reminder).isOverdue).length;
    return { total, hot, walkIn, digital, remindersOn, dueToday, overdue };
  }, [leads]);

  const quoteSummaryStats = React.useMemo(() => {
    const totalCount = quotations.length;
    const totalSum = quotations.reduce((acc, q) => acc + Number(q.total || 0), 0);
    const avgVal = totalCount > 0 ? Math.round(totalSum / totalCount) : 0;
    
    // Top quoted model
    const counts = {};
    quotations.forEach(q => {
      if (q.vehicleModel) counts[q.vehicleModel] = (counts[q.vehicleModel] || 0) + 1;
    });
    let topModel = (vehicleList && vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G';
    let max = 0;
    Object.entries(counts).forEach(([m, c]) => {
      if (c > max) { max = c; topModel = m; }
    });

    return { totalCount, totalSum, avgVal, topModel };
  }, [quotations, vehicleList]);

  const filteredQuotations = React.useMemo(() => {
    if (!quoteSearchQuery.trim()) return quotations;
    const q = quoteSearchQuery.toLowerCase().trim();
    return quotations.filter(item => 
      (item.customerName || '').toLowerCase().includes(q) ||
      (item.customerPhone || '').includes(q) ||
      (item.quoteId || '').toLowerCase().includes(q) ||
      (item.vehicleModel || '').toLowerCase().includes(q) ||
      (item.vehicleColor || '').toLowerCase().includes(q)
    );
  }, [quotations, quoteSearchQuery]);

  const bookingSummaryStats = React.useMemo(() => {
    const totalCount = bookings.length;
    const activeCount = bookings.filter(b => b.status !== 'Returned').length;
    const totalAdvance = bookings
      .filter(b => b.status !== 'Returned')
      .reduce((sum, b) => sum + Number(b.bookingAmount || 0), 0);
    const returnedCount = bookings.filter(b => b.status === 'Returned').length;
    const convertedCount = bookings.filter(b => b.status === 'Converted').length;
    return { totalCount, activeCount, totalAdvance, returnedCount, convertedCount };
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
      gstRate: q.gstRate !== undefined ? Number(q.gstRate) : 5,
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

  // Lead Autocomplete Matches for Quotation
  const nameLeadMatches = React.useMemo(() => {
    const q = (quoteFormData.customerName || '').trim().toLowerCase();
    if (!q || q.length < 1) return [];
    return leads.filter(l => (l.name || '').toLowerCase().includes(q) || (l.mobile || '').includes(q)).slice(0, 6);
  }, [leads, quoteFormData.customerName]);

  const phoneLeadMatches = React.useMemo(() => {
    const q = (quoteFormData.customerPhone || '').trim();
    if (!q || q.length < 2) return [];
    return leads.filter(l => (l.mobile || '').includes(q)).slice(0, 6);
  }, [leads, quoteFormData.customerPhone]);

  const handlePickLeadSuggestion = (matchedLead) => {
    if (!matchedLead) return;
    const vModel = matchedLead.vehicle || matchedLead.vehicleModel || (vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G';
    const matchedVeh = vehicleList && vehicleList.find(v => v.name === vModel);
    const basePrice = matchedLead.price ? Number(matchedLead.price) : (matchedVeh ? matchedVeh.basePrice : 82000);
    const vColor = matchedLead.color || matchedLead.vehicleColor || (allVehicleColors && allVehicleColors[0]) || 'Matte Blue';

    setQuoteFormData(prev => ({
      ...prev,
      customerName: matchedLead.name || '',
      customerPhone: matchedLead.mobile || '',
      customerAddress: matchedLead.address || prev.customerAddress || '',
      customerEmail: matchedLead.email || prev.customerEmail || '',
      customerAadhar: matchedLead.aadhar || prev.customerAadhar || '',
      executive: matchedLead.executive || prev.executive || '',
      vehicleModel: vModel,
      vehicleColor: vColor,
      exShowroom: basePrice
    }));
    setShowLeadNameSuggestions(false);
    setShowLeadPhoneSuggestions(false);
    setQuoteSuccessMsg(`Auto-filled details for "${matchedLead.name}" from Lead #${matchedLead.id}!`);
    setTimeout(() => setQuoteSuccessMsg(''), 4000);
  };

  // Combined Leads & Quotations Autocomplete Matches for Invoice
  const invoiceNameMatches = React.useMemo(() => {
    const q = (invoiceFormData.customerName || '').trim().toLowerCase();
    if (!q || q.length < 1) return [];

    const matches = [];

    // 1. Check Quotations first (they have detailed pricing & GST structure)
    (quotations || []).forEach(quote => {
      const name = (quote.customerName || '').toLowerCase();
      const phone = (quote.customerPhone || '');
      if (name.includes(q) || phone.includes(q)) {
        matches.push({
          type: 'quotation',
          id: quote.quoteId,
          name: quote.customerName,
          mobile: quote.customerPhone,
          address: quote.customerAddress,
          email: quote.customerEmail,
          aadhar: quote.customerAadhar,
          gstin: quote.customerGst,
          vehicle: quote.vehicleModel,
          color: quote.vehicleColor,
          exShowroom: quote.exShowroom,
          gstRate: quote.gstRate,
          rto: quote.rto,
          insurance: quote.insurance,
          accessories: quote.accessories,
          handling: quote.handling,
          discount: quote.discount,
          total: quote.total,
          executive: quote.executive
        });
      }
    });

    // 2. Check Leads
    (leads || []).forEach(lead => {
      const name = (lead.name || '').toLowerCase();
      const phone = (lead.mobile || '');
      if (name.includes(q) || phone.includes(q)) {
        matches.push({
          type: 'lead',
          id: lead.id,
          name: lead.name,
          mobile: lead.mobile,
          address: lead.address,
          email: lead.email,
          aadhar: lead.aadhar,
          gstin: lead.gst || lead.gstin,
          vehicle: lead.vehicle || lead.vehicleModel,
          color: lead.color || lead.vehicleColor,
          price: lead.price,
          executive: lead.executive
        });
      }
    });

    return matches.slice(0, 8);
  }, [leads, quotations, invoiceFormData.customerName]);

  const invoicePhoneMatches = React.useMemo(() => {
    const q = (invoiceFormData.customerPhone || '').trim();
    if (!q || q.length < 2) return [];

    const matches = [];

    (quotations || []).forEach(quote => {
      if ((quote.customerPhone || '').includes(q)) {
        matches.push({
          type: 'quotation',
          id: quote.quoteId,
          name: quote.customerName,
          mobile: quote.customerPhone,
          address: quote.customerAddress,
          email: quote.customerEmail,
          aadhar: quote.customerAadhar,
          gstin: quote.customerGst,
          vehicle: quote.vehicleModel,
          color: quote.vehicleColor,
          exShowroom: quote.exShowroom,
          gstRate: quote.gstRate,
          rto: quote.rto,
          insurance: quote.insurance,
          discount: quote.discount,
          total: quote.total,
          executive: quote.executive
        });
      }
    });

    (leads || []).forEach(lead => {
      if ((lead.mobile || '').includes(q)) {
        matches.push({
          type: 'lead',
          id: lead.id,
          name: lead.name,
          mobile: lead.mobile,
          address: lead.address,
          email: lead.email,
          aadhar: lead.aadhar,
          gstin: lead.gst || lead.gstin,
          vehicle: lead.vehicle || lead.vehicleModel,
          color: lead.color || lead.vehicleColor,
          price: lead.price,
          executive: lead.executive
        });
      }
    });

    return matches.slice(0, 8);
  }, [leads, quotations, invoiceFormData.customerPhone]);

  const handlePickInvoiceCustomerSuggestion = (match) => {
    if (!match) return;
    const vModel = match.vehicle || match.vehicleModel || (vehicleList[0] && vehicleList[0].name) || '';
    const vColor = match.color || match.vehicleColor || (allVehicleColors && allVehicleColors[0]) || '';
    const ex = match.exShowroom ? Number(match.exShowroom) : (match.price ? Number(match.price) : '');
    const gstRateVal = match.gstRate !== undefined ? Number(match.gstRate) : 5;
    const rtoVal = match.rto ? Number(match.rto) : '';
    const insVal = match.insurance ? Number(match.insurance) : '';
    const discVal = match.discount ? Number(match.discount) : 0;

    setInvoiceFormData(prev => ({
      ...prev,
      customerName: match.name || match.customerName || prev.customerName,
      customerPhone: match.mobile || match.customerPhone || prev.customerPhone,
      customerBirthday: match.birthday || match.customerBirthday || prev.customerBirthday,
      customerAddress: match.address || match.customerAddress || prev.customerAddress,
      customerEmail: match.email || match.customerEmail || prev.customerEmail,
      customerAadhar: match.aadhar || match.customerAadhar || prev.customerAadhar,
      customerGst: (match.gstin || match.gst || match.customerGst || prev.customerGst || '').toUpperCase(),
      vehicleModel: vModel || prev.vehicleModel,
      vehicleColor: vColor || prev.vehicleColor,
      exShowroom: ex !== '' ? ex : prev.exShowroom,
      gstRate: gstRateVal,
      rto: rtoVal !== '' ? rtoVal : prev.rto,
      insurance: insVal !== '' ? insVal : prev.insurance,
      discount: discVal
    }));
    setShowInvoiceNameSuggestions(false);
    setShowInvoicePhoneSuggestions(false);
    setInvoiceSuccessMsg(`Auto-filled from ${match.type === 'quotation' ? `Quotation #${match.id}` : `Sale Lead #${match.id}`} for "${match.name || match.customerName}"!`);
    setTimeout(() => setInvoiceSuccessMsg(''), 4000);
  };

  // Quick Quotation generator from Lead
  const handleConvertToQuotation = (lead) => {
    if (!lead) return;
    const vModel = lead.vehicle || lead.vehicleModel || (vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G';
    const matchedVeh = vehicleList && vehicleList.find(v => v.name === vModel);
    const basePrice = lead.price ? Number(lead.price) : (matchedVeh ? matchedVeh.basePrice : 82000);
    const vColor = lead.color || lead.vehicleColor || (allVehicleColors && allVehicleColors[0]) || 'Matte Blue';

    setEditingQuoteId(null);
    setShowLeadNameSuggestions(false);
    setShowLeadPhoneSuggestions(false);
    setQuoteFormData({
      customerName: lead.name || '',
      customerPhone: lead.mobile || '',
      customerAddress: lead.address || '',
      customerEmail: lead.email || '',
      customerAadhar: lead.aadhar || '',
      customerGst: '',
      executive: lead.executive || executiveList[0] || 'Kishore Kumar',
      vehicleModel: vModel,
      vehicleColor: vColor,
      exShowroom: basePrice,
      gstRate: 5,
      rto: 10400,
      insurance: 6200,
      accessories: 1500,
      handling: 0,
      discount: 0
    });
    setActiveSubTab('quotation');
    setActiveFormTab('quote');
    setQuoteSuccessMsg(`Imported customer details for "${lead.name}"!`);
    setTimeout(() => setQuoteSuccessMsg(''), 4000);
  };

  // Open New Quotation Modal with initial defaults
  const handleOpenAddQuote = () => {
    setEditingQuoteId(null);
    setShowLeadNameSuggestions(false);
    setShowLeadPhoneSuggestions(false);
    const defaultModel = (vehicleList && vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G';
    const matchedVeh = vehicleList && vehicleList.find(v => v.name === defaultModel);
    const defaultPrice = matchedVeh ? matchedVeh.basePrice : 82000;
    const defaultColor = (allVehicleColors && allVehicleColors[0]) || 'Matte Blue';
    setQuoteFormData({
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      customerEmail: '',
      customerAadhar: '',
      customerGst: '',
      executive: executiveList[0] || 'Kishore Kumar',
      vehicleModel: defaultModel,
      vehicleColor: defaultColor,
      exShowroom: defaultPrice,
      gstRate: 5,
      rto: 10400,
      insurance: 6200,
      accessories: 1500,
      handling: 0,
      discount: 0
    });
    setActiveFormTab('quote');
  };

  // Edit Handlers for Quotation and Invoice
  const handleEditQuotation = (q) => {
    setEditingQuoteId(q.quoteId);
    setShowLeadNameSuggestions(false);
    setShowLeadPhoneSuggestions(false);
    setQuoteFormData({
      customerName: q.customerName || '',
      customerPhone: q.customerPhone || '',
      customerAddress: q.customerAddress || '',
      customerEmail: q.customerEmail || '',
      customerAadhar: q.customerAadhar || '',
      customerGst: q.customerGst || '',
      executive: q.executive || executiveList[0] || 'Kishore Kumar',
      vehicleModel: q.vehicleModel || (vehicleList[0] && vehicleList[0].name) || '',
      vehicleColor: q.vehicleColor || (allVehicleColors && allVehicleColors[0]) || '',
      exShowroom: q.exShowroom || '',
      gstRate: q.gstRate !== undefined ? Number(q.gstRate) : 5,
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
      customerBirthday: inv.customerBirthday || '',
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

  // Convert Booking directly into a Tax Invoice
  const handleConvertBookingToInvoice = (b) => {
    if (!b) return;
    const vModel = b.vehicleModel || (vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G';
    const matchedVeh = vehicleList && vehicleList.find(v => v.name === vModel);
    const basePrice = matchedVeh ? Number(matchedVeh.basePrice) : 82000;
    const vColor = b.vehicleColor || (allVehicleColors && allVehicleColors[0]) || 'Matte Blue';
    const advanceAmt = Number(b.bookingAmount || 0);

    setInvoiceFormData(prev => ({
      ...prev,
      customerName: b.customerName || '',
      customerPhone: b.mobile || '',
      customerAddress: b.address || prev.customerAddress || '',
      customerAadhar: b.customerAadhar || prev.customerAadhar || '',
      vehicleModel: vModel,
      vehicleColor: vColor,
      exShowroom: basePrice,
      gstRate: 5,
      insurance: 4200,
      rto: 6500,
      discount: 0,
      vinNumber: '',
      batteryNumber: '',
      chargerNumber: '',
      controllerNumber: '',
      paymentStatus: 'Fully Paid',
      notes: `Advance Booking #${b.id || ''} (₹${advanceAmt.toLocaleString('en-IN')} paid via ${b.paymentMode || 'Cash'})`
    }));

    // Update booking status to Converted
    if (b.id) {
      const updated = { ...b, status: 'Converted' };
      setBookings(prev => prev.map(item => item.id === b.id ? updated : item));
      try {
        fetch(`${API_BASE_URL}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        }).catch(err => console.error(err));
      } catch (e) {}
    }

    setEditingInvoiceId(null);
    setPrintModalConfig(prev => ({ ...prev, isOpen: false }));
    setActiveSubTab('invoice');
    setActiveFormTab('invoice');
    setBookingSuccessMsg(`Booking #${b.id} transferred to Sale Invoice!`);
    setTimeout(() => setBookingSuccessMsg(''), 4000);
  };

  // Return / Refund Booking Advance Amount
  const handleReturnBooking = async (b) => {
    if (!b) return;
    const isCurrentlyReturned = b.status === 'Returned';
    const actionText = isCurrentlyReturned 
      ? `Reactivate Booking #${b.id} (Cancel Return)?`
      : `Confirm Return / Refund of booking advance ₹${Number(b.bookingAmount || 0).toLocaleString('en-IN')} for Booking #${b.id} (${b.customerName})?`;

    if (!window.confirm(actionText)) return;

    const newStatus = isCurrentlyReturned ? 'Active' : 'Returned';
    const returnDate = isCurrentlyReturned ? '' : new Date().toLocaleDateString('en-IN');
    const updated = {
      ...b,
      status: newStatus,
      returnDate: returnDate
    };

    setBookings(prev => prev.map(item => item.id === b.id ? updated : item));
    if (generatedBooking?.id === b.id) {
      setGeneratedBooking(updated);
    }

    setBookingSuccessMsg(
      isCurrentlyReturned 
        ? `Booking #${b.id} reactivated to Active state.` 
        : `Booking #${b.id} advance of ₹${Number(b.bookingAmount || 0).toLocaleString('en-IN')} marked as RETURNED / REFUNDED.`
    );
    setTimeout(() => setBookingSuccessMsg(''), 4000);

    try {
      await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.warn('Backend fallback to local storage for booking update:', err);
    }
  };

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
      entryDate: new Date().toISOString().split('T')[0],
      executive: executiveList[0] || 'Kishore Kumar',
      vehicleModel: (vehicleList && vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G',
      vehicleColor: (vehicleList && vehicleList[0] && vehicleList[0].colors && vehicleList[0].colors[0]) || (allVehicleColors && allVehicleColors[0]) || 'Blue',
      price: (vehicleList && vehicleList[0] && vehicleList[0].basePrice) || 82000,
      leadType: 'Hot',
      status: 'Entered',
      followupDate: '',
      reminder: 'ON',
      reminderTime: '10:00',
      note: ''
    });
    setActiveFormTab('lead');
  };

  const handleOpenEditLead = (lead) => {
    setEditingLead(lead);
    const parsedEntryDate = (() => {
      const d = lead.entryDate || lead.createdOn;
      if (!d) return new Date().toISOString().split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      if (d.includes('/')) {
        const p = d.split('/');
        if (p.length === 3) return `${p[2].length === 4 ? p[2] : `20${p[2]}`}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
      }
      return new Date().toISOString().split('T')[0];
    })();

    setLeadFormData({
      name: lead.name || '',
      mobile: lead.mobile || '',
      email: lead.email || '',
      aadhar: lead.aadhar || '',
      address: lead.address || '',
      sourceType: lead.sourceType || 'Walk-In',
      entryDate: parsedEntryDate,
      executive: lead.executive || executiveList[0],
      vehicleModel: lead.vehicle || (vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G',
      vehicleColor: lead.color || (allVehicleColors && allVehicleColors[0]) || 'Blue',
      price: lead.price || 82000,
      leadType: lead.leadType || 'Hot',
      status: lead.status || 'Entered',
      followupDate: lead.followupDate || '',
      reminder: lead.reminder === 'OFF' ? 'OFF' : 'ON',
      reminderTime: lead.reminderTime || '10:00',
      note: lead.note || ''
    });
    setActiveFormTab('lead');
  };

  const handleToggleLeadReminder = async (lead) => {
    const currentReminder = lead.reminder === 'OFF' ? 'OFF' : 'ON';
    const newReminder = currentReminder === 'ON' ? 'OFF' : 'ON';
    const updated = { ...lead, reminder: newReminder };
    if (updateLead) {
      await updateLead(lead.id, updated);
    } else if (setLeads) {
      setLeads(prev => prev.map(l => (l.id === lead.id ? updated : l)));
    }
  };

  // Submit Sale Lead (Create or Edit)
  const handleLeadFormSubmit = async (e) => {
    e.preventDefault();

    const entryDateVal = leadFormData.entryDate || new Date().toISOString().split('T')[0];
    const dateParts = entryDateVal.split('-');
    const formattedCreatedOn = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : new Date().toLocaleDateString('en-IN');

    if (editingLead) {
      const updatedItem = {
        ...editingLead,
        name: leadFormData.name,
        mobile: leadFormData.mobile,
        email: leadFormData.email,
        aadhar: leadFormData.aadhar,
        address: leadFormData.address || 'N/A',
        sourceType: leadFormData.sourceType,
        entryDate: entryDateVal,
        executive: leadFormData.executive,
        vehicle: leadFormData.vehicleModel,
        color: leadFormData.vehicleColor,
        price: leadFormData.price ? Number(leadFormData.price) : 0,
        leadType: leadFormData.leadType,
        status: leadFormData.status,
        followupDate: leadFormData.followupDate,
        reminder: leadFormData.reminder || 'ON',
        reminderTime: leadFormData.reminderTime || '10:00',
        note: leadFormData.note,
        createdOn: editingLead.createdOn || formattedCreatedOn
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
        entryDate: entryDateVal,
        executive: leadFormData.executive,
        vehicle: leadFormData.vehicleModel,
        color: leadFormData.vehicleColor,
        price: leadFormData.price ? Number(leadFormData.price) : 0,
        leadType: leadFormData.leadType,
        status: 'Converted',
        followupDate: leadFormData.followupDate,
        reminder: leadFormData.reminder || 'ON',
        reminderTime: leadFormData.reminderTime || '10:00',
        note: leadFormData.note,
        createdOn: formattedCreatedOn
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
      entryDate: new Date().toISOString().split('T')[0],
      executive: executiveList[0] || 'Kishore Kumar',
      vehicleModel: (vehicleList && vehicleList[0] && vehicleList[0].name) || 'Honda Activa 6G',
      vehicleColor: (vehicleList && vehicleList[0] && vehicleList[0].colors && vehicleList[0].colors[0]) || (allVehicleColors && allVehicleColors[0]) || 'Blue',
      price: (vehicleList && vehicleList[0] && vehicleList[0].basePrice) || 82000,
      leadType: 'Hot',
      status: 'Entered',
      followupDate: '',
      reminder: 'ON',
      reminderTime: '10:00',
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
    const ex = Number(quoteFormData.exShowroom || 0);
    const gstRate = Number(quoteFormData.gstRate || 0);
    const gstAmount = Math.round(ex * (gstRate / 100));
    const rto = Number(quoteFormData.rto || 0);
    const ins = Number(quoteFormData.insurance || 0);
    const acc = Number(quoteFormData.accessories || 0);
    const handling = Number(quoteFormData.handling || 0);
    const disc = Number(quoteFormData.discount || 0);

    const total = ex + gstAmount + rto + ins + acc + handling - disc;
    return isNaN(total) ? 0 : total;
  };

  // Submit Quotation
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    const details = calculateOnRoadTotal();
    const exVal = Number(quoteFormData.exShowroom || 0);
    const gstRateVal = Number(quoteFormData.gstRate !== undefined ? quoteFormData.gstRate : 5);
    const gstAmtVal = Math.round(exVal * (gstRateVal / 100));
    const nextQuoteNum = quotations.reduce((max, q) => {
      const n = parseInt((q.quoteId || '').replace(/\D/g, ''), 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0) + 1;
    const quoteId = editingQuoteId || `QT-${String(nextQuoteNum).padStart(2, '0')}`;
    const quotePayload = {
      ...quoteFormData,
      quoteId,
      createdOn: quoteFormData.createdOn || new Date().toLocaleDateString('en-IN'),
      customerName: quoteFormData.customerName || '',
      customerPhone: quoteFormData.customerPhone || '',
      customerAddress: quoteFormData.customerAddress || '',
      customerEmail: quoteFormData.customerEmail || '',
      customerAadhar: quoteFormData.customerAadhar || '',
      customerGst: (quoteFormData.customerGst || '').toUpperCase(),
      executive: quoteFormData.executive || '',
      exShowroom: exVal,
      gstRate: gstRateVal,
      gstAmount: gstAmtVal,
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

    let matchReminder = true;
    if (leadReminderFilter === 'REMINDER_ON') {
      matchReminder = l.reminder !== 'OFF';
    } else if (leadReminderFilter === 'DUE_TODAY') {
      matchReminder = l.reminder !== 'OFF' && getFollowupStatus(l.followupDate, l.reminder).isToday;
    } else if (leadReminderFilter === 'OVERDUE') {
      matchReminder = l.reminder !== 'OFF' && getFollowupStatus(l.followupDate, l.reminder).isOverdue;
    } else if (leadReminderFilter === 'REMINDER_OFF') {
      matchReminder = l.reminder === 'OFF';
    }

    return matchQuery && matchStatus && matchTemp && matchReminder;
  });


  const currentSubTab = activeSubTab || 'sale-lead';

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Sub Tabs */}
      <div className="sub-tabs-container">
        <span className={`sub-tab ${currentSubTab === 'sale-lead' ? 'active' : ''}`} onClick={() => setActiveSubTab('sale-lead')}>
          Sale Lead
        </span>
        <span className={`sub-tab ${currentSubTab === 'quotation' ? 'active' : ''}`} onClick={() => setActiveSubTab('quotation')}>
          Quotation
        </span>
        <span className={`sub-tab ${currentSubTab === 'invoice' ? 'active' : ''}`} onClick={() => setActiveSubTab('invoice')}>
          Invoice
        </span>
        <span className={`sub-tab ${currentSubTab === 'booking' ? 'active' : ''}`} onClick={() => setActiveSubTab('booking')}>
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
      {currentSubTab === 'sale-lead' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: showPreviews ? '1.2fr 1fr' : '1fr',
          gap: '24px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {/* Left Column: Saved Sale Leads Ledger */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h3 className="card-title">Saved Sale Leads</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="quick-search">
                  <Search size={14} className="quick-search-icon" />
                  <input
                    type="text"
                    placeholder="Search name/phone/ID..."
                    style={{ width: '160px', padding: '6px 10px 6px 28px', fontSize: '0.78rem' }}
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

            <div className="card-body" style={{ maxHeight: '680px', overflowY: 'auto', padding: '12px' }}>
              {/* 3-column Top Stats Summary matching Invoice style */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                backgroundColor: '#f9fafb',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                marginBottom: '10px',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Leads</span>
                  <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{leadsSummaryStats.total}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>🔥 Hot Leads</span>
                  <strong style={{ fontSize: '0.9rem', color: '#ef4444' }}>{leadsSummaryStats.hot}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>🔔 Reminders ON</span>
                  <strong style={{ fontSize: '0.9rem', color: '#059669' }}>{leadsSummaryStats.remindersOn}</strong>
                </div>
              </div>

              {/* Filter Chips Bar */}
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'REMINDER_ON', label: '🔔 ON' },
                  { key: 'DUE_TODAY', label: '⏰ Today' },
                  { key: 'OVERDUE', label: '⚠️ Overdue' },
                  { key: 'REMINDER_OFF', label: '🔕 OFF' }
                ].map(rf => (
                  <button
                    key={rf.key}
                    type="button"
                    style={{
                      padding: '2px 7px',
                      fontSize: '0.7rem',
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor: leadReminderFilter === rf.key ? '#059669' : '#d1d5db',
                      backgroundColor: leadReminderFilter === rf.key ? '#ecfdf5' : '#ffffff',
                      color: leadReminderFilter === rf.key ? '#059669' : '#4b5563',
                      cursor: 'pointer',
                      fontWeight: leadReminderFilter === rf.key ? 600 : 400
                    }}
                    onClick={() => setLeadReminderFilter(rf.key)}
                  >
                    {rf.label}
                  </button>
                ))}
              </div>

              {/* Clean List of Leads matching Invoice list item design */}
              {filteredLeads && filteredLeads.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setGeneratedLead(lead)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: generatedLead?.id === lead.id ? '#f0fdf4' : '#ffffff',
                        borderColor: generatedLead?.id === lead.id ? '#86efac' : '#e5e7eb',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong>Lead #{lead.id}</strong> | <span style={{ fontWeight: 600 }}>{lead.name}</span>
                          {lead.leadType === 'Hot' && (
                            <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: 700, border: '1px solid #fecaca' }}>
                              🔥 Hot
                            </span>
                          )}
                        </div>
                        <span style={{ color: '#6b7280', fontSize: '0.74rem' }}>
                          Entry: {lead.entryDate ? (lead.entryDate.includes('-') ? lead.entryDate.split('-').reverse().join('/') : lead.entryDate) : (lead.createdOn || 'Recent')} | 📞 {lead.mobile} | 🏍️ {lead.vehicle} {lead.color ? `(${lead.color})` : ''}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onClick={(e) => e.stopPropagation()}>
                        <strong style={{ color: '#059669', marginRight: '4px', fontSize: '0.88rem' }}>
                          ₹{Number(lead.price || 0).toLocaleString('en-IN')}
                        </strong>

                        {/* Convert to Quotation */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#059669', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}
                          onClick={() => handleConvertToQuotation(lead)}
                          title="Generate Price Quotation from Lead"
                        >
                          <Calculator size={13} />
                        </button>

                        {/* Quick Reminder Toggle */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: lead.reminder === 'OFF' ? '#9ca3af' : '#d97706', borderColor: '#fed7aa', backgroundColor: '#fffbeb' }}
                          onClick={() => handleToggleLeadReminder(lead)}
                          title={lead.reminder === 'OFF' ? 'Turn On Reminder' : 'Turn Off Reminder'}
                        >
                          {lead.reminder === 'OFF' ? <BellOff size={13} /> : <Bell size={13} />}
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
                  ))}
                </div>
              ) : (
                <div style={{ padding: '30px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
                  <Clipboard size={32} strokeWidth={1} style={{ marginBottom: '8px' }} />
                  <p>No sale leads found matching current filter or search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Lead Document Preview & Follow-Up Sheet */}
          {showPreviews && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">
                  <Clipboard size={18} style={{ color: '#059669' }} /> Lead Profile & Follow-Up
                </h3>
                {generatedLead && (
                  <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                    Lead #{generatedLead.id}
                  </span>
                )}
              </div>
              <div className="card-body">
                {generatedLead ? (
                  <div className="invoice-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: '12px' }}>
                      <div>
                        <div className="invoice-title" style={{ textAlign: 'left', margin: 0, fontSize: '1.25rem' }}>NANDHI MOTORS</div>
                        <p style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, margin: '2px 0 0' }}>
                          Customer Sales Lead Sheet
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge" style={{
                          backgroundColor: generatedLead.leadType === 'Hot' ? '#ef4444' : '#059669',
                          color: '#fff',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {generatedLead.leadType === 'Hot' ? '🔥 HOT PROSPECT' : `${generatedLead.leadType} LEAD`}
                        </span>
                        <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '4px' }}>
                          Entry Date: <strong>{generatedLead.entryDate || generatedLead.createdOn || 'Recent'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* 2-Column Info Grid */}
                    <div className="invoice-grid-2" style={{ marginTop: '16px' }}>
                      <div>
                        <div className="section-title">Customer Particulars</div>
                        <p><strong>Name:</strong> {generatedLead.name}</p>
                        <p><strong>Mobile:</strong> <a href={`tel:${generatedLead.mobile}`} style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>{generatedLead.mobile}</a></p>
                        {generatedLead.email && <p><strong>Email:</strong> {generatedLead.email}</p>}
                        {generatedLead.address && <p><strong>Address:</strong> {generatedLead.address}</p>}
                        {generatedLead.aadhar && <p><strong>Aadhaar:</strong> {generatedLead.aadhar}</p>}
                        <p><strong>Enquiry Source:</strong> {generatedLead.sourceType || 'Walk-In'}</p>
                      </div>

                      <div>
                        <div className="section-title">Vehicle Choice & Dealership Info</div>
                        <p><strong>Model:</strong> {generatedLead.vehicle}</p>
                        <p><strong>Color:</strong> {generatedLead.color || 'Standard'}</p>
                        <p><strong>Estimated Price:</strong> ₹{Number(generatedLead.price || 0).toLocaleString('en-IN')}</p>
                        <p><strong>Executive:</strong> {generatedLead.executive || 'Unassigned'}</p>
                        <p><strong>Status:</strong> {generatedLead.status || 'Entered'}</p>
                      </div>
                    </div>

                    {/* Follow-up Status Banner */}
                    <div style={{
                      margin: '16px 0',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: generatedLead.reminder === 'OFF' ? '#f9fafb' : '#f0fdf4',
                      border: '1px solid',
                      borderColor: generatedLead.reminder === 'OFF' ? '#e5e7eb' : '#bbf7d0',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: generatedLead.reminder === 'OFF' ? '#6b7280' : '#047857' }}>
                          {generatedLead.reminder === 'OFF' ? '🔕 Follow-up Reminder OFF' : '🔔 Follow-up Reminder Active'}
                        </span>
                        {generatedLead.followupDate && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                            Due: {generatedLead.followupDate} {generatedLead.reminderTime ? `at ${generatedLead.reminderTime}` : ''}
                          </span>
                        )}
                      </div>
                      {generatedLead.note && (
                        <p style={{ margin: '6px 0 0', fontSize: '0.76rem', color: '#4b5563' }}>
                          <strong>Remarks:</strong> {generatedLead.note}
                        </p>
                      )}
                    </div>

                      {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '14px' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                        onClick={() => handleConvertToQuotation(generatedLead)}
                      >
                        <Calculator size={14} /> Convert to Quote
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                        onClick={() => handleOpenEditLead(generatedLead)}
                      >
                        <Edit2 size={14} /> Edit Lead
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>
                    <Clipboard size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                    <p>Select a sale lead from the ledger on the left to preview.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: ADVANCED & NEAT QUOTATION CALCULATOR */}
      {currentSubTab === 'quotation' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: showPreviews ? '1.2fr 1fr' : '1fr',
          gap: '24px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {/* LEFT COLUMN: Saved Quotations Ledger */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h3 className="card-title">Saved Quotations</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="quick-search">
                  <Search size={14} className="quick-search-icon" />
                  <input
                    type="text"
                    placeholder="Search name/phone/ID..."
                    style={{ width: '160px', padding: '6px 10px 6px 28px', fontSize: '0.78rem' }}
                    value={quoteSearchQuery}
                    onChange={(e) => setQuoteSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenAddQuote}
                >
                  <Calculator size={14} /> + New Quotation
                </button>
              </div>
            </div>

            <div className="card-body" style={{ maxHeight: '680px', overflowY: 'auto', padding: '12px' }}>
              {/* Quotation Stats Summary matching Invoice style */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                backgroundColor: '#f9fafb',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                marginBottom: '10px',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Quotes</span>
                  <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{quoteSummaryStats.totalCount}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Avg Quote</span>
                  <strong style={{ fontSize: '0.9rem', color: '#059669' }}>₹{quoteSummaryStats.avgVal.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Pipeline Total</span>
                  <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>₹{quoteSummaryStats.totalSum.toLocaleString('en-IN')}</strong>
                </div>
              </div>

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
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  <CheckCircle size={16} color="#059669" />
                  <span>{quoteSuccessMsg}</span>
                </div>
              )}

              {filteredQuotations && filteredQuotations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredQuotations.map((q, idx) => (
                    <div
                      key={q.quoteId || idx}
                      onClick={() => setGeneratedQuote(q)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: generatedQuote?.quoteId === q.quoteId ? '#f0fdf4' : '#ffffff',
                        borderColor: generatedQuote?.quoteId === q.quoteId ? '#86efac' : '#e5e7eb',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong>Quote #{q.quoteId}</strong> | <span style={{ fontWeight: 600 }}>{q.customerName || 'Walk-in Customer'}</span>
                          {q.gstRate !== undefined && (
                            <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#047857', fontWeight: 600, border: '1px solid #a7f3d0' }}>
                              GST {q.gstRate}%
                            </span>
                          )}
                        </div>
                        <span style={{ color: '#6b7280', fontSize: '0.74rem' }}>
                          Date: {q.createdOn || 'Recent'} | 📞 {q.customerPhone || 'No phone'} | 🏍️ {q.vehicleModel} {q.vehicleColor ? `(${q.vehicleColor})` : ''}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <strong style={{ color: '#059669', marginRight: '4px', fontSize: '0.88rem' }}>
                          ₹{Number(q.total || 0).toLocaleString('en-IN')}
                        </strong>

                        {/* WhatsApp Share */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#16a34a', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }}
                          onClick={() => handleShareQuoteWhatsApp(q)}
                          title="Share Quotation PDF on WhatsApp"
                        >
                          <MessageCircle size={13} />
                        </button>

                        {/* Edit Button */}
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
                          title="Print / View Quotation PDF"
                        >
                          <Printer size={12} />
                        </button>

                        {/* Convert to Invoice - Icon only placed after Print */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{
                            padding: '4px 8px',
                            color: '#059669',
                            borderColor: '#a7f3d0',
                            backgroundColor: '#ecfdf5'
                          }}
                          onClick={() => handleConvertQuoteToInvoice(q)}
                          title="Convert to Invoice"
                        >
                          <Receipt size={13} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: '#ef4444', borderColor: '#fca5a5' }}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete Quotation #${q.quoteId}?`)) {
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
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#9ca3af', fontSize: '0.8rem' }}>
                  <Clipboard size={32} strokeWidth={1} style={{ marginBottom: '8px' }} />
                  <p>No quotations found matching search.</p>
                </div>
              )}
            </div>
          </div>

            {/* RIGHT COLUMN: Executive Quotation Preview Sheet */}
            {showPreviews && (
              <div className="card" style={{ margin: 0, overflow: 'hidden' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                  <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCode size={18} style={{ color: '#059669' }} /> Live Quotation Document Preview
                  </h3>
                  {generatedQuote && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '3px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                      Quote #{generatedQuote.quoteId}
                    </span>
                  )}
                </div>

                <div className="card-body" style={{ padding: '20px' }}>
                  {generatedQuote ? (
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px'
                    }}>
                      {/* Document Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
                            NANDHI MOTORS
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Authorized Two-Wheeler Sales & Service
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                            128, Bangalore Main Road, Hosur - 635109 | 📞 +91 98421 55670
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#ecfdf5',
                            color: '#047857',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            border: '1px solid #bbf7d0'
                          }}>
                            ON-ROAD PRICE QUOTATION
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                            Ref: <strong>{generatedQuote.quoteId}</strong> | Date: <strong>{generatedQuote.createdOn || new Date().toLocaleDateString('en-IN')}</strong>
                          </div>
                        </div>
                      </div>

                      {/* 2-Column Info Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px 14px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                            Customer Particulars
                          </span>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1f2937' }}>
                            {generatedQuote.customerName || 'Walk-in Customer'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>📞 {generatedQuote.customerPhone || 'N/A'}</span>
                            {generatedQuote.customerEmail && <span>| ✉️ {generatedQuote.customerEmail}</span>}
                          </div>
                          {generatedQuote.customerAddress && (
                            <div style={{ fontSize: '0.76rem', color: '#4b5563', marginTop: '3px' }}>
                              📍 <strong>Address:</strong> {generatedQuote.customerAddress}
                            </div>
                          )}
                          {(generatedQuote.customerAadhar || generatedQuote.customerGst) && (
                            <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '3px' }}>
                              {generatedQuote.customerAadhar && <span>Aadhar: <strong>{generatedQuote.customerAadhar}</strong> </span>}
                              {generatedQuote.customerGst && <span>| GSTIN: <strong>{generatedQuote.customerGst}</strong></span>}
                            </div>
                          )}
                        </div>

                        <div style={{ backgroundColor: '#f9fafb', padding: '12px 14px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                            Vehicle Choice & Specs
                          </span>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#059669' }}>
                            {generatedQuote.vehicleModel || 'Two-Wheeler'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#4b5563', marginTop: '3px' }}>
                            Color: <strong>{generatedQuote.vehicleColor || 'Standard'}</strong>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#6b7280', marginTop: '3px' }}>
                            Validity: <strong>7 Days from issuance</strong>
                          </div>
                          {generatedQuote.executive && (
                            <div style={{ fontSize: '0.76rem', color: '#374151', marginTop: '3px' }}>
                              Executive: <strong>{generatedQuote.executive}</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Itemized Price Component Table */}
                      <div style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                              <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700, color: '#374151' }}>Price Component Description</th>
                              <th style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 700, color: '#374151' }}>Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '9px 14px', color: '#374151' }}>Ex-Showroom Base Vehicle Price</td>
                              <td style={{ textAlign: 'right', padding: '9px 14px', fontWeight: 600, color: '#111827' }}>
                                ₹{Number(generatedQuote.exShowroom || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#f0fdf4' }}>
                              <td style={{ padding: '9px 14px', color: '#047857', fontWeight: 600 }}>
                                Goods & Services Tax (GST {generatedQuote.gstRate !== undefined ? generatedQuote.gstRate : 5}%)
                              </td>
                              <td style={{ textAlign: 'right', padding: '9px 14px', fontWeight: 700, color: '#047857' }}>
                                +₹{Number(generatedQuote.gstAmount !== undefined ? generatedQuote.gstAmount : Math.round(Number(generatedQuote.exShowroom || 0) * ((generatedQuote.gstRate !== undefined ? generatedQuote.gstRate : 5) / 100))).toLocaleString('en-IN')}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                              <td style={{ padding: '9px 14px', color: '#374151' }}>RTO Registration, Road Tax & HSRP Plates</td>
                              <td style={{ textAlign: 'right', padding: '9px 14px', fontWeight: 600, color: '#111827' }}>
                                ₹{Number(generatedQuote.rto || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '9px 14px', color: '#374151' }}>5-Year Comprehensive Insurance Premium</td>
                              <td style={{ textAlign: 'right', padding: '9px 14px', fontWeight: 600, color: '#111827' }}>
                                ₹{Number(generatedQuote.insurance || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                              <td style={{ padding: '9px 14px', color: '#374151' }}>Standard Accessories Kit & ISI Helmet</td>
                              <td style={{ textAlign: 'right', padding: '9px 14px', fontWeight: 600, color: '#111827' }}>
                                ₹{Number(generatedQuote.accessories || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: Number(generatedQuote.discount || 0) > 0 ? '1px solid #f3f4f6' : 'none' }}>
                              <td style={{ padding: '9px 14px', color: '#374151' }}>Logistics, Handling & Showroom PDI</td>
                              <td style={{ textAlign: 'right', padding: '9px 14px', fontWeight: 600, color: '#111827' }}>
                                ₹{Number(generatedQuote.handling || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                            {Number(generatedQuote.discount || 0) > 0 && (
                              <tr style={{ backgroundColor: '#fef2f2' }}>
                                <td style={{ padding: '9px 14px', color: '#dc2626', fontWeight: 600 }}>Special Dealer Discount (-)</td>
                                <td style={{ textAlign: 'right', padding: '9px 14px', fontWeight: 700, color: '#dc2626' }}>
                                  -₹{Number(generatedQuote.discount).toLocaleString('en-IN')}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Net On-Road Grand Total Banner */}
                      <div style={{
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        padding: '16px 20px',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 4px 10px rgba(5,150,105,0.25)'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9, letterSpacing: '0.5px' }}>
                            Net Payable On-Road Price
                          </span>
                          <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                            Includes standard taxes, registration & levies
                          </div>
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                          ₹{Number(generatedQuote.total || 0).toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* Dealership Quotation Terms & Conditions */}
                      <div style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        fontSize: '0.76rem',
                        lineHeight: 1.5,
                        color: '#4b5563'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                          <span style={{ fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.74rem' }}>
                            Terms & Conditions
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic' }}>
                            🔒 Managed permanently in Settings
                          </span>
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap', color: '#374151', fontSize: '0.75rem', lineHeight: 1.5 }}>
                          {companyProfile?.quotationTerms || `1. Prices quoted are valid for 7 days from the date of issuance and subject to manufacturer price revisions.
2. Final delivery is subject to availability of vehicle stock and color chosen at the time of final booking.
3. RTO registration, road tax, and insurance charges are subject to statutory revisions by Government authorities.
4. Full on-road payment is required prior to vehicle invoicing and registration dispatch.
5. Standard accessories and helmet are supplied according to dealership delivery policy.`}
                        </div>
                      </div>

                      {/* Interactive Actions Dock */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', paddingTop: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{
                            padding: '10px',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                            backgroundColor: '#f0fdf4',
                            borderColor: '#86efac',
                            color: '#15803d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                          onClick={() => handleShareQuoteWhatsApp(generatedQuote)}
                          title="Share Official Quotation on WhatsApp"
                        >
                          <MessageCircle size={15} /> Send WhatsApp
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{
                            padding: '10px',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                            backgroundColor: '#eff6ff',
                            borderColor: '#93c5fd',
                            color: '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                          onClick={() => handleEditQuotation(generatedQuote)}
                          title="Edit Quotation Parameters"
                        >
                          <Edit2 size={15} /> Edit Quote
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{
                            padding: '10px',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                          onClick={() => setPrintModalConfig({ isOpen: true, type: 'quotation', data: generatedQuote })}
                          title="Open Print & PDF Preview Modal"
                        >
                          <Printer size={15} /> Print / PDF
                        </button>

                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{
                            padding: '10px 14px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '7px',
                            backgroundColor: '#059669',
                            borderColor: '#047857',
                            boxShadow: '0 2px 6px rgba(5,150,105,0.25)'
                          }}
                          onClick={() => handleConvertQuoteToInvoice(generatedQuote)}
                          title="Convert this Quotation to a Tax Invoice"
                        >
                          <Receipt size={16} />
                          <span>Convert to Invoice</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '340px', color: '#9ca3af', textAlign: 'center', padding: '40px 20px' }}>
                      <Calculator size={52} strokeWidth={1} style={{ marginBottom: '14px', color: '#059669' }} />
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Select a Quotation</h4>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', maxWidth: '340px', marginBottom: '16px' }}>
                        Click on any saved quotation from the ledger on the left to preview its breakdown, or generate a new price quote.
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleOpenAddQuote}
                      >
                        + Create New Quotation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      {/* SUBTAB 3: BOOKING */}
      {currentSubTab === 'booking' && (
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
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                backgroundColor: '#f9fafb',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Bookings</span>
                  <strong style={{ fontSize: '1rem', color: '#1f2937' }}>{bookingSummaryStats.totalCount}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Active Advance</span>
                  <strong style={{ fontSize: '1rem', color: '#059669' }}>₹{bookingSummaryStats.totalAdvance.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Status</span>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '2px', display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    <span style={{ color: '#059669' }}>{bookingSummaryStats.convertedCount || 0} Sold</span>
                    <span style={{ color: '#dc2626' }}>{bookingSummaryStats.returnedCount || 0} Ret.</span>
                  </div>
                </div>
              </div>

              {/* List of bookings */}
              <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bookings && bookings.length > 0 ? (
                  bookings.map((b, idx) => (
                    <div
                      key={b.id || idx}
                      onClick={() => setGeneratedBooking(b)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: generatedBooking?.id === b.id ? '#f0fdf4' : b.status === 'Returned' ? '#fdf2f2' : '#ffffff',
                        borderColor: generatedBooking?.id === b.id ? '#86efac' : b.status === 'Returned' ? '#fecaca' : '#e5e7eb',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong>Booking #{b.id}</strong>
                          <span>|</span>
                          <span style={{ fontWeight: 600 }}>{b.customerName}</span>
                          {b.status === 'Returned' && (
                            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 700 }}>
                              Returned
                            </span>
                          )}
                          {b.status === 'Converted' && (
                            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#059669', fontWeight: 700 }}>
                              Converted
                            </span>
                          )}
                        </div>
                        <span style={{ color: '#6b7280', fontSize: '0.74rem' }}>Date: {b.bookingDate || b.createdOn} | {b.vehicleModel} ({b.vehicleColor})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <strong style={{ 
                          color: b.status === 'Returned' ? '#9ca3af' : '#059669', 
                          marginRight: '6px',
                          textDecoration: b.status === 'Returned' ? 'line-through' : 'none'
                        }}>
                          ₹{Number(b.bookingAmount || 0).toLocaleString('en-IN')}
                        </strong>

                        {/* 1. Print / Preview Icon */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            backgroundColor: '#ffffff',
                            color: '#374151'
                          }}
                          onClick={() => {
                            setGeneratedBooking(b);
                            setPrintModalConfig({ isOpen: true, type: 'booking', data: b });
                          }}
                          title="Print Preview / Share Booking Slip"
                        >
                          <Printer size={15} />
                        </button>

                        {/* 2. Convert to Sale / Invoice Icon */}
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            border: '1px solid #059669',
                            backgroundColor: '#059669',
                            color: '#ffffff'
                          }}
                          onClick={() => handleConvertBookingToInvoice(b)}
                          title="Convert to Sale / Tax Invoice"
                        >
                          <Receipt size={15} />
                        </button>

                        {/* 3. Return / Refund Advance Icon */}
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            border: b.status === 'Returned' ? '1px solid #f59e0b' : '1px solid #fca5a5',
                            backgroundColor: b.status === 'Returned' ? '#fef3c7' : '#fee2e2',
                            color: b.status === 'Returned' ? '#b45309' : '#dc2626'
                          }}
                          onClick={() => handleReturnBooking(b)}
                          title={b.status === 'Returned' ? 'Reactivate Booking (Undo Return)' : 'Return / Refund Booking Advance'}
                        >
                          <RotateCcw size={15} />
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

                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={() => setPrintModalConfig({ isOpen: true, type: 'booking', data: generatedBooking })}
                        title="Print Preview / Share Slip"
                      >
                        <Printer size={15} />
                        <span>Print</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        style={{ flex: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: '#059669', color: '#ffffff', border: 'none' }}
                        onClick={() => handleConvertBookingToInvoice(generatedBooking)}
                        title="Convert this Booking directly into a Sale Invoice"
                      >
                        <Receipt size={15} />
                        <span>Convert to Sale</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          flex: 1.1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          border: generatedBooking.status === 'Returned' ? '1px solid #f59e0b' : '1px solid #fca5a5',
                          backgroundColor: generatedBooking.status === 'Returned' ? '#fef3c7' : '#fee2e2',
                          color: generatedBooking.status === 'Returned' ? '#b45309' : '#dc2626'
                        }}
                        onClick={() => handleReturnBooking(generatedBooking)}
                        title="Return / Refund Booking Advance Amount"
                      >
                        <RotateCcw size={15} />
                        <span>{generatedBooking.status === 'Returned' ? 'Undo Return' : 'Return Amt'}</span>
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
                  {/* Customer Name with Live Search from Leads & Quotations */}
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Customer Name *</span>
                      {invoiceNameMatches.length > 0 && showInvoiceNameSuggestions && (
                        <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                          ⚡ {invoiceNameMatches.length} match{invoiceNameMatches.length > 1 ? 'es' : ''} from Leads & Quotes
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      
                      required
                      value={invoiceFormData.customerName}
                      onChange={(e) => {
                        setInvoiceFormData({ ...invoiceFormData, customerName: e.target.value });
                        setShowInvoiceNameSuggestions(true);
                      }}
                      onFocus={() => setShowInvoiceNameSuggestions(true)}
                      autoComplete="off"
                    />

                    {/* Floating Suggestion Dropdown for Name */}
                    {showInvoiceNameSuggestions && invoiceNameMatches.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #059669',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.18)',
                        zIndex: 1050,
                        marginTop: '4px',
                        maxHeight: '260px',
                        overflowY: 'auto'
                      }}>
                        <div style={{ padding: '6px 12px', backgroundColor: '#f0fdf4', borderBottom: '1px solid #d1fae5', fontSize: '0.72rem', fontWeight: 700, color: '#065f46', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>SELECT TO AUTO-FILL INVOICE</span>
                          <button
                            type="button"
                            onClick={() => setShowInvoiceNameSuggestions(false)}
                            style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#6b7280', cursor: 'pointer', padding: 0 }}
                          >
                            ✕
                          </button>
                        </div>
                        {invoiceNameMatches.map((m, idx) => (
                          <div
                            key={`inv-name-${m.type}-${m.id}-${idx}`}
                            onClick={() => handlePickInvoiceCustomerSuggestion(m)}
                            style={{
                              padding: '9px 12px',
                              borderBottom: idx < invoiceNameMatches.length - 1 ? '1px solid #f3f4f6' : 'none',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              transition: 'background-color 0.15s ease',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                          >
                            <div>
                              <div style={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{m.name || m.customerName}</span>
                                <span style={{
                                  fontSize: '0.68rem',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                  backgroundColor: m.type === 'quotation' ? '#eff6ff' : '#fef3c7',
                                  color: m.type === 'quotation' ? '#1d4ed8' : '#b45309',
                                  border: `1px solid ${m.type === 'quotation' ? '#bfdbfe' : '#fde68a'}`
                                }}>
                                  {m.type === 'quotation' ? `🧾 Quote #${m.id}` : `📋 Lead #${m.id}`}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '2px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <span>📞 {m.mobile || m.customerPhone || 'No phone'}</span>
                                {(m.vehicle || m.vehicleModel) && <span>| 🏍️ {m.vehicle || m.vehicleModel} {m.color || m.vehicleColor ? `(${m.color || m.vehicleColor})` : ''}</span>}
                                {(m.address || m.customerAddress) && <span>| 📍 {m.address || m.customerAddress}</span>}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', display: 'block' }}>
                                ₹{Number(m.total || m.exShowroom || m.price || 0).toLocaleString('en-IN')}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>+ Auto-fill</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mobile Number with Live Search */}
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Mobile Number *</span>
                      {invoicePhoneMatches.length > 0 && showInvoicePhoneSuggestions && (
                        <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                          ⚡ {invoicePhoneMatches.length} match{invoicePhoneMatches.length > 1 ? 'es' : ''}
                        </span>
                      )}
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="form-control"
                      placeholder="10-digit number (Searchable)"
                      required
                      pattern="[0-9]{10}"
                      value={invoiceFormData.customerPhone}
                      onChange={(e) => {
                        setInvoiceFormData({ ...invoiceFormData, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) });
                        setShowInvoicePhoneSuggestions(true);
                      }}
                      onFocus={() => setShowInvoicePhoneSuggestions(true)}
                      autoComplete="off"
                    />

                    {/* Floating Suggestion Dropdown for Phone */}
                    {showInvoicePhoneSuggestions && invoicePhoneMatches.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #059669',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.18)',
                        zIndex: 1050,
                        marginTop: '4px',
                        maxHeight: '260px',
                        overflowY: 'auto'
                      }}>
                        <div style={{ padding: '6px 12px', backgroundColor: '#f0fdf4', borderBottom: '1px solid #d1fae5', fontSize: '0.72rem', fontWeight: 700, color: '#065f46', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>MATCHING PHONE NUMBERS</span>
                          <button
                            type="button"
                            onClick={() => setShowInvoicePhoneSuggestions(false)}
                            style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#6b7280', cursor: 'pointer', padding: 0 }}
                          >
                            ✕
                          </button>
                        </div>
                        {invoicePhoneMatches.map((m, idx) => (
                          <div
                            key={`inv-phone-${m.type}-${m.id}-${idx}`}
                            onClick={() => handlePickInvoiceCustomerSuggestion(m)}
                            style={{
                              padding: '9px 12px',
                              borderBottom: idx < invoicePhoneMatches.length - 1 ? '1px solid #f3f4f6' : 'none',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              transition: 'background-color 0.15s ease',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                          >
                            <div>
                              <div style={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{m.name || m.customerName}</span>
                                <span style={{
                                  fontSize: '0.68rem',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                  backgroundColor: m.type === 'quotation' ? '#eff6ff' : '#fef3c7',
                                  color: m.type === 'quotation' ? '#1d4ed8' : '#b45309',
                                  border: `1px solid ${m.type === 'quotation' ? '#bfdbfe' : '#fde68a'}`
                                }}>
                                  {m.type === 'quotation' ? `🧾 Quote #${m.id}` : `📋 Lead #${m.id}`}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#6b7280', marginTop: '2px' }}>
                                📞 <strong>{m.mobile || m.customerPhone}</strong> {(m.vehicle || m.vehicleModel) ? `| 🏍️ ${m.vehicle || m.vehicleModel}` : ''}
                              </div>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>+ Auto-fill</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Aadhar Number</label>
                    <input
                      type="text"
                      className="form-control"
                      
                      pattern="[0-9]{12}"
                      maxLength={12} pattern="[0-9]{12}" value={invoiceFormData.customerAadhar}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerAadhar: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customer GSTIN (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      
                      style={{ textTransform: 'uppercase' }}
                      maxLength={15} value={invoiceFormData.customerGst}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerGst: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Customer Birthday</label>
                    <input
                      type="date"
                      className="form-control"
                      value={invoiceFormData.customerBirthday || ''}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerBirthday: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Customer Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={invoiceFormData.customerAddress}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerAddress: e.target.value })}
                    />
                  </div>
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
                      maxLength={15} value={invoiceFormData.gstRate}
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
      {currentSubTab === 'invoice' && (
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

                    {/* Dealership Invoice Terms & Conditions */}
                    <div style={{ marginTop: '16px', fontSize: '0.7rem', color: '#4b5563', lineHeight: 1.4 }}>
                      <strong style={{ display: 'block', color: '#111827', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                        Terms & Conditions
                      </strong>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {companyProfile?.invoiceTerms || `1. Goods once sold will not be taken back or exchanged.
2. Warranty is subject to manufacturer's policy and applies from the date of this invoice.
3. Dealership is not liable for indirect damages or delays beyond our control.
4. All disputes are subject to local city jurisdiction only.
5. E. & O.E. (Errors and Omissions Excepted)`}
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
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Lead Entry Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={leadFormData.entryDate}
                      onChange={(e) => setLeadFormData({ ...leadFormData, entryDate: e.target.value })}
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

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    
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
                      
                      maxLength="14"
                      maxLength={12} pattern="[0-9]{12}" value={leadFormData.aadhar}
                      onChange={(e) => setLeadFormData({ ...leadFormData, aadhar: e.target.value })}
                    />
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

                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      
                      value={leadFormData.address}
                      onChange={(e) => setLeadFormData({ ...leadFormData, address: e.target.value })}
                    />
                  </div>
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

              {/* SECTION C: LEAD FOLLOWUP & REMINDER */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={15} /> 3. Lead Followup & Reminder
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

                {/* REMINDER ON / OFF TOGGLE SWITCH */}
                <div className="form-group" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>Follow-up Reminder Option</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: leadFormData.reminder === 'ON' ? '#059669' : '#dc2626' }}>
                      {leadFormData.reminder === 'ON' ? '🔔 Reminder is ON' : '🔕 Reminder is OFF'}
                    </span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setLeadFormData({ ...leadFormData, reminder: 'ON' })}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '6px',
                        border: '1.5px solid',
                        borderColor: leadFormData.reminder === 'ON' ? '#059669' : '#d1d5db',
                        backgroundColor: leadFormData.reminder === 'ON' ? '#ecfdf5' : '#ffffff',
                        color: leadFormData.reminder === 'ON' ? '#047857' : '#6b7280',
                        fontWeight: leadFormData.reminder === 'ON' ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Bell size={15} /> Reminder ON
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadFormData({ ...leadFormData, reminder: 'OFF' })}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '6px',
                        border: '1.5px solid',
                        borderColor: leadFormData.reminder === 'OFF' ? '#ef4444' : '#d1d5db',
                        backgroundColor: leadFormData.reminder === 'OFF' ? '#fef2f2' : '#ffffff',
                        color: leadFormData.reminder === 'OFF' ? '#b91c1c' : '#6b7280',
                        fontWeight: leadFormData.reminder === 'OFF' ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <BellOff size={15} /> Reminder OFF
                    </button>
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
                    <label className="form-label">Reminder Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={leadFormData.reminderTime || '10:00'}
                      onChange={(e) => setLeadFormData({ ...leadFormData, reminderTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Note / Action Description</label>
                  <input
                    type="text"
                    className="form-control"
                    
                    value={leadFormData.note}
                    onChange={(e) => setLeadFormData({ ...leadFormData, note: e.target.value })}
                  />
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
          backdropFilter: 'blur(4px)'
        }} onClick={() => setActiveFormTab(null)}>
          <div className="card" style={{
            width: '92%',
            maxWidth: '660px',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            margin: 0,
            borderRadius: '12px'
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 className="card-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={20} style={{ color: '#059669' }} />
                {editingQuoteId ? `Edit On-Road Quotation #${editingQuoteId}` : 'On-Road Quotation Calculator'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingQuoteId && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingQuoteId(null)}
                    style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#b91c1c' }}
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setActiveFormTab(null); setEditingQuoteId(null); }}
                  style={{ padding: '4px 10px', minWidth: 'auto', borderRadius: '6px' }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <form className="card-body" style={{ padding: '20px' }} onSubmit={(e) => { handleQuoteSubmit(e); setActiveFormTab(null); }}>
              {/* SECTION 1: CUSTOMER DETAILS */}
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                <h4 style={{ fontSize: '0.82rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: 700 }}>
                  1. Customer Information
                </h4>
                <div className="form-grid">
                  {/* Customer Name Input with Live Matching Leads Dropdown */}
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Customer Name *</span>
                      {nameLeadMatches.length > 0 && showLeadNameSuggestions && (
                        <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                          ⚡ {nameLeadMatches.length} lead {nameLeadMatches.length === 1 ? 'match' : 'matches'} found
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      
                      required
                      autoComplete="off"
                      value={quoteFormData.customerName}
                      onFocus={() => setShowLeadNameSuggestions(true)}
                      onChange={(e) => {
                        setQuoteFormData({ ...quoteFormData, customerName: e.target.value });
                        setShowLeadNameSuggestions(true);
                      }}
                    />

                    {/* Dropdown Box below input when matching leads exist */}
                    {showLeadNameSuggestions && nameLeadMatches.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1200,
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #10b981',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.18), 0 4px 6px -2px rgba(0,0,0,0.05)',
                        marginTop: '4px',
                        maxHeight: '250px',
                        overflowY: 'auto'
                      }}>
                        <div style={{
                          padding: '7px 12px',
                          backgroundColor: '#ecfdf5',
                          borderBottom: '1px solid #d1fae5',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '0.73rem', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            ⚡ Leads Found — Click to Auto-Fill
                          </span>
                          <span
                            onClick={(e) => { e.stopPropagation(); setShowLeadNameSuggestions(false); }}
                            style={{ fontSize: '0.72rem', color: '#6b7280', cursor: 'pointer', fontWeight: 600 }}
                          >
                            ✕ Close
                          </span>
                        </div>

                        {nameLeadMatches.map((matchedLead, idx) => (
                          <div
                            key={matchedLead.id || idx}
                            onMouseDown={() => handlePickLeadSuggestion(matchedLead)}
                            style={{
                              padding: '10px 14px',
                              borderBottom: idx < nameLeadMatches.length - 1 ? '1px solid #f3f4f6' : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.12s ease',
                              backgroundColor: '#ffffff'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{matchedLead.name}</span>
                                <span style={{ fontSize: '0.68rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bbf7d0', fontWeight: 600 }}>
                                  Lead #{matchedLead.id}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#6b7280', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>📞 {matchedLead.mobile}</span>
                                <span>•</span>
                                <span style={{ color: '#059669', fontWeight: 600 }}>🏍️ {matchedLead.vehicle || matchedLead.vehicleModel || 'Two-Wheeler'} {matchedLead.color ? `(${matchedLead.color})` : ''}</span>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#059669' }}>
                                ₹{Number(matchedLead.price || 0).toLocaleString('en-IN')}
                              </span>
                              <span style={{ display: 'block', fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>
                                Click to Add ↵
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mobile Number Input with Live Matching Leads Dropdown */}
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className="form-control"
                      
                      pattern="[0-9]{10}"
                      autoComplete="off"
                      value={quoteFormData.customerPhone}
                      onFocus={() => setShowLeadPhoneSuggestions(true)}
                      onChange={(e) => {
                        setQuoteFormData({ ...quoteFormData, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) });
                        setShowLeadPhoneSuggestions(true);
                      }}
                    />

                    {showLeadPhoneSuggestions && phoneLeadMatches.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 1200,
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #10b981',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.18)',
                        marginTop: '4px',
                        maxHeight: '250px',
                        overflowY: 'auto'
                      }}>
                        <div style={{
                          padding: '7px 12px',
                          backgroundColor: '#ecfdf5',
                          borderBottom: '1px solid #d1fae5',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '0.73rem', fontWeight: 700, color: '#047857' }}>
                            ⚡ Matching Lead by Phone (Click to Auto-Fill)
                          </span>
                          <span
                            onClick={(e) => { e.stopPropagation(); setShowLeadPhoneSuggestions(false); }}
                            style={{ fontSize: '0.72rem', color: '#6b7280', cursor: 'pointer', fontWeight: 600 }}
                          >
                            ✕
                          </span>
                        </div>

                        {phoneLeadMatches.map((matchedLead, idx) => (
                          <div
                            key={matchedLead.id || idx}
                            onMouseDown={() => handlePickLeadSuggestion(matchedLead)}
                            style={{
                              padding: '10px 14px',
                              borderBottom: idx < phoneLeadMatches.length - 1 ? '1px solid #f3f4f6' : 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.12s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827' }}>
                                {matchedLead.name} (📞 {matchedLead.mobile})
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#059669', marginTop: '2px' }}>
                                🏍️ {matchedLead.vehicle || matchedLead.vehicleModel} ({matchedLead.color || 'Standard'})
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#059669' }}>
                                ₹{Number(matchedLead.price || 0).toLocaleString('en-IN')}
                              </span>
                              <span style={{ display: 'block', fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>
                                Click to Add ↵
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-grid">
                  {/* Customer Email */}
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      
                      value={quoteFormData.customerEmail}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, customerEmail: e.target.value })}
                    />
                  </div>
                  {/* Assigned Sales Executive */}
                  <div className="form-group">
                    <label className="form-label">Assigned Executive</label>
                    <select
                      className="form-control"
                      value={quoteFormData.executive}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, executive: e.target.value })}
                    >
                      {executiveList.map((exec, idx) => (
                        <option key={idx} value={exec}>{exec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  {/* Aadhar Number */}
                  <div className="form-group">
                    <label className="form-label">Aadhar Number</label>
                    <input
                      type="text"
                      className="form-control"
                      
                      maxLength="14"
                      maxLength={12} pattern="[0-9]{12}" value={quoteFormData.customerAadhar}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, customerAadhar: e.target.value })}
                    />
                  </div>
                  {/* Customer GSTIN */}
                  <div className="form-group">
                    <label className="form-label">Customer GSTIN (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      
                      style={{ textTransform: 'uppercase' }}
                      maxLength={15} value={quoteFormData.customerGst}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, customerGst: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                {/* Customer Address Input */}
                <div className="form-group">
                  <label className="form-label">Customer Address</label>
                  <input
                    type="text"
                    className="form-control"
                    
                    value={quoteFormData.customerAddress}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, customerAddress: e.target.value })}
                  />
                </div>
              </div>

              {/* SECTION 2: VEHICLE CHOICE */}
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                <h4 style={{ fontSize: '0.82rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: 700 }}>
                  2. Vehicle Selection
                </h4>
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
                      <option value="">Choose Vehicle Model</option>
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
              </div>

              {/* SECTION 3: ON-ROAD PRICE BREAKDOWN */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.82rem', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', fontWeight: 700 }}>
                  3. Price Components (₹)
                </h4>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Ex-Showroom Base Price (₹) *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      
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
                    <label className="form-label">Select GST Tax Rate *</label>
                    <select
                      className="form-control"
                      required
                      maxLength={15} value={quoteFormData.gstRate}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, gstRate: Number(e.target.value) })}
                    >
                      <option value={28}>28% GST (Standard Two-Wheelers)</option>
                      <option value={18}>18% GST (Commercial / Spares)</option>
                      <option value={12}>12% GST</option>
                      <option value={5}>5% GST (EV Standard)</option>
                      <option value={0}>0% GST (Exempted / Zero Tax)</option>
                    </select>
                    {quoteFormData.exShowroom && (
                      <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, display: 'block', marginTop: '3px' }}>
                        GST Amount: ₹{Math.round(Number(quoteFormData.exShowroom || 0) * (Number(quoteFormData.gstRate || 0) / 100)).toLocaleString('en-IN')} ({quoteFormData.gstRate}%)
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Special Dealer Discount (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      
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
                  <div className="form-group">
                    <label className="form-label">RTO Registration & Tax (₹) *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      
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
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">5-Yr Comprehensive Insurance (₹) *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      
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
                  <div className="form-group">
                    <label className="form-label">Accessories & Helmet Kit (₹)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      
                      value={quoteFormData.accessories}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*$/.test(val)) {
                          setQuoteFormData({ ...quoteFormData, accessories: val });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Logistics / Handling Charges (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    
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

              {/* Real-time Estimated On-Road Price Banner */}
              <div style={{
                padding: '16px 20px',
                backgroundColor: '#ecfdf5',
                borderRadius: '10px',
                border: '1.5px solid #a7f3d0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px'
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#047857', fontSize: '0.85rem', textTransform: 'uppercase', display: 'block' }}>
                    Calculated Net On-Road Total
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#065f46' }}>
                    Auto-sum of vehicle base price, statutory levies, and deductions
                  </span>
                </div>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>
                  ₹{calculateOnRoadTotal().toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 700, borderRadius: '8px' }}
              >
                {editingQuoteId ? 'UPDATE ON-ROAD QUOTATION' : 'GENERATE & SAVE QUOTATION'}
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

      {/* Global Print Preview Modal */}
      <PrintPreviewModal
        isOpen={printModalConfig.isOpen}
        onClose={() => setPrintModalConfig(prev => ({ ...prev, isOpen: false }))}
        type={printModalConfig.type}
        data={printModalConfig.data}
        companyProfile={companyProfile}
        onConvertQuoteToInvoice={(q) => {
          setPrintModalConfig(prev => ({ ...prev, isOpen: false }));
          handleConvertQuoteToInvoice(q);
        }}
        onConvertBookingToInvoice={(b) => {
          setPrintModalConfig(prev => ({ ...prev, isOpen: false }));
          handleConvertBookingToInvoice(b);
        }}
      />
    </div>
  );
}
