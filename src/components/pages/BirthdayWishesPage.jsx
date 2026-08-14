import React, { useState, useMemo } from 'react';
import { Cake, Calendar, Gift, MessageCircle, Phone, Send, Sparkles, Check, Search } from 'lucide-react';

export default function BirthdayWishesPage({
  customers = []
}) {
  const [activeType, setActiveType] = useState('Birthday'); // 'Birthday' or 'Anniversary'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Mock list merged with existing customers
  const [events, setEvents] = useState(() => {
    return [
      {
        id: 'EVT-1',
        customerName: 'Rajesh Kumar',
        mobile: '9842155670',
        vehicleModel: 'Honda Activa 6G',
        vehicleRegNo: 'TN-37-BJ-5120',
        dob: '1988-08-14', // Today's date!
        deliveryDate: '2024-08-14',
        type: 'Birthday',
        discountCode: 'BDAY15-RAJESH',
        sentWish: false
      },
      {
        id: 'EVT-2',
        customerName: 'K. Senthil Nathan',
        mobile: '9443312345',
        vehicleModel: 'Honda Shine 125',
        vehicleRegNo: 'TN-38-K-8812',
        dob: '1992-08-15', // Tomorrow
        deliveryDate: '2023-08-15',
        type: 'Birthday',
        discountCode: 'BDAY15-SENTHIL',
        sentWish: false
      },
      {
        id: 'EVT-3',
        customerName: 'P. Murugan',
        mobile: '9842567890',
        vehicleModel: 'Honda SP 125',
        vehicleRegNo: 'TN-45-AS-9821',
        dob: '1985-08-18',
        deliveryDate: '2025-08-14', // 1st Year Bike Anniversary Today!
        type: 'Anniversary',
        discountCode: 'ANNI10-MURUGAN',
        sentWish: false
      },
      {
        id: 'EVT-4',
        customerName: 'Deepak Sharma',
        mobile: '9443219800',
        vehicleModel: 'Honda Dio 125',
        vehicleRegNo: 'TN-37-CD-3321',
        dob: '1990-08-20',
        deliveryDate: '2024-08-20',
        type: 'Anniversary',
        discountCode: 'ANNI10-DEEPAK',
        sentWish: false
      },
      {
        id: 'EVT-5',
        customerName: 'Anitha Ramesh',
        mobile: '9894123456',
        vehicleModel: 'Honda Activa 6G',
        vehicleRegNo: 'TN-38-BZ-4510',
        dob: '1995-08-25',
        deliveryDate: '2023-08-25',
        type: 'Birthday',
        discountCode: 'BDAY15-ANITHA',
        sentWish: false
      }
    ];
  });

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchType = e.type === activeType;
      const matchSearch =
        e.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.mobile.includes(searchQuery) ||
        e.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [events, activeType, searchQuery]);

  const generateMessage = (item) => {
    if (item.type === 'Birthday') {
      return `Dear ${item.customerName}, Happy Birthday from Nandhi Motors! 🎉🎂 Wishing you joy and happy rides on your ${item.vehicleModel}. As a special birthday gift, enjoy 15% OFF on your next vehicle service using coupon code ${item.discountCode}. Valid for this month! 🏍️✨`;
    } else {
      return `Dear ${item.customerName}, Happy Vehicle Purchase Anniversary from Nandhi Motors! 🎊 Celebrating happy miles on your ${item.vehicleModel} (${item.vehicleRegNo}). Enjoy 10% OFF on General Service & Water Wash with coupon ${item.discountCode}. Drive safe! 🛵✨`;
    }
  };

  const handleSendWhatsApp = (item) => {
    const text = encodeURIComponent(generateMessage(item));
    const cleanMobile = item.mobile.replace(/\D/g, '');
    const fullMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    window.open(`https://wa.me/${fullMobile}?text=${text}`, '_blank');

    setEvents(prev => prev.map(e => e.id === item.id ? { ...e, sentWish: true } : e));
  };

  const handleCopyText = (item) => {
    const text = generateMessage(item);
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cake style={{ color: '#059669' }} /> Customer Greetings & Anniversaries
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '2px' }}>
            Automated birthday & vehicle delivery anniversary greetings with personalized service discount vouchers.
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setActiveType('Birthday')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeType === 'Birthday' ? '#059669' : '#ffffff',
            color: activeType === 'Birthday' ? '#ffffff' : '#374151',
            border: activeType === 'Birthday' ? '1px solid #059669' : '1px solid #e5e7eb',
            boxShadow: activeType === 'Birthday' ? '0 2px 4px rgba(5,150,105,0.2)' : 'none'
          }}
        >
          <Cake size={18} /> Customer Birthdays
        </button>

        <button
          onClick={() => setActiveType('Anniversary')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeType === 'Anniversary' ? '#059669' : '#ffffff',
            color: activeType === 'Anniversary' ? '#ffffff' : '#374151',
            border: activeType === 'Anniversary' ? '1px solid #059669' : '1px solid #e5e7eb',
            boxShadow: activeType === 'Anniversary' ? '0 2px 4px rgba(5,150,105,0.2)' : 'none'
          }}
        >
          <Gift size={18} /> Vehicle Delivery Anniversaries
        </button>
      </div>

      {/* Greetings Feed Table Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search customer, mobile, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              No upcoming {activeType.toLowerCase()} records found.
            </div>
          ) : (
            filteredEvents.map(evt => {
              const msg = generateMessage(evt);
              const isToday = evt.id === 'EVT-1' || evt.id === 'EVT-3';

              return (
                <div
                  key={evt.id}
                  style={{
                    border: isToday ? '2px solid #a7f3d0' : '1px solid #e5e7eb',
                    backgroundColor: isToday ? '#fafdfb' : '#ffffff',
                    borderRadius: '12px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: isToday ? '#ecfdf5' : '#f3f4f6',
                        color: isToday ? '#059669' : '#4b5563',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {activeType === 'Birthday' ? <Cake size={22} /> : <Gift size={22} />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{evt.customerName}</span>
                          {isToday && (
                            <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                              TODAY! 🎂
                            </span>
                          )}
                          {evt.sentWish && (
                            <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={12} /> Wish Sent
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.825rem', color: '#6b7280', marginTop: '2px' }}>
                          {evt.mobile} &bull; {evt.vehicleModel} ({evt.vehicleRegNo})
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        backgroundColor: '#fef3c7',
                        color: '#d97706',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px'
                      }}>
                        🎟️ {evt.discountCode}
                      </span>
                    </div>
                  </div>

                  {/* Message Preview Box */}
                  <div style={{ backgroundColor: '#f9fafb', padding: '12px 14px', borderRadius: '8px', border: '1px solid #f3f4f6', fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>
                    {msg}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      onClick={() => handleCopyText(evt)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#ffffff',
                        color: '#374151',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {copiedId === evt.id ? <Check size={15} style={{ color: '#059669' }} /> : <Sparkles size={15} />}
                      <span>{copiedId === evt.id ? 'Copied Message!' : 'Copy Greeting Text'}</span>
                    </button>

                    <button
                      onClick={() => handleSendWhatsApp(evt)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#25D366',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(37,211,102,0.3)'
                      }}
                    >
                      <MessageCircle size={16} />
                      <span>Send WhatsApp Greeting</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
