import React, { useState, useMemo, useEffect } from 'react';
import {
  Cake,
  Calendar,
  Gift,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  Check,
  Search,
  CheckCircle,
  Copy,
  Bike,
  User,
  PartyPopper
} from 'lucide-react';

export default function BirthdayWishesPage({ customers = [], invoices = [] }) {
  const [activeType, setActiveType] = useState('Birthday'); // 'Birthday' or 'Anniversary'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadedEvents = [];
    
    // Parse Invoices for Birthdays and Anniversaries
    if (invoices && invoices.length > 0) {
      invoices.forEach((inv, index) => {
        // Birthdays
        if (inv.customerBirthday) {
          loadedEvents.push({
            id: `bday-${inv.invoiceNo || index}`,
            type: 'Birthday',
            date: inv.customerBirthday, // YYYY-MM-DD
            customerName: inv.customerName || 'Unknown',
            mobile: inv.customerPhone || inv.customerMobile || '',
            vehicleRegNo: inv.vehicleModel || '',
            discountCode: 'BDAY15'
          });
        }
        
        // Anniversaries
        if (inv.invoiceDate || inv.createdOn) {
          const dateStr = inv.invoiceDate || inv.createdOn; // Usually YYYY-MM-DD or DD/MM/YYYY
          // Only process if it's in YYYY-MM-DD format for simple demo
          if (dateStr.includes('-')) {
             loadedEvents.push({
                id: `anni-${inv.invoiceNo || index}`,
                type: 'Anniversary',
                date: dateStr,
                customerName: inv.customerName || 'Unknown',
                mobile: inv.customerPhone || inv.customerMobile || '',
                vehicleRegNo: inv.vehicleModel || '',
                discountCode: 'ANNI10'
             });
          }
        }
      });
    }
    
    setEvents(loadedEvents);
  }, [invoices]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchType = activeType === 'ALL' || e.type === activeType;
      const matchSearch =
        e.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.mobile.includes(searchQuery);
      return matchType && matchSearch;
    });
  }, [events, activeType, searchQuery]);

  const activeEvent =
    events.find((e) => e.id === selectedEventId && (activeType === 'ALL' || e.type === activeType)) ||
    (filteredEvents.length > 0 ? filteredEvents[0] : null);

  const generateMessage = (item) => {
    if (!item) return '';
    if (item.type === 'Birthday') {
      return `Dear ${item.customerName}, Happy Birthday from Nandhi Motors! 🎉🎂 Wishing you joy and happy rides. As a special birthday gift, enjoy 15% OFF on your next vehicle service using coupon code ${item.discountCode}. Valid for this month! 🏍️✨`;
    } else {
      return `Dear ${item.customerName}, Happy Vehicle Purchase Anniversary from Nandhi Motors! 🎊 Celebrating happy miles on your vehicle (${item.vehicleRegNo}). Enjoy 10% OFF on General Service & Water Wash with coupon ${item.discountCode}. Drive safe! 🛵✨`;
    }
  };

  const handleSendWhatsApp = (item) => {
    if (!item) return;
    const text = encodeURIComponent(generateMessage(item));
    const cleanMobile = item.mobile.replace(/\D/g, '');
    const fullMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    window.open(`https://wa.me/${fullMobile}?text=${text}`, '_blank');

    setEvents((prev) => prev.map((e) => (e.id === item.id ? { ...e, sentWish: true } : e)));
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const bdayCount = events.filter((e) => e.type === 'Birthday').length;
  const anniCount = events.filter((e) => e.type === 'Anniversary').length;

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Sub Tabs */}
      <div className="sub-tabs-container">
        <span
          className={`sub-tab ${activeType === 'Birthday' ? 'active' : ''}`}
          onClick={() => setActiveType('Birthday')}
        >
          <Cake size={14} style={{ marginRight: '6px' }} /> Customer Birthdays
        </span>
        <span
          className={`sub-tab ${activeType === 'Anniversary' ? 'active' : ''}`}
          onClick={() => setActiveType('Anniversary')}
        >
          <Gift size={14} style={{ marginRight: '6px' }} /> Purchase Anniversaries
        </span>
        <span
          className={`sub-tab ${activeType === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveType('ALL')}
        >
          <Sparkles size={14} style={{ marginRight: '6px' }} /> All Occasions
        </span>
      </div>

      {/* 2-Column Master-Detail Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '24px'
        }}
      >
        {/* LEFT COLUMN: Occasions Ledger */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="card-title">
              <PartyPopper size={18} style={{ color: '#059669' }} /> Customer Occasions Ledger
            </h3>
            <div className="quick-search">
              <Search size={14} className="quick-search-icon" />
              <input
                type="text"
                placeholder="Search name / bike..."
                style={{ width: '160px', padding: '6px 10px 6px 28px', fontSize: '0.78rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="card-body" style={{ maxHeight: '720px', overflowY: 'auto', padding: '12px' }}>
            {/* Top Metric Summary Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                backgroundColor: '#f9fafb',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                marginBottom: '10px',
                textAlign: 'center'
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Occasions</span>
                <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{events.length}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>🎂 Birthdays</span>
                <strong style={{ fontSize: '0.9rem', color: '#059669' }}>{bdayCount}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>🎁 Anniversaries</span>
                <strong style={{ fontSize: '0.9rem', color: '#3b82f6' }}>{anniCount}</strong>
              </div>
            </div>

            {/* Event List Items */}
            {filteredEvents && filteredEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredEvents.map((evt) => {
                  const isSelected = activeEvent && activeEvent.id === evt.id;

                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEventId(evt.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #059669' : '1px solid #e5e7eb',
                        backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 4px rgba(5, 150, 105, 0.1)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.1rem' }}>{evt.type === 'Birthday' ? '🎂' : '🛵'}</span>
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#1f2937' }}>{evt.customerName}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#6b7280', marginLeft: '6px' }}>#{evt.id}</span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: evt.sentWish ? '#ecfdf5' : '#fffbeb',
                            color: evt.sentWish ? '#059669' : '#d97706',
                            border: '1px solid',
                            borderColor: evt.sentWish ? '#bbf7d0' : '#fde68a'
                          }}
                        >
                          {evt.sentWish ? '✓ Wish Sent' : 'Pending Wish'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#6b7280', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={11} color="#059669" /> {evt.mobile}
                        </span>
                        <span style={{ color: '#059669', fontWeight: 500 }}>{evt.vehicleModel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Gift size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '0.82rem' }}>No occasions match your criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WhatsApp Greetings Card Preview */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <Gift size={18} style={{ color: '#059669' }} /> WhatsApp Greeting Card
            </h3>
            {activeEvent && (
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                Occasion #{activeEvent.id}
              </span>
            )}
          </div>

          <div className="card-body">
            {activeEvent ? (
              <div className="invoice-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: '12px' }}>
                  <div>
                    <div className="invoice-title" style={{ textAlign: 'left', margin: 0, fontSize: '1.25rem' }}>NANDHI MOTORS</div>
                    <p style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, margin: '2px 0 0' }}>
                      Customer Relationship & Milestone Greeting Card
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: activeEvent.type === 'Birthday' ? '#ec4899' : '#059669',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                    >
                      {activeEvent.type === 'Birthday' ? '🎂 BIRTHDAY EVENT' : '🛵 BIKE ANNIVERSARY'}
                    </span>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="invoice-grid-2" style={{ marginTop: '16px' }}>
                  <div>
                    <div className="section-title">Customer Particulars</div>
                    <p><strong>Name:</strong> {activeEvent.customerName}</p>
                    <p>
                      <strong>Mobile:</strong>{' '}
                      <a href={`tel:${activeEvent.mobile}`} style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                        {activeEvent.mobile}
                      </a>
                    </p>
                    <p><strong>Vehicle:</strong> {activeEvent.vehicleModel}</p>
                    <p><strong>Reg No:</strong> {activeEvent.vehicleRegNo}</p>
                  </div>

                  <div>
                    <div className="section-title">Milestone Offer</div>
                    <p><strong>Occasion:</strong> {activeEvent.type}</p>
                    <p><strong>Coupon Code:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#059669' }}>{activeEvent.discountCode}</span></p>
                    <p><strong>Discount Offer:</strong> {activeEvent.type === 'Birthday' ? '15% OFF Service' : '10% OFF Service'}</p>
                    <p><strong>Validity:</strong> 30 Days</p>
                  </div>
                </div>

                {/* WhatsApp Message Preview Bubble */}
                <div
                  style={{
                    margin: '16px 0',
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: '#dcf8c6',
                    border: '1px solid #b2dfdb',
                    fontSize: '0.84rem',
                    color: '#111827',
                    lineHeight: 1.6,
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>
                    📱 WhatsApp Message Template:
                  </div>
                  {generateMessage(activeEvent)}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                    onClick={() => handleSendWhatsApp(activeEvent)}
                  >
                    <Send size={14} /> Send WhatsApp Greeting
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px' }}
                    onClick={() => handleCopyCode(activeEvent.discountCode, activeEvent.id)}
                  >
                    {copiedId === activeEvent.id ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    {copiedId === activeEvent.id ? 'Copied Code!' : 'Copy Code'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Gift size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p>Select a customer event from the ledger on the left to preview message.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
