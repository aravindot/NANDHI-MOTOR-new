import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import LeadsManagement from './components/pages/LeadsManagement';
import CustomersPage from './components/pages/CustomersPage';
import VehicleListPage from './components/pages/VehicleListPage';
import SpareInventoryPage from './components/pages/SpareInventoryPage';
import SettingsPage, { DEFAULT_SERVICE_LABOR_TYPES } from './components/pages/SettingsPage';
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Shared Leads Database with localStorage Persistence
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('nandhi_app_leads');
    return saved ? JSON.parse(saved) : [];
  });

  // Shared Customers Database with localStorage Persistence
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('nandhi_app_customers');
    return saved ? JSON.parse(saved) : [];
  });

  // Shared Spares Database with localStorage Persistence
  const [spares, setSpares] = useState(() => {
    const saved = localStorage.getItem('nandhi_app_spares');
    return saved ? JSON.parse(saved) : [];
  });

  // Shared Invoices Database with localStorage Persistence
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('nandhi_app_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  // Shared Quotations Database with localStorage Persistence
  const [quotations, setQuotations] = useState(() => {
    const saved = localStorage.getItem('nandhi_app_quotations');
    return saved ? JSON.parse(saved) : [];
  });

  // Shared Vehicles Directory with localStorage Persistence
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('nandhi_app_vehicles');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nandhi_app_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_spares', JSON.stringify(spares));
  }, [spares]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_quotations', JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  // Shared Job Sheets Database
  const [jobSheets, setJobSheets] = useState(() => {
    const saved = localStorage.getItem('nandhi_app_jobsheets');
    return saved ? JSON.parse(saved) : [];
  });

  // Shared Service Bills Database
  const [serviceBills, setServiceBills] = useState(() => {
    const saved = localStorage.getItem('nandhi_app_service_bills');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nandhi_app_jobsheets', JSON.stringify(jobSheets));
  }, [jobSheets]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_service_bills', JSON.stringify(serviceBills));
  }, [serviceBills]);

  // Shared Daily Expenses Database
  const [dailyExpenses, setDailyExpenses] = useState(() => {
    const saved = localStorage.getItem('nandhi_app_daily_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // Shared Purchase Invoices Database
  const [purchaseInvoices, setPurchaseInvoices] = useState(() => {
    const saved = localStorage.getItem('nandhi_app_purchase_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('nandhi_app_daily_expenses', JSON.stringify(dailyExpenses));
  }, [dailyExpenses]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_purchase_invoices', JSON.stringify(purchaseInvoices));
  }, [purchaseInvoices]);

  // Shared Preview Configurations for Pages
  const [showPreviews, setShowPreviews] = useState(() => {
    try {
      const saved = localStorage.getItem('nandhi_app_show_previews');
      if (saved === 'false') return false;
      if (saved === 'true') return true;
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  // Shared Company Profile State
  const [companyProfile, setCompanyProfile] = useState(() => {
    const saved = localStorage.getItem('nandhi_app_company_profile');
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
      upiId: 'nandhimotors@hdfcbank',
      quotationTerms: `1. Prices quoted are valid for 7 days from the date of issuance and subject to manufacturer revision.
2. Final delivery is subject to vehicle color and model stock availability.
3. RTO registration, Road Tax & Insurance charges are subject to statutory revisions by Government authorities.
4. Full on-road payment is required prior to vehicle invoicing and registration dispatch.
5. Standard accessories & helmet are supplied per dealership delivery policy.`
    };
  });

  useEffect(() => {
    localStorage.setItem('nandhi_app_company_profile', JSON.stringify(companyProfile));
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem('nandhi_app_show_previews', JSON.stringify(showPreviews));
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

  // Add or Update a Lead in backend database
  const addLead = async (leadPayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      });
      if (res.ok) {
        const saved = await res.json();
        setLeads(prev => {
          const idx = prev.findIndex(l => l.id === saved.id);
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
      console.error('Failed to save lead to MongoDB:', err);
    }
    // Fallback local state
    setLeads(prev => {
      const idx = prev.findIndex(l => l.id === leadPayload.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = leadPayload;
        return next;
      }
      return [leadPayload, ...prev];
    });
    return leadPayload;
  };

  // Update an existing Lead in backend database
  const updateLead = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const saved = await res.json();
        setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...saved } : l)));
        return saved;
      }
    } catch (err) {
      console.error('Failed to update lead in MongoDB:', err);
    }
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updatedFields } : l)));
    return updatedFields;
  };

  // Delete a Lead from backend database
  const deleteLead = async (leadId) => {
    try {
      await fetch(`${API_BASE_URL}/api/leads/${leadId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete lead from MongoDB:', err);
    }
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const handleSetLeads = async (action) => {
    if (typeof action === 'function') {
      setLeads(prev => {
        const updated = action(prev);
        return updated;
      });
    } else {
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
    const invoiceNo = invoicePayload.invoiceNo || String(invoices.reduce((max, inv) => {
      const n = parseInt((inv.invoiceNo || '').replace(/\D/g, ''), 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0) + 1).padStart(2, '0');

    const payload = {
      ...invoicePayload,
      invoiceNo,
      createdOn: invoicePayload.createdOn || new Date().toLocaleDateString('en-IN')
    };

    // Synchronously update local state immediately so UI re-renders without lag
    setInvoices(prev => {
      const idx = prev.findIndex(inv => String(inv.invoiceNo) === String(invoiceNo));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = payload;
        return next;
      }
      return [payload, ...prev];
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setInvoices(prev => prev.map(inv => String(inv.invoiceNo) === String(invoiceNo) ? saved : inv));
        return saved;
      }
    } catch (err) {
      console.error('Failed to save invoice to MongoDB:', err);
    }
    return payload;
  };

  // Delete an Invoice from backend database
  const deleteInvoice = async (invoiceNo) => {
    setInvoices(prev => prev.filter(inv => String(inv.invoiceNo) !== String(invoiceNo)));
    try {
      await fetch(`${API_BASE_URL}/api/invoices/${invoiceNo}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete invoice from MongoDB:', err);
    }
  };

  // Add or Update a Quotation in backend database
  const addQuotation = async (quotePayload) => {
    const quoteId = quotePayload.quoteId || `QT-${String(quotations.reduce((max, q) => {
      const n = parseInt((q.quoteId || '').replace(/\D/g, ''), 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0) + 1).padStart(2, '0')}`;

    const payload = {
      ...quotePayload,
      quoteId,
      createdOn: quotePayload.createdOn || new Date().toLocaleDateString('en-IN')
    };

    // Synchronously update local state immediately
    setQuotations(prev => {
      const idx = prev.findIndex(q => String(q.quoteId) === String(quoteId));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = payload;
        return next;
      }
      return [payload, ...prev];
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setQuotations(prev => prev.map(q => String(q.quoteId) === String(quoteId) ? saved : q));
        return saved;
      }
    } catch (err) {
      console.error('Failed to save quotation to MongoDB:', err);
    }
    return payload;
  };

  // Delete a Quotation from backend database
  const deleteQuotation = async (quoteId) => {
    setQuotations(prev => prev.filter(q => String(q.quoteId) !== String(quoteId)));
    try {
      await fetch(`${API_BASE_URL}/api/quotations/${quoteId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete quotation from MongoDB:', err);
    }
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
    leadsToday: 0,
    activeServices: 0,
    lowStockCount: 0,
    revenueToday: 0
  });

  // Recent Activity Feed for Dashboard
  const [activities, setActivities] = useState([]);

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

  // Dynamic alert count for Header Notification Badge
  const alertCount = React.useMemo(() => {
    const lowStock = spares.filter(s => Number(s.stock || s.qty || 0) <= Number(s.minStock || 5)).length;
    const todayStr = new Date().toISOString().split('T')[0];
    const followupsDue = leads.filter(l => {
      if (l.reminder === 'OFF' || !l.followupDate) return false;
      let compDate = l.followupDate;
      if (l.followupDate.includes('/')) {
        const p = l.followupDate.split('/');
        if (p.length === 3) compDate = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
      }
      return compDate <= todayStr;
    }).length;
    return lowStock + followupsDue;
  }, [spares, leads]);

  return (
    <div className="app-container">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onChangeTab={handleTabChange}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
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
          onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
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
              addLead={addLead}
              updateLead={updateLead}
              deleteLead={deleteLead}
              addCustomer={addCustomer}
              vehicles={vehicles}
              showPreviews={showPreviews}
              invoices={invoices}
              addInvoice={addInvoice}
              deleteInvoice={deleteInvoice}
              quotations={quotations}
              addQuotation={addQuotation}
              deleteQuotation={deleteQuotation}
              companyProfile={companyProfile}
              customers={customers}
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
              companyProfile={{
                ...companyProfile,
                serviceLaborTypes: companyProfile?.serviceLaborTypes?.length > 0 
                  ? companyProfile.serviceLaborTypes 
                  : DEFAULT_SERVICE_LABOR_TYPES
              }}
            />
          ) : activeTab === 'settings' ? (
            <SettingsPage
              showPreviews={showPreviews}
              setShowPreviews={setShowPreviews}
              companyProfile={companyProfile}
              setCompanyProfile={handleSetCompanyProfile}
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
              showPreviews={showPreviews}
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
              showPreviews={showPreviews}
            />
          ) : activeTab === 'accounting' ? (
            <AccountingLedgerPage
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              invoices={invoices}
              setInvoices={setInvoices}
              addInvoice={addInvoice}
              serviceBills={serviceBills}
              setServiceBills={handleSetServiceBills}
              jobSheets={jobSheets}
              setJobSheets={handleSetJobSheets}
              dailyExpenses={dailyExpenses}
              setDailyExpenses={handleSetDailyExpenses}
              purchaseInvoices={purchaseInvoices}
              setPurchaseInvoices={handleSetPurchaseInvoices}
              spares={spares}
              vehicles={vehicles}
              customers={customers}
              companyProfile={companyProfile}
              onNavigate={handleTabChange}
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
              updateLead={updateLead}
              setLeads={handleSetLeads}
              onNavigate={handleTabChange}
            />
          ) : activeTab === 'management' && activeSubTab === 'birthday' ? (
            <BirthdayWishesPage
              customers={customers}
              invoices={invoices}
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
