import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import LeadsManagement from './components/pages/LeadsManagement';
import CustomersPage from './components/pages/CustomersPage';
import VehicleListPage from './components/pages/VehicleListPage';
import SpareInventoryPage from './components/pages/SpareInventoryPage';
import SettingsPage from './components/pages/SettingsPage';
import VehicleServicePage from './components/pages/VehicleServicePage';
import AccountingLedgerPage from './components/pages/AccountingLedgerPage';
import PurchasePage from './components/pages/PurchasePage';
import WarrantyClaimPage from './components/pages/WarrantyClaimPage';
import ExecutivesPage from './components/pages/ExecutivesPage';
import AlertsPage from './components/pages/AlertsPage';
import BirthdayWishesPage from './components/pages/BirthdayWishesPage';
import RedeemPointsPage from './components/pages/RedeemPointsPage';
import CompanyProfilePage from './components/pages/CompanyProfilePage';
import { API_BASE_URL } from './config/api';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState(null);

  // Shared Leads Database with localStorage Persistence
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('nandhi_leads');
    return saved ? JSON.parse(saved) : [
      { id: 'L-01', name: 'Rajesh Kumar', mobile: '9842155670', vehicle: 'Honda Activa 6G', status: 'Hot', leadType: 'Hot', sourceType: 'Walk-In', executive: 'Suresh Kumar', createdOn: '14/08/2026' },
      { id: 'L-02', name: 'Priya Dharshini', mobile: '9443219800', vehicle: 'Honda Shine 125', status: 'Warm', leadType: 'Warm', sourceType: 'Digital / Web', executive: 'Ramesh Babu', createdOn: '13/08/2026' }
    ];
  });

  // Shared Customers Database with localStorage Persistence
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('nandhi_customers');
    return saved ? JSON.parse(saved) : [
      { id: 'C-01', name: 'Rajesh Kumar', mobile: '9842155670', vehicleModel: 'Honda Activa 6G', registeredOn: '14/08/2026', source: 'Walk-In' },
      { id: 'C-02', name: 'Priya Dharshini', mobile: '9443219800', vehicleModel: 'Honda Shine 125', registeredOn: '13/08/2026', source: 'Digital / Web' }
    ];
  });

  // Shared Spares Database with localStorage Persistence
  const [spares, setSpares] = useState(() => {
    const saved = localStorage.getItem('nandhi_spares');
    return saved ? JSON.parse(saved) : [
      { id: 'SP-01', name: 'Engine Oil 4T 10W30 (1L)', partNo: 'OIL-4T-10W30', category: 'Lubricants', stock: 48, minStock: 15, unitPrice: 380, location: 'Rack A-1' },
      { id: 'SP-02', name: 'Brake Shoe Set Activa 6G', partNo: 'BS-ACT-6G', category: 'Brakes', stock: 24, minStock: 10, unitPrice: 280, location: 'Rack B-2' },
      { id: 'SP-03', name: 'Spark Plug CPR8EA-9', partNo: 'SP-CPR8EA', category: 'Electricals', stock: 8, minStock: 12, unitPrice: 160, location: 'Rack C-1' }
    ];
  });

  // Shared Invoices Database with localStorage Persistence
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('nandhi_invoices');
    return saved ? JSON.parse(saved) : [
      { invoiceNo: '01', customerName: 'Rajesh Kumar', customerPhone: '9842155670', customerAddress: '12, Gandhi Nagar, Namakkal', customerAadhar: '9821-4412-9901', customerGst: '33AAAAA0000A1Z5', vehicleModel: 'Honda Activa 6G', vehicleColor: 'Matte Blue', vinNumber: 'ME4JF911NK00892', engineNo: 'JF91E918231', batteryNumber: 'BAT-2026-NANDHI', chargerNumber: 'CHG-9921', controllerNumber: 'CTRL-8812', exShowroom: 82000, gstRate: 5, gstAmount: 4100, insurance: 6200, rto: 10400, subsidy: 0, discount: 0, totalBeforeRoundoff: 102700, grandTotal: 102700, paymentStatus: 'Fully Paid', invoiceDate: '14/08/2026' }
    ];
  });

  // Shared Quotations Database with localStorage Persistence
  const [quotations, setQuotations] = useState(() => {
    const saved = localStorage.getItem('nandhi_quotations');
    return saved ? JSON.parse(saved) : [
      { quoteId: 'QT-01', customerName: 'Rajesh Kumar', customerPhone: '9842155670', vehicleModel: 'Honda Activa 6G', vehicleColor: 'Matte Blue', exShowroom: 82000, rto: 10400, insurance: 6200, accessories: 1500, handling: 0, discount: 1000, total: 99100, createdOn: '14/08/2026' }
    ];
  });

  // Shared Vehicles Directory with localStorage Persistence
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('nandhi_vehicles');
    return saved ? JSON.parse(saved) : [
      { id: 'VEH-01', brand: 'Honda', model: 'Activa 6G', color: 'Matte Blue', hsnCode: '87112029', price: 82000 },
      { id: 'VEH-02', brand: 'Honda', model: 'Shine 125', color: 'Black', hsnCode: '87112029', price: 89000 },
      { id: 'VEH-03', brand: 'Honda', model: 'SP 125', color: 'Imperial Red', hsnCode: '87112029', price: 92000 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('nandhi_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('nandhi_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('nandhi_spares', JSON.stringify(spares));
  }, [spares]);

  useEffect(() => {
    localStorage.setItem('nandhi_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('nandhi_quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('nandhi_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  // Shared Job Sheets Database
  const [jobSheets, setJobSheets] = useState(() => {
    const saved = localStorage.getItem('nandhi_jobsheets');
    return saved ? JSON.parse(saved) : [
      { id: 'JS-01', customerName: 'Rajesh Kumar', vehicleNo: 'TN-37-BJ-5120', vehicleKm: '12400', complaints: '1. Odometer console flicker\n2. Front suspension noise\n3. General water wash', serviceType: 'Paid Service', status: 'In Progress', billingStatus: 'Unbilled', date: '14/08/2026' },
      { id: 'JS-02', customerName: 'Deepak Sharma', vehicleNo: 'TN-45-AS-9821', vehicleKm: '8200', complaints: '1. First free service checkup\n2. Battery voltage testing', serviceType: 'Free Service', status: 'Ready', billingStatus: 'Unbilled', date: '13/08/2026' }
    ];
  });

  // Shared Service Bills Database
  const [serviceBills, setServiceBills] = useState(() => {
    const saved = localStorage.getItem('nandhi_service_bills');
    return saved ? JSON.parse(saved) : [
      { id: 'SB-01', jobSheetId: 'JS-01', customerName: 'Sanjay Kumar', vehicleNo: 'TN-37-BJ-5120', serviceType: 'Paid Service', laborItems: [{ desc: 'General Labor', amount: 350 }], parts: [{ id: 'SP-01', name: 'Brake Shoe Set Activa 6G', price: 280, qty: 1 }], subtotal: 630, gst: 32, discount: 0, roundOff: -2, grandTotal: 660, date: '12/08/2026' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('nandhi_jobsheets', JSON.stringify(jobSheets));
  }, [jobSheets]);

  useEffect(() => {
    localStorage.setItem('nandhi_service_bills', JSON.stringify(serviceBills));
  }, [serviceBills]);

  // Shared Daily Expenses Database
  const [dailyExpenses, setDailyExpenses] = useState(() => {
    const saved = localStorage.getItem('nandhi_daily_expenses');
    return saved ? JSON.parse(saved) : [
      { id: 'EXP-01', category: 'Rent', amount: 15000, payee: 'Showroom Owner', date: '2026-08-01', paymentMode: 'Bank Transfer', notes: 'Monthly Showroom Rent' },
      { id: 'EXP-02', category: 'Electricity', amount: 3450, payee: 'TNEB Electricity Board', date: '2026-08-05', paymentMode: 'UPI', notes: 'Electricity bill for July' },
      { id: 'EXP-03', category: 'Snacks', amount: 450, payee: 'Sri Krishna Tea Stall', date: '2026-08-14', paymentMode: 'Cash', notes: 'Staff & customer refreshments' }
    ];
  });

  // Shared Purchase Invoices Database
  const [purchaseInvoices, setPurchaseInvoices] = useState(() => {
    const saved = localStorage.getItem('nandhi_purchase_invoices');
    return saved ? JSON.parse(saved) : [
      { id: 'PUR-01', purchaseType: 'Vehicle Purchases', supplierName: 'Honda Motorcycle & Scooter India', supplierGst: '33AABCH1234F1Z5', invoiceNo: 'HMSI-INV-9921', date: '2026-08-02', itemDetails: '5x Honda Activa 6G (Black)', qty: 5, unitPrice: 75000, gstRate: 5, gstAmount: 18750, totalAmount: 393750 },
      { id: 'PUR-02', purchaseType: 'Spare Purchases', supplierName: 'Anand Auto Spares Co', supplierGst: '33AABCA9876E1Z1', invoiceNo: 'AAS-8812', date: '2026-08-08', itemDetails: '20x Brake Shoe Set Activa 6G', qty: 20, unitPrice: 220, gstRate: 18, gstAmount: 792, totalAmount: 5192 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('nandhi_daily_expenses', JSON.stringify(dailyExpenses));
  }, [dailyExpenses]);

  useEffect(() => {
    localStorage.setItem('nandhi_purchase_invoices', JSON.stringify(purchaseInvoices));
  }, [purchaseInvoices]);

  // Shared Preview Configurations for Pages
  const [showPreviews, setShowPreviews] = useState(() => {
    const saved = localStorage.getItem('nandhi_show_previews');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Shared Company Profile State
  const [companyProfile, setCompanyProfile] = useState(() => {
    const saved = localStorage.getItem('nandhi_company_profile');
    return saved ? JSON.parse(saved) : {
      name: 'NANDHI MOTORS',
      tagline: 'Authorized Two-Wheeler Sales, Genuine Spares & Service Dealership',
      address: 'SF No. 124/2, Trichy Main Road, Namakkal, Tamil Nadu - 637001',
      phone: '+91 98421 55670',
      altPhone: '+91 94432 19800',
      email: 'contact@nandhimotors.com',
      website: 'www.nandhimotors.com',
      gstin: '33AABCN1234F1Z9',
      state: 'Tamil Nadu (33)',
      pan: 'AABCN1234F',
      bankName: 'HDFC Bank',
      accountName: 'NANDHI MOTORS',
      accountNumber: '50200088991234',
      ifscCode: 'HDFC0001234',
      branch: 'Namakkal Main Branch',
      upiId: 'nandhimotors@hdfcbank'
    };
  });

  useEffect(() => {
    localStorage.setItem('nandhi_company_profile', JSON.stringify(companyProfile));
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem('nandhi_show_previews', JSON.stringify(showPreviews));
  }, [showPreviews]);

  // Fetch initial data from backend on mount (MERGE WITHOUT OVERWRITING USER DATA)
  useEffect(() => {
    const initData = async () => {
      try {
        const vRes = await fetch(`${API_BASE_URL}/api/vehicles`);
        if (vRes.ok) {
          const vData = await vRes.json();
          if (Array.isArray(vData) && vData.length > 0) setVehicles(vData);
        }
      } catch (e) {
        console.warn('Fallback to local storage for vehicles.');
      }

      try {
        const lRes = await fetch(`${API_BASE_URL}/api/leads`);
        if (lRes.ok) {
          const lData = await lRes.json();
          if (Array.isArray(lData) && lData.length > 0) setLeads(lData);
        }
      } catch (e) {
        console.warn('Fallback to local storage for leads.');
      }

      try {
        const cRes = await fetch(`${API_BASE_URL}/api/customers`);
        if (cRes.ok) {
          const cData = await cRes.json();
          if (Array.isArray(cData) && cData.length > 0) setCustomers(cData);
        }
      } catch (e) {
        console.warn('Fallback to local storage for customers.');
      }

      try {
        const sRes = await fetch(`${API_BASE_URL}/api/spares`);
        if (sRes.ok) {
          const sData = await sRes.json();
          if (Array.isArray(sData) && sData.length > 0) setSpares(sData);
        }
      } catch (e) {
        console.warn('Fallback to local storage for spares.');
      }

      try {
        const invRes = await fetch(`${API_BASE_URL}/api/invoices`);
        if (invRes.ok) {
          const invData = await invRes.json();
          if (Array.isArray(invData) && invData.length > 0) setInvoices(invData);
        }
      } catch (e) {
        console.warn('Fallback to local storage for invoices.');
      }

      try {
        const qRes = await fetch(`${API_BASE_URL}/api/quotations`);
        if (qRes.ok) {
          const qData = await qRes.json();
          if (Array.isArray(qData) && qData.length > 0) setQuotations(qData);
        }
      } catch (e) {
        console.warn('Fallback to local storage for quotations.');
      }

      try {
        const jsRes = await fetch(`${API_BASE_URL}/api/jobsheets`);
        if (jsRes.ok) {
          const jsData = await jsRes.json();
          if (Array.isArray(jsData) && jsData.length > 0) setJobSheets(jsData);
        }
      } catch (e) {
        console.warn('Fallback to local storage for job sheets.');
      }

      try {
        const sbRes = await fetch(`${API_BASE_URL}/api/service-bills`);
        if (sbRes.ok) {
          const sbData = await sbRes.json();
          if (Array.isArray(sbData) && sbData.length > 0) setServiceBills(sbData);
        }
      } catch (e) {
        console.warn('Fallback to local storage for service bills.');
      }

      try {
        const expRes = await fetch(`${API_BASE_URL}/api/expenses`);
        if (expRes.ok) {
          const expData = await expRes.json();
          if (Array.isArray(expData) && expData.length > 0) setDailyExpenses(expData);
        }
      } catch (e) {
        console.warn('Fallback to local storage for expenses.');
      }

      try {
        const purRes = await fetch(`${API_BASE_URL}/api/purchases`);
        if (purRes.ok) {
          const purData = await purRes.json();
          if (Array.isArray(purData) && purData.length > 0) setPurchaseInvoices(purData);
        }
      } catch (e) {
        console.warn('Fallback to local storage for purchases.');
      }

      try {
        const profRes = await fetch(`${API_BASE_URL}/api/company-profile`);
        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData && profData.name) setCompanyProfile(profData);
        }
      } catch (e) {
        console.warn('Fallback to local storage for company profile.');
      }
    };
    initData();
  }, []);

  // MongoDB Synchronization Helpers
  const syncVehiclesWithDatabase = async (prev, updated) => {
    if (updated.length > prev.length) {
      // Add Vehicle
      const newVeh = updated[0];
      try {
        const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVeh)
        });
        if (res.ok) {
          const saved = await res.json();
          setVehicles(current => current.map(item => item.id === newVeh.id ? saved : item));
        }
      } catch (e) {
        console.error('Failed to sync added vehicle with MongoDB:', e);
      }
    } else if (updated.length < prev.length) {
      // Delete Vehicle
      const deleted = prev.find(pv => !updated.some(uv => uv.id === pv.id));
      if (deleted) {
        try {
          await fetch(`${API_BASE_URL}/api/vehicles/${deleted.id}`, {
            method: 'DELETE'
          });
        } catch (e) {
          console.error('Failed to sync deleted vehicle with MongoDB:', e);
        }
      }
    }
  };

  const handleSetVehicles = async (action) => {
    if (typeof action === 'function') {
      setVehicles(prev => {
        const updated = action(prev);
        syncVehiclesWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncVehiclesWithDatabase(vehicles, action);
      setVehicles(action);
    }
  };

  const syncLeadsWithDatabase = async (prev, updated) => {
    if (updated.length > prev.length) {
      // Add Lead
      const newLead = updated[0];
      try {
        const res = await fetch(`${API_BASE_URL}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLead)
        });
        if (res.ok) {
          const saved = await res.json();
          setLeads(current => current.map(item => item.id === newLead.id ? saved : item));
        }
      } catch (e) {
        console.error('Failed to sync added lead with MongoDB:', e);
      }
    } else if (updated.length < prev.length) {
      // Delete Lead
      const deleted = prev.find(pl => !updated.some(ul => ul.id === pl.id));
      if (deleted) {
        try {
          await fetch(`${API_BASE_URL}/api/leads/${deleted.id}`, {
            method: 'DELETE'
          });
        } catch (e) {
          console.error('Failed to sync deleted lead with MongoDB:', e);
        }
      }
    }
  };

  const handleSetLeads = async (action) => {
    if (typeof action === 'function') {
      setLeads(prev => {
        const updated = action(prev);
        syncLeadsWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncLeadsWithDatabase(leads, action);
      setLeads(action);
    }
  };

  const syncCustomersWithDatabase = async (prev, updated) => {
    if (updated.length < prev.length) {
      // Delete Customer
      const deleted = prev.find(pc => !updated.some(uc => uc.id === pc.id));
      if (deleted) {
        try {
          await fetch(`${API_BASE_URL}/api/customers/${deleted.id}`, {
            method: 'DELETE'
          });
        } catch (e) {
          console.error('Failed to sync deleted customer with MongoDB:', e);
        }
      }
    }
  };

  const handleSetCustomers = async (action) => {
    if (typeof action === 'function') {
      setCustomers(prev => {
        const updated = action(prev);
        syncCustomersWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncCustomersWithDatabase(customers, action);
      setCustomers(action);
    }
  };

  const syncSparesWithDatabase = async (prev, updated) => {
    if (updated.length > prev.length) {
      // Add Spare
      const newSpare = updated[0];
      try {
        const res = await fetch(`${API_BASE_URL}/api/spares`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSpare)
        });
        if (res.ok) {
          const saved = await res.json();
          setSpares(current => current.map(item => item.id === newSpare.id ? saved : item));
        }
      } catch (e) {
        console.error('Failed to sync added spare with MongoDB:', e);
      }
    } else if (updated.length < prev.length) {
      // Delete Spare
      const deleted = prev.find(ps => !updated.some(us => us.id === ps.id));
      if (deleted) {
        try {
          await fetch(`${API_BASE_URL}/api/spares/${deleted.id}`, {
            method: 'DELETE'
          });
        } catch (e) {
          console.error('Failed to sync deleted spare with MongoDB:', e);
        }
      }
    }
  };

  const handleSetSpares = async (action) => {
    if (typeof action === 'function') {
      setSpares(prev => {
        const updated = action(prev);
        syncSparesWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncSparesWithDatabase(spares, action);
      setSpares(action);
    }
  };

  // Add a customer from a submitted lead (avoids duplicates by mobile)
  const addCustomer = async (leadData) => {
    const customerPayload = {
      name: leadData.name,
      mobile: leadData.mobile,
      email: leadData.email || '',
      aadhar: leadData.aadhar || '',
      address: leadData.address || '',
      source: leadData.sourceType || 'Walk-In'
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerPayload)
      });
      if (res.ok) {
        const saved = await res.json();
        setCustomers(prev => {
          const exists = prev.some(c => c.mobile === saved.mobile);
          if (exists) return prev;
          return [saved, ...prev];
        });
      }
    } catch (err) {
      console.error('Failed to add customer to MongoDB:', err);
      // Fallback local memory
      setCustomers(prev => {
        const exists = prev.some(c => c.mobile === leadData.mobile);
        if (exists) return prev;
        const newCustomer = {
          id: `C-${String(prev.length + 1).padStart(2, '0')}`,
          name: leadData.name,
          mobile: leadData.mobile,
          email: leadData.email || '',
          aadhar: leadData.aadhar || '',
          address: leadData.address || '',
          source: leadData.sourceType || 'Walk-In',
          registeredOn: new Date().toLocaleDateString('en-IN')
        };
        return [newCustomer, ...prev];
      });
    }
  };

  // Add or Update an Invoice in backend database
  const addInvoice = async (invoicePayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload)
      });
      if (res.ok) {
        const saved = await res.json();
        setInvoices(prev => {
          const idx = prev.findIndex(inv => inv.invoiceNo === saved.invoiceNo);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [saved, ...prev];
        });
        return saved;
      }
    } catch (err) {
      console.error('Failed to save invoice to MongoDB:', err);
    }
    // Fallback local state
    setInvoices(prev => {
      const idx = prev.findIndex(inv => inv.invoiceNo === invoicePayload.invoiceNo);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = invoicePayload;
        return next;
      }
      return [invoicePayload, ...prev];
    });
    return invoicePayload;
  };

  // Delete an Invoice from backend database
  const deleteInvoice = async (invoiceNo) => {
    try {
      await fetch(`${API_BASE_URL}/api/invoices/${invoiceNo}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete invoice from MongoDB:', err);
    }
    setInvoices(prev => prev.filter(inv => inv.invoiceNo !== invoiceNo));
  };

  // Add or Update a Quotation in backend database
  const addQuotation = async (quotePayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotePayload)
      });
      if (res.ok) {
        const saved = await res.json();
        setQuotations(prev => {
          const idx = prev.findIndex(q => q.quoteId === saved.quoteId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [saved, ...prev];
        });
        return saved;
      }
    } catch (err) {
      console.error('Failed to save quotation to MongoDB:', err);
    }
    // Fallback local state if server is down
    setQuotations(prev => {
      const idx = prev.findIndex(q => q.quoteId === quotePayload.quoteId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = quotePayload;
        return next;
      }
      return [quotePayload, ...prev];
    });
    return quotePayload;
  };

  // Delete a Quotation from backend database
  const deleteQuotation = async (quoteId) => {
    try {
      await fetch(`${API_BASE_URL}/api/quotations/${quoteId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete quotation from MongoDB:', err);
    }
    setQuotations(prev => prev.filter(q => q.quoteId !== quoteId));
  };

  // JobSheets Sync Helpers
  const syncJobSheetsWithDatabase = async (prev, updated) => {
    if (updated.length > prev.length) {
      const newJS = updated[0];
      try {
        const res = await fetch(`${API_BASE_URL}/api/jobsheets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newJS)
        });
        if (res.ok) {
          const saved = await res.json();
          setJobSheets(current => current.map(item => item.id === newJS.id ? saved : item));
        }
      } catch (e) {
        console.error('Failed to sync added job sheet with MongoDB:', e);
      }
    } else if (updated.length < prev.length) {
      const deleted = prev.find(p => !updated.some(u => u.id === p.id));
      if (deleted) {
        try {
          await fetch(`${API_BASE_URL}/api/jobsheets/${deleted.id}`, { method: 'DELETE' });
        } catch (e) {
          console.error('Failed to sync deleted job sheet with MongoDB:', e);
        }
      }
    } else {
      const edited = updated.find((u, i) => JSON.stringify(u) !== JSON.stringify(prev[i]));
      if (edited) {
        try {
          await fetch(`${API_BASE_URL}/api/jobsheets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(edited)
          });
        } catch (e) {
          console.error('Failed to sync edited job sheet with MongoDB:', e);
        }
      }
    }
  };

  const handleSetJobSheets = (action) => {
    if (typeof action === 'function') {
      setJobSheets(prev => {
        const updated = action(prev);
        syncJobSheetsWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncJobSheetsWithDatabase(jobSheets, action);
      setJobSheets(action);
    }
  };

  // ServiceBills Sync Helpers
  const syncServiceBillsWithDatabase = async (prev, updated) => {
    if (updated.length > prev.length) {
      const newBill = updated[0];
      try {
        const res = await fetch(`${API_BASE_URL}/api/service-bills`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBill)
        });
        if (res.ok) {
          const saved = await res.json();
          setServiceBills(current => current.map(item => item.id === newBill.id ? saved : item));
        }
      } catch (e) {
        console.error('Failed to sync added service bill with MongoDB:', e);
      }
    } else if (updated.length < prev.length) {
      const deleted = prev.find(p => !updated.some(u => u.id === p.id));
      if (deleted) {
        try {
          await fetch(`${API_BASE_URL}/api/service-bills/${deleted.id}`, { method: 'DELETE' });
        } catch (e) {
          console.error('Failed to sync deleted service bill with MongoDB:', e);
        }
      }
    }
  };

  const handleSetServiceBills = (action) => {
    if (typeof action === 'function') {
      setServiceBills(prev => {
        const updated = action(prev);
        syncServiceBillsWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncServiceBillsWithDatabase(serviceBills, action);
      setServiceBills(action);
    }
  };

  // Expenses Sync Helpers
  const syncExpensesWithDatabase = async (prev, updated) => {
    if (updated.length > prev.length) {
      const newExp = updated[0];
      try {
        const res = await fetch(`${API_BASE_URL}/api/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newExp)
        });
        if (res.ok) {
          const saved = await res.json();
          setDailyExpenses(current => current.map(item => item.id === newExp.id ? saved : item));
        }
      } catch (e) {
        console.error('Failed to sync expense with MongoDB:', e);
      }
    } else if (updated.length < prev.length) {
      const deleted = prev.find(p => !updated.some(u => u.id === p.id));
      if (deleted) {
        try {
          await fetch(`${API_BASE_URL}/api/expenses/${deleted.id}`, { method: 'DELETE' });
        } catch (e) {
          console.error('Failed to delete expense from MongoDB:', e);
        }
      }
    }
  };

  const handleSetDailyExpenses = (action) => {
    if (typeof action === 'function') {
      setDailyExpenses(prev => {
        const updated = action(prev);
        syncExpensesWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncExpensesWithDatabase(dailyExpenses, action);
      setDailyExpenses(action);
    }
  };

  // Purchase Invoices Sync Helpers
  const syncPurchasesWithDatabase = async (prev, updated) => {
    if (updated.length > prev.length) {
      const newPur = updated[0];
      try {
        const res = await fetch(`${API_BASE_URL}/api/purchases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPur)
        });
        if (res.ok) {
          const saved = await res.json();
          setPurchaseInvoices(current => current.map(item => item.id === newPur.id ? saved : item));
        }
      } catch (e) {
        console.error('Failed to sync purchase invoice with MongoDB:', e);
      }
    } else if (updated.length < prev.length) {
      const deleted = prev.find(p => !updated.some(u => u.id === p.id));
      if (deleted) {
        try {
          await fetch(`${API_BASE_URL}/api/purchases/${deleted.id}`, { method: 'DELETE' });
        } catch (e) {
          console.error('Failed to delete purchase invoice from MongoDB:', e);
        }
      }
    }
  };

  const handleSetPurchaseInvoices = (action) => {
    if (typeof action === 'function') {
      setPurchaseInvoices(prev => {
        const updated = action(prev);
        syncPurchasesWithDatabase(prev, updated);
        return updated;
      });
    } else {
      syncPurchasesWithDatabase(purchaseInvoices, action);
      setPurchaseInvoices(action);
    }
  };

  // Company Profile Sync Helper
  const handleSetCompanyProfile = async (action) => {
    const updated = typeof action === 'function' ? action(companyProfile) : action;
    setCompanyProfile(updated);
    try {
      await fetch(`${API_BASE_URL}/api/company-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.error('Failed to sync company profile with MongoDB:', e);
    }
  };

  // System Stats for Dashboard Overview
  const [stats, setStats] = useState({
    leadsToday: 8,
    activeServices: 14,
    lowStockCount: 2,
    revenueToday: 42500
  });

  // Recent Activity Feed for Dashboard
  const [activities, setActivities] = useState([
    { id: 1, text: 'Low Stock Alert: Brake Shoe Set Activa 6G (8 remaining)', priority: 'medium', time: '10 mins ago' },
    { id: 2, text: 'Low Stock Alert: Air Filter Honda Shine (3 remaining)', priority: 'high', time: '25 mins ago' },
    { id: 3, text: "New lead 'Sanjay Kumar' registered for Honda Activa 6G", priority: 'low', time: '1 hour ago' },
    { id: 4, text: 'Job Sheet JS-983 marked completed for TN-37-BJ-5120', priority: 'low', time: '2 hours ago' }
  ]);

  // Alert Count Badge
  const [alertCount, setAlertCount] = useState(2);

  // Quick helper to change tabs
  const handleTabChange = (tab, subTab = null) => {
    setActiveTab(tab);
    if (subTab) {
      setActiveSubTab(subTab);
    } else {
      if (tab === 'leads') setActiveSubTab('sale-lead');
      else if (tab === 'service') setActiveSubTab('add-jobsheet');
      else if (tab === 'spares') setActiveSubTab('vehicle-list');
      else if (tab === 'purchase') setActiveSubTab('vehicle-purchase');
      else if (tab === 'accounting') setActiveSubTab('ledger');
      else if (tab === 'management') setActiveSubTab('customers');
      else if (tab === 'profile') setActiveSubTab(null);
      else setActiveSubTab(null);
    }
  };

  // Render placeholder page for options the user will customize later
  const renderPlaceholderSection = () => {
    const formatName = (str) => {
      if (!str) return '';
      return str
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const sectionTitle = formatName(activeSubTab || activeTab);
    const parentTitle = formatName(activeTab);

    return (
      <div className="card" style={{ borderTop: '4px solid #059669', animation: 'fadeIn 0.3s ease' }}>
        <div className="card-header">
          <h3 className="card-title">
            <span style={{ color: '#059669', fontWeight: 700 }}>{sectionTitle}</span>
          </h3>
          <span className="badge badge-success" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
            Ready for Customization
          </span>
        </div>
        <div className="card-body" style={{ textAlign: 'center', padding: '60px 40px' }}>
          {/* Custom Visual Dotted Box indicating layout placeholder */}
          <div style={{
            maxWidth: '550px',
            margin: '0 auto',
            border: '2.5px dashed #10b981',
            borderRadius: '12px',
            padding: '40px 30px',
            backgroundColor: '#fafdfb',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 64, height: 64, color: '#059669' }}>
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
                {parentTitle} &gt; {sectionTitle} Module
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6 }}>
                This option is fully set up in the dashboard shell navigation. You can now build and integrate your custom components directly in this screen.
              </p>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#9ca3af', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', padding: '10px 16px', borderRadius: '8px', fontFamily: 'monospace' }}>
              Modify App.jsx to render your component for this tab.
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onChangeTab={handleTabChange}
      />

      {/* 2. Main Content Wrapper */}
      <div className="main-content">
        {/* Header */}
        <Header
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          onSearchChange={(query) => console.log('Searching:', query)}
          notificationCount={alertCount}
          onAlertClick={() => handleTabChange('management', 'alerts')}
        />

        {/* Dynamic Page body */}
        <main className="page-body">
          {activeTab === 'dashboard' ? (
            <DashboardOverview
              leads={leads}
              companyProfile={companyProfile}
              setCompanyProfile={handleSetCompanyProfile}
              onNavigate={handleTabChange}
            />
          ) : activeTab === 'leads' ? (
            <LeadsManagement
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              leads={leads}
              setLeads={handleSetLeads}
              addCustomer={addCustomer}
              vehicles={vehicles}
              showPreviews={showPreviews}
              invoices={invoices}
              addInvoice={addInvoice}
              deleteInvoice={deleteInvoice}
              quotations={quotations}
              addQuotation={addQuotation}
              deleteQuotation={deleteQuotation}
            />
          ) : activeTab === 'service' ? (
            <VehicleServicePage
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              jobSheets={jobSheets}
              setJobSheets={handleSetJobSheets}
              serviceBills={serviceBills}
              setServiceBills={handleSetServiceBills}
              spares={spares}
              showPreviews={showPreviews}
              customers={customers}
            />
          ) : activeTab === 'management' && activeSubTab === 'settings' ? (
            <SettingsPage
              showPreviews={showPreviews}
              setShowPreviews={setShowPreviews}
            />
          ) : activeTab === 'management' && activeSubTab === 'customers' ? (
            <CustomersPage
              customers={customers}
              setCustomers={handleSetCustomers}
            />
          ) : activeTab === 'spares' && activeSubTab === 'vehicle-list' ? (
            <VehicleListPage
              vehicles={vehicles}
              setVehicles={handleSetVehicles}
            />
          ) : activeTab === 'spares' && activeSubTab === 'spare-inventory' ? (
            <SpareInventoryPage
              spares={spares}
              setSpares={handleSetSpares}
            />
          ) : activeTab === 'purchase' ? (
            <PurchasePage
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              purchaseInvoices={purchaseInvoices}
              setPurchaseInvoices={handleSetPurchaseInvoices}
              spares={spares}
              setSpares={handleSetSpares}
              vehicles={vehicles}
            />
          ) : activeTab === 'accounting' ? (
            <AccountingLedgerPage
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              invoices={invoices}
              serviceBills={serviceBills}
              dailyExpenses={dailyExpenses}
              setDailyExpenses={handleSetDailyExpenses}
              purchaseInvoices={purchaseInvoices}
            />
          ) : activeTab === 'warranty' ? (
            <WarrantyClaimPage
              customers={customers}
              vehicles={vehicles}
              spares={spares}
            />
          ) : activeTab === 'management' && activeSubTab === 'executives' ? (
            <ExecutivesPage />
          ) : activeTab === 'management' && activeSubTab === 'alerts' ? (
            <AlertsPage
              spares={spares}
              jobSheets={jobSheets}
              serviceBills={serviceBills}
              customers={customers}
              leads={leads}
              onNavigate={handleTabChange}
            />
          ) : activeTab === 'management' && activeSubTab === 'birthday' ? (
            <BirthdayWishesPage
              customers={customers}
            />
          ) : activeTab === 'management' && activeSubTab === 'redeem' ? (
            <RedeemPointsPage
              customers={customers}
            />
          ) : activeTab === 'profile' ? (
            <CompanyProfilePage
              companyProfile={companyProfile}
              setCompanyProfile={handleSetCompanyProfile}
            />
          ) : (
            renderPlaceholderSection()
          )}
        </main>
      </div>
    </div>
  );
}
