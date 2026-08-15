import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  ShieldCheck,
  ShoppingCart,
  BookOpen,
  Settings,
  Building2,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, activeSubTab, onChangeTab, isOpen, onClose }) {
  // Keep track of which sections are collapsed
  const [expandedSections, setExpandedSections] = useState({
    leads: true,
    service: true,
    spares: true,
    purchase: true,
    accounting: true,
    management: true
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTabClick = (tab, subTab = null) => {
    onChangeTab(tab, subTab);
    if (onClose && typeof window !== 'undefined' && window.innerWidth <= 1024) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          {/* Car/Bike Service SVG Logo */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28, flexShrink: 0 }}>
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
          </svg>
          <h1>NANDHI MOTORS</h1>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            <X size={20} />
          </button>
        </div>

      <div className="sidebar-menu">
        {/* Dashboard Option */}
        <div className="menu-item-container">
          <div
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabClick('dashboard')}
          >
            <span className="menu-item-icon">
              <LayoutDashboard size={18} />
            </span>
            <span>Dashboard</span>
          </div>
        </div>

        {/* 1. Leads Management */}
        <div className="menu-item-container">
          <div
            className={`menu-item ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => {
              toggleSection('leads');
              handleTabClick('leads');
            }}
          >
            <span className="menu-item-icon">
              <Users size={18} />
            </span>
            <span>Leads Management</span>
            <span className="menu-chevron">
              {expandedSections.leads ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </div>
          {expandedSections.leads && (
            <div className="submenu-list">
              <div
                className={`submenu-item ${activeTab === 'leads' && activeSubTab === 'sale-lead' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('leads', 'sale-lead');
                }}
              >
                Sale Lead
              </div>
              <div
                className={`submenu-item ${activeTab === 'leads' && activeSubTab === 'quotation' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('leads', 'quotation');
                }}
              >
                Quotation
              </div>
              <div
                className={`submenu-item ${activeTab === 'leads' && activeSubTab === 'invoice' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('leads', 'invoice');
                }}
              >
                Invoice
              </div>
              <div
                className={`submenu-item ${activeTab === 'leads' && activeSubTab === 'booking' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('leads', 'booking');
                }}
              >
                Booking
              </div>
            </div>
          )}
        </div>

        {/* 2. Vehicle Service */}
        <div className="menu-item-container">
          <div
            className={`menu-item ${activeTab === 'service' ? 'active' : ''}`}
            onClick={() => {
              toggleSection('service');
              handleTabClick('service');
            }}
          >
            <span className="menu-item-icon">
              <Wrench size={18} />
            </span>
            <span>Vehicle Service</span>
            <span className="menu-chevron">
              {expandedSections.service ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </div>
          {expandedSections.service && (
            <div className="submenu-list">
              <div
                className={`submenu-item ${activeTab === 'service' && activeSubTab === 'add-jobsheet' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('service', 'add-jobsheet');
                }}
              >
                Add Job Sheet
              </div>
              <div
                className={`submenu-item ${activeTab === 'service' && activeSubTab === 'service-billing' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('service', 'service-billing');
                }}
              >
                Service Billing
              </div>
              <div
                className={`submenu-item ${activeTab === 'service' && activeSubTab === 'service-history' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('service', 'service-history');
                }}
              >
                Service History
              </div>
            </div>
          )}
        </div>

        {/* 3. Spare Management */}
        <div className="menu-item-container">
          <div
            className={`menu-item ${activeTab === 'spares' ? 'active' : ''}`}
            onClick={() => {
              toggleSection('spares');
              handleTabClick('spares');
            }}
          >
            <span className="menu-item-icon">
              <Package size={18} />
            </span>
            <span>Spare Management</span>
            <span className="menu-chevron">
              {expandedSections.spares ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </div>
          {expandedSections.spares && (
            <div className="submenu-list">
              <div
                className={`submenu-item ${activeTab === 'spares' && activeSubTab === 'vehicle-list' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('spares', 'vehicle-list');
                }}
              >
                Vehicle List
              </div>
              <div
                className={`submenu-item ${activeTab === 'spares' && activeSubTab === 'spare-inventory' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('spares', 'spare-inventory');
                }}
              >
                Spare Inventory
              </div>
            </div>
          )}
        </div>

        {/* 4. Warranty Claim */}
        <div className="menu-item-container">
          <div
            className={`menu-item ${activeTab === 'warranty' ? 'active' : ''}`}
            onClick={() => handleTabClick('warranty')}
          >
            <span className="menu-item-icon">
              <ShieldCheck size={18} />
            </span>
            <span>Warranty Claim</span>
          </div>
        </div>

        {/* 5. Purchase Invoice */}
        <div className="menu-item-container">
          <div
            className={`menu-item ${activeTab === 'purchase' ? 'active' : ''}`}
            onClick={() => {
              toggleSection('purchase');
              handleTabClick('purchase');
            }}
          >
            <span className="menu-item-icon">
              <ShoppingCart size={18} />
            </span>
            <span>Purchase Invoice</span>
            <span className="menu-chevron">
              {expandedSections.purchase ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </div>
          {expandedSections.purchase && (
            <div className="submenu-list">
              <div
                className={`submenu-item ${activeTab === 'purchase' && activeSubTab === 'vehicle-purchase' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('purchase', 'vehicle-purchase');
                }}
              >
                Vehicle Purchase
              </div>
              <div
                className={`submenu-item ${activeTab === 'purchase' && activeSubTab === 'spare-purchase' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('purchase', 'spare-purchase');
                }}
              >
                Spare Purchase
              </div>
            </div>
          )}
        </div>

        {/* 6. Accounting */}
        <div className="menu-item-container">
          <div
            className={`menu-item ${activeTab === 'accounting' ? 'active' : ''}`}
            onClick={() => {
              toggleSection('accounting');
              handleTabClick('accounting');
            }}
          >
            <span className="menu-item-icon">
              <BookOpen size={18} />
            </span>
            <span>Accounting</span>
            <span className="menu-chevron">
              {expandedSections.accounting ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </div>
          {expandedSections.accounting && (
            <div className="submenu-list">
              <div
                className={`submenu-item ${activeTab === 'accounting' && activeSubTab === 'ledger' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('accounting', 'ledger');
                }}
              >
                Ledger
              </div>
              <div
                className={`submenu-item ${activeTab === 'accounting' && activeSubTab === 'daily-expenses' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('accounting', 'daily-expenses');
                }}
              >
                Daily Expenses
              </div>
              <div
                className={`submenu-item ${activeTab === 'accounting' && activeSubTab === 'gst-reports' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('accounting', 'gst-reports');
                }}
              >
                GST Reports
              </div>
            </div>
          )}
        </div>

        {/* 7. Management */}
        <div className="menu-item-container">
          <div
            className={`menu-item ${activeTab === 'management' ? 'active' : ''}`}
            onClick={() => {
              toggleSection('management');
              handleTabClick('management');
            }}
          >
            <span className="menu-item-icon">
              <Settings size={18} />
            </span>
            <span>Management</span>
            <span className="menu-chevron">
              {expandedSections.management ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </div>
          {expandedSections.management && (
            <div className="submenu-list">
              <div
                className={`submenu-item ${activeTab === 'management' && activeSubTab === 'customers' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('management', 'customers');
                }}
              >
                Customers
              </div>
              <div
                className={`submenu-item ${activeTab === 'management' && activeSubTab === 'executives' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('management', 'executives');
                }}
              >
                Executives
              </div>
              <div
                className={`submenu-item ${activeTab === 'management' && activeSubTab === 'alerts' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('management', 'alerts');
                }}
              >
                Alerts
              </div>
              <div
                className={`submenu-item ${activeTab === 'management' && activeSubTab === 'birthday' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('management', 'birthday');
                }}
              >
                Birthday
              </div>
              <div
                className={`submenu-item ${activeTab === 'management' && activeSubTab === 'redeem' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('management', 'redeem');
                }}
              >
                Redeem
              </div>
              <div
                className={`submenu-item ${activeTab === 'management' && activeSubTab === 'settings' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabClick('management', 'settings');
                }}
              >
                Settings
              </div>
            </div>
          )}
        </div>

        {/* 8. Company Profile */}
        <div className="menu-item-container">
          <div
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabClick('profile')}
          >
            <span className="menu-item-icon">
              <Building2 size={18} />
            </span>
            <span>Company Profile</span>
          </div>
        </div>
      </div>
    </aside>
  </>
  );
}
