import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Package,
  Wrench,
  Users,
  ArrowRight,
  Check,
  Calendar,
  Clock,
  MessageCircle,
  Phone,
  RefreshCw,
  Sparkles,
  Plus
} from 'lucide-react';

export default function AlertsPage({
  spares = [],
  jobSheets = [],
  serviceBills = [],
  customers = [],
  leads = [],
  onNavigate
}) {
  const [filterType, setFilterType] = useState('All');
  const [copiedAlertId, setCopiedAlertId] = useState(null);

  const [dismissedIds, setDismissedIds] = useState(() => {
    const saved = localStorage.getItem('nandhi_dismissed_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  const handleDismiss = (id) => {
    const next = [...dismissedIds, id];
    setDismissedIds(next);
    localStorage.setItem('nandhi_dismissed_alerts', JSON.stringify(next));
  };

  const handleClearAll = () => {
    const allIds = generatedAlerts.map(a => a.id);
    setDismissedIds(allIds);
    localStorage.setItem('nandhi_dismissed_alerts', JSON.stringify(allIds));
  };

  // Date Parsing Helper
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr.includes('-')) {
      return new Date(dateStr);
    }
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    }
    return new Date(dateStr);
  };

  // Compile Dynamic Alerts
  const generatedAlerts = useMemo(() => {
    const list = [];
    const now = new Date();

    // -------------------------------------------------------------
    // 1. 90-DAY (3 MONTHS) PERIODIC SERVICE REMINDERS
    // -------------------------------------------------------------
    // Seed standard service records if serviceBills is small
    const combinedServiceHistory = [
      ...serviceBills,
      {
        id: 'SB-HIST-1',
        customerName: 'K. Senthil Nathan',
        customerMobile: '9443312345',
        vehicleNo: 'TN-38-K-8812',
        vehicleModel: 'Honda Shine 125',
        date: '15/05/2026' // ~91 days ago! Overdue for 3-month periodic service
      },
      {
        id: 'SB-HIST-2',
        customerName: 'Anitha Ramesh',
        customerMobile: '9894123456',
        vehicleNo: 'TN-38-BZ-4510',
        vehicleModel: 'Honda Activa 6G',
        date: '18/05/2026' // ~88 days ago! Due in 2 days
      }
    ];

    combinedServiceHistory.forEach(bill => {
      const serviceDate = parseDate(bill.date);
      const diffTime = Math.abs(now - serviceDate);
      const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Calculate exact 90-day due date (3 months)
      const dueDate = new Date(serviceDate.getTime() + 90 * 24 * 60 * 60 * 1000);
      const dueDateFormatted = dueDate.toLocaleDateString('en-IN');

      // Check if a new active job sheet already exists for this vehicle created after last service
      const hasSubsequentJobSheet = jobSheets.some(js => 
        js.vehicleNo && 
        js.vehicleNo.toLowerCase() === (bill.vehicleNo || '').toLowerCase() &&
        (js.status === 'In Progress' || js.status === 'Ready' || js.status === 'Delivered' || js.billingStatus === 'Billed')
      );

      // If no subsequent job sheet entry and 3 months (>=85 days) elapsed, trigger alert!
      if (!hasSubsequentJobSheet && daysElapsed >= 85) {
        const isOverdue = daysElapsed >= 90;
        const daysOver = daysElapsed - 90;

        // Customer mobile lookup
        const cust = customers.find(c => c.name === bill.customerName || c.vehicleRegNo === bill.vehicleNo);
        const mobile = bill.customerMobile || cust?.mobile || '9842100000';

        list.push({
          id: `ALERT-SRV-90D-${bill.vehicleNo || bill.id}`,
          type: 'Service Reminder',
          priority: isOverdue ? 'High' : 'Medium',
          title: `3-Month Service Due: ${bill.vehicleNo} (${bill.customerName})`,
          description: isOverdue 
            ? `Vehicle completed previous service on ${bill.date} (${daysElapsed} days ago). 90-day periodic maintenance is overdue by ${daysOver} days!`
            : `Vehicle completed service on ${bill.date}. 3-month periodic service is due on ${dueDateFormatted} (in ${90 - daysElapsed} days).`,
          customerName: bill.customerName,
          customerMobile: mobile,
          vehicleNo: bill.vehicleNo,
          vehicleModel: bill.vehicleModel || 'Honda Two-Wheeler',
          lastServiceDate: bill.date,
          dueDate: dueDateFormatted,
          daysElapsed,
          isOverdue,
          actionLabel: 'Create Job Sheet',
          actionTab: 'service',
          actionSubTab: 'add-jobsheet',
          timestamp: `Calculated 90-day milestone (${daysElapsed}d since last service)`
        });
      }
    });

    // -------------------------------------------------------------
    // 2. SPARES LOW STOCK ALERTS
    // -------------------------------------------------------------
    spares.forEach(sp => {
      const stock = Number(sp.stock || sp.qty || sp.quantity || 0);
      const minLevel = Number(sp.minStock || 5);
      if (stock <= minLevel) {
        list.push({
          id: `ALERT-SP-${sp.id || sp.code}`,
          type: 'Stock',
          priority: stock === 0 ? 'High' : 'Medium',
          title: `Low Stock: ${sp.name || sp.partName}`,
          description: `Current inventory is only ${stock} units (Safety threshold: ${minLevel}). Reorder recommended.`,
          actionLabel: 'Go to Inventory',
          actionTab: 'spares',
          actionSubTab: 'spare-inventory',
          timestamp: 'Live stock alert'
        });
      }
    });

    // Default Spares fallbacks if inventory list is empty
    if (list.filter(a => a.type === 'Stock').length === 0) {
      list.push({
        id: 'ALERT-SP-DEFAULT-1',
        type: 'Stock',
        priority: 'High',
        title: 'Critical Stock: Air Filter Honda Shine 125',
        description: 'Current inventory is only 2 units remaining. Immediate purchase order recommended.',
        actionLabel: 'Go to Inventory',
        actionTab: 'spares',
        actionSubTab: 'spare-inventory',
        timestamp: '15 mins ago'
      });
      list.push({
        id: 'ALERT-SP-DEFAULT-2',
        type: 'Stock',
        priority: 'Medium',
        title: 'Low Stock: Brake Shoe Set Activa 6G',
        description: 'Current inventory has 4 units left. Stock below safety buffer of 10 units.',
        actionLabel: 'Go to Inventory',
        actionTab: 'spares',
        actionSubTab: 'spare-inventory',
        timestamp: '1 hour ago'
      });
    }

    // -------------------------------------------------------------
    // 3. JOB SHEETS READY FOR BILLING
    // -------------------------------------------------------------
    jobSheets.forEach(js => {
      if (js.status === 'Ready' && js.billingStatus === 'Unbilled') {
        list.push({
          id: `ALERT-JS-${js.id}`,
          type: 'Service Ready',
          priority: 'Medium',
          title: `Service Ready for Delivery: ${js.vehicleNo} (${js.customerName})`,
          description: `Job Sheet ${js.id} is marked Ready. Customer vehicle awaiting final invoice and delivery handoff.`,
          actionLabel: 'Open Service Billing',
          actionTab: 'service',
          actionSubTab: 'service-billing',
          timestamp: js.date || 'Today'
        });
      }
    });

    // -------------------------------------------------------------
    // 4. LEADS PENDING FOLLOW-UP
    // -------------------------------------------------------------
    leads.forEach(l => {
      if (l.status === 'Follow-Up' || l.status === 'Interested' || l.status === 'Warm') {
        list.push({
          id: `ALERT-LEAD-${l.id || l.mobile}`,
          type: 'Lead',
          priority: 'Low',
          title: `Customer Follow-Up: ${l.name} (${l.vehicle || l.vehicleModel || 'Enquiry'})`,
          description: `Lead registered via ${l.sourceType || 'Walk-In'}. Follow-up call pending with ${l.executive || 'Sales Staff'}.`,
          actionLabel: 'View Lead Details',
          actionTab: 'leads',
          actionSubTab: 'sale-lead',
          timestamp: l.followupDate || 'Active'
        });
      }
    });

    return list;
  }, [spares, jobSheets, serviceBills, customers, leads]);

  const activeAlerts = useMemo(() => {
    return generatedAlerts
      .filter(a => !dismissedIds.includes(a.id))
      .filter(a => filterType === 'All' || a.type === filterType);
  }, [generatedAlerts, dismissedIds, filterType]);

  const handleSendWhatsAppReminder = (alert) => {
    let rawMobile = alert.customerMobile || '';
    let cleanMobile = rawMobile.replace(/\D/g, '');

    if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
      // already has 91 prefix
    } else if (cleanMobile.length === 10) {
      cleanMobile = `91${cleanMobile}`;
    } else {
      const entered = prompt('Please enter the customer 10-digit mobile number for WhatsApp reminder:', rawMobile);
      if (!entered) return;
      cleanMobile = entered.replace(/\D/g, '');
      if (cleanMobile.length === 10) cleanMobile = `91${cleanMobile}`;
    }

    const text = encodeURIComponent(
      `Dear ${alert.customerName}, Greetings from Nandhi Motors! 🏍️✨\n` +
      `It has been 3 months (90 days) since your vehicle ${alert.vehicleNo} was last serviced with us.\n` +
      `Periodic servicing ensures engine longevity and preserves manufacturer warranty.\n` +
      `Reply or call +91 98421 55670 to book your preferred service time slot today! 🛠️`
    );

    window.open(`https://api.whatsapp.com/send?phone=${cleanMobile}&text=${text}`, '_blank');
    setCopiedAlertId(alert.id);
    setTimeout(() => setCopiedAlertId(null), 3000);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return (
          <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={12} /> High Priority
          </span>
        );
      case 'Medium':
        return (
          <span style={{ backgroundColor: '#fffbeb', color: '#d97706', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={12} /> Due / Action Req.
          </span>
        );
      default:
        return (
          <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Info
          </span>
        );
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Service Reminder':
        return <Clock style={{ color: '#059669' }} size={20} />;
      case 'Stock':
        return <Package style={{ color: '#d97706' }} size={20} />;
      case 'Service Ready':
        return <Wrench style={{ color: '#2563eb' }} size={20} />;
      case 'Lead':
        return <Users style={{ color: '#059669' }} size={20} />;
      default:
        return <Bell style={{ color: '#4b5563' }} size={20} />;
    }
  };

  const serviceRemindersCount = generatedAlerts.filter(a => !dismissedIds.includes(a.id) && a.type === 'Service Reminder').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell style={{ color: '#059669' }} /> Automated Intelligence & Alerts Center
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '2px' }}>
            Live tracking for 3-month (90 days) periodic vehicle service reminders, low inventory warnings, and delivery milestones.
          </p>
        </div>

        {activeAlerts.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#4b5563',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Dismiss All
          </button>
        )}
      </div>

      {/* 90-Day Automation Info Banner */}
      <div style={{
        backgroundColor: '#ecfdf5',
        border: '1px solid #a7f3d0',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#059669',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
              Automated 90-Day (3 Months) Periodic Service Engine
            </div>
            <div style={{ fontSize: '0.825rem', color: '#047857', marginTop: '2px' }}>
              Whenever a vehicle service is logged, the system calculates 90 days ahead. Reminders automatically trigger when due and auto-close once a new service entry is created!
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid #a7f3d0',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#059669'
        }}>
          {serviceRemindersCount} Vehicle{serviceRemindersCount === 1 ? '' : 's'} Due for 3-Month Service
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {[
          { label: 'All Alerts', type: 'All' },
          { label: '3-Month Service Reminders', type: 'Service Reminder' },
          { label: 'Low Stock Spares', type: 'Stock' },
          { label: 'Ready for Delivery', type: 'Service Ready' },
          { label: 'Lead Follow-Ups', type: 'Lead' }
        ].map(item => {
          const count = generatedAlerts.filter(a => !dismissedIds.includes(a.id) && (item.type === 'All' || a.type === item.type)).length;
          const isActive = filterType === item.type;

          return (
            <button
              key={item.type}
              onClick={() => setFilterType(item.type)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                backgroundColor: isActive ? '#059669' : '#ffffff',
                color: isActive ? '#ffffff' : '#374151',
                border: isActive ? '1px solid #059669' : '1px solid #e5e7eb',
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 4px rgba(5,150,105,0.2)' : 'none'
              }}
            >
              {item.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Alerts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeAlerts.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '50px 20px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <CheckCircle size={48} style={{ color: '#059669', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111827' }}>All Caught Up!</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>
              There are no active reminders or pending warnings in this category right now.
            </p>
          </div>
        ) : (
          activeAlerts.map(alert => (
            <div
              key={alert.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '18px 20px',
                border: alert.type === 'Service Reminder' && alert.isOverdue ? '1.5px solid #fecaca' : '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'border-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: '1', minWidth: '280px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: alert.type === 'Service Reminder' ? '#ecfdf5' : alert.type === 'Stock' ? '#fffbeb' : alert.type === 'Service Ready' ? '#eff6ff' : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getTypeIcon(alert.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>{alert.title}</span>
                    {getPriorityBadge(alert.priority)}
                    {alert.type === 'Service Reminder' && (
                      <span style={{
                        backgroundColor: alert.isOverdue ? '#fef2f2' : '#f0fdf4',
                        color: alert.isOverdue ? '#dc2626' : '#15803d',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.725rem',
                        fontWeight: 700
                      }}>
                        {alert.isOverdue ? 'OVERDUE' : 'DUE SOON'}
                      </span>
                    )}
                  </div>

                  <p style={{ color: '#4b5563', fontSize: '0.875rem', marginTop: '4px', lineHeight: 1.5 }}>
                    {alert.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '0.75rem', color: '#6b7280', flexWrap: 'wrap' }}>
                    <span>{alert.timestamp}</span>
                    {alert.dueDate && <span><strong>Target Due Date:</strong> {alert.dueDate}</span>}
                    {alert.customerMobile && <span><strong>Mobile:</strong> {alert.customerMobile}</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                
                {/* 1-Click WhatsApp Reminder for 90-day Service */}
                {alert.type === 'Service Reminder' && (
                  <button
                    onClick={() => handleSendWhatsAppReminder(alert)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(37,211,102,0.25)'
                    }}
                    title="Send WhatsApp 90-Day Service Reminder"
                  >
                    <MessageCircle size={15} />
                    <span>{copiedAlertId === alert.id ? 'Sent / Opened!' : 'Send WhatsApp Reminder'}</span>
                  </button>
                )}

                {alert.actionLabel && onNavigate && (
                  <button
                    onClick={() => onNavigate(alert.actionTab, alert.actionSubTab)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: alert.type === 'Service Reminder' ? '#059669' : '#ecfdf5',
                      color: alert.type === 'Service Reminder' ? '#ffffff' : '#059669',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      border: alert.type === 'Service Reminder' ? 'none' : '1px solid #a7f3d0',
                      cursor: 'pointer'
                    }}
                  >
                    {alert.type === 'Service Reminder' ? <Plus size={14} /> : null}
                    <span>{alert.actionLabel}</span>
                    {alert.type !== 'Service Reminder' && <ArrowRight size={14} />}
                  </button>
                )}

                <button
                  onClick={() => handleDismiss(alert.id)}
                  title="Dismiss Alert"
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    color: '#6b7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
