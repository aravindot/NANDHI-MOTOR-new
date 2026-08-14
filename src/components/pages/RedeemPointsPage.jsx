import React, { useState, useMemo } from 'react';
import { Gift, Coins, Award, Sparkles, Check, Plus, Search, CheckCircle, Ticket } from 'lucide-react';

export default function RedeemPointsPage({
  customers = []
}) {
  const [activeSubTab, setActiveSubTab] = useState('catalog'); // 'catalog' or 'ledger'
  const [searchQuery, setSearchQuery] = useState('');
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  // Rewards Catalog
  const rewardsCatalog = [
    {
      id: 'REW-1',
      title: 'Free Engine Oil Top-Up',
      pointsRequired: 250,
      description: 'Genuine 4T engine oil top-up during vehicle service.',
      icon: '🛢️',
      value: '₹350'
    },
    {
      id: 'REW-2',
      title: 'Free Teflon Polish & Washing',
      pointsRequired: 400,
      description: 'Complete foam water wash with premium body teflon shine coat.',
      icon: '✨',
      value: '₹550'
    },
    {
      id: 'REW-3',
      title: '₹500 Showroom Spares Voucher',
      pointsRequired: 500,
      description: 'Discount voucher redeemable on any spare parts or accessories.',
      icon: '🎟️',
      value: '₹500'
    },
    {
      id: 'REW-4',
      title: 'Free Annual General Service Labor',
      pointsRequired: 750,
      description: '100% labor waiver on complete periodic vehicle service.',
      icon: '🛠️',
      value: '₹850'
    },
    {
      id: 'REW-5',
      title: 'Premium ISI Certified Helmet',
      pointsRequired: 1000,
      description: 'High-safety branded full-face two-wheeler helmet.',
      icon: '🪖',
      value: '₹1,200'
    }
  ];

  // Customer Loyalty Balances & Redemption History
  const [loyaltyBalances, setLoyaltyBalances] = useState(() => {
    const saved = localStorage.getItem('nandhi_loyalty_balances');
    return saved ? JSON.parse(saved) : [
      { id: 'C-01', name: 'Rajesh Kumar', mobile: '9842155670', totalPoints: 850, redeemedPoints: 250, availablePoints: 600 },
      { id: 'C-02', name: 'Deepak Sharma', mobile: '9443219800', totalPoints: 500, redeemedPoints: 0, availablePoints: 500 },
      { id: 'C-03', name: 'Sanjay Kumar', mobile: '9843322110', totalPoints: 1200, redeemedPoints: 400, availablePoints: 800 },
      { id: 'C-04', name: 'Anitha Ramesh', mobile: '9894123456', totalPoints: 350, redeemedPoints: 0, availablePoints: 350 },
      { id: 'C-05', name: 'K. Senthil Nathan', mobile: '9443312345', totalPoints: 950, redeemedPoints: 500, availablePoints: 450 }
    ];
  });

  const [redemptions, setRedemptions] = useState(() => {
    const saved = localStorage.getItem('nandhi_redemptions');
    return saved ? JSON.parse(saved) : [
      {
        id: 'RDM-01',
        customerName: 'Rajesh Kumar',
        customerMobile: '9842155670',
        rewardTitle: 'Free Engine Oil Top-Up',
        pointsSpent: 250,
        voucherCode: 'OIL-9842-RDM',
        date: '2026-08-10',
        status: 'Redeemed'
      },
      {
        id: 'RDM-02',
        customerName: 'Sanjay Kumar',
        customerMobile: '9843322110',
        rewardTitle: 'Free Teflon Polish & Washing',
        pointsSpent: 400,
        voucherCode: 'POL-9843-RDM',
        date: '2026-08-12',
        status: 'Redeemed'
      },
      {
        id: 'RDM-03',
        customerName: 'K. Senthil Nathan',
        customerMobile: '9443312345',
        rewardTitle: '₹500 Showroom Spares Voucher',
        pointsSpent: 500,
        voucherCode: 'SPR-9443-RDM',
        date: '2026-08-14',
        status: 'Active'
      }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('nandhi_loyalty_balances', JSON.stringify(loyaltyBalances));
  }, [loyaltyBalances]);

  React.useEffect(() => {
    localStorage.setItem('nandhi_redemptions', JSON.stringify(redemptions));
  }, [redemptions]);

  // Form State for modal
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const handleOpenRedeemModal = (reward) => {
    setSelectedReward(reward);
    setSelectedCustomerId(loyaltyBalances[0]?.id || '');
    setIsRedeemModalOpen(true);
  };

  const handleProcessRedeem = (e) => {
    e.preventDefault();
    const cust = loyaltyBalances.find(c => c.id === selectedCustomerId);
    if (!cust) return;

    if (cust.availablePoints < selectedReward.pointsRequired) {
      alert(`Customer only has ${cust.availablePoints} points. ${selectedReward.pointsRequired} points needed.`);
      return;
    }

    // Deduct points
    setLoyaltyBalances(prev => prev.map(c => {
      if (c.id === selectedCustomerId) {
        return {
          ...c,
          redeemedPoints: c.redeemedPoints + selectedReward.pointsRequired,
          availablePoints: c.availablePoints - selectedReward.pointsRequired
        };
      }
      return c;
    }));

    // Add Redemption Record
    const newRedemption = {
      id: `RDM-${String(redemptions.length + 1).padStart(2, '0')}`,
      customerName: cust.name,
      customerMobile: cust.mobile,
      rewardTitle: selectedReward.title,
      pointsSpent: selectedReward.pointsRequired,
      voucherCode: `RWD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Active'
    };

    setRedemptions([newRedemption, ...redemptions]);
    setIsRedeemModalOpen(false);
    alert(`Reward redeemed successfully! Voucher Code: ${newRedemption.voucherCode}`);
  };

  const filteredBalances = useMemo(() => {
    return loyaltyBalances.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery)
    );
  }, [loyaltyBalances, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award style={{ color: '#059669' }} /> Customer Loyalty & Reward Point Redemption
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '2px' }}>
            Customer loyalty reward points ledger, catalog of service benefits, and instant voucher redemptions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setActiveSubTab('catalog')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'catalog' ? '#059669' : '#ffffff',
            color: activeSubTab === 'catalog' ? '#ffffff' : '#374151',
            border: activeSubTab === 'catalog' ? '1px solid #059669' : '1px solid #e5e7eb'
          }}
        >
          <Gift size={18} /> Rewards Catalog
        </button>

        <button
          onClick={() => setActiveSubTab('ledger')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'ledger' ? '#059669' : '#ffffff',
            color: activeSubTab === 'ledger' ? '#ffffff' : '#374151',
            border: activeSubTab === 'ledger' ? '1px solid #059669' : '1px solid #e5e7eb'
          }}
        >
          <Coins size={18} /> Customer Points Ledger ({loyaltyBalances.length})
        </button>
      </div>

      {activeSubTab === 'catalog' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {rewardsCatalog.map(r => (
            <div
              key={r.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '2.25rem', lineHeight: 1 }}>{r.icon}</div>
                  <span style={{
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.825rem',
                    fontWeight: 700
                  }}>
                    {r.pointsRequired} Pts
                  </span>
                </div>

                <div style={{ marginTop: '16px', fontWeight: 700, fontSize: '1.05rem', color: '#111827' }}>
                  {r.title}
                </div>

                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '6px', lineHeight: 1.5 }}>
                  {r.description}
                </p>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                  Reward Value: <strong style={{ color: '#059669' }}>{r.value}</strong>
                </div>

                <button
                  onClick={() => handleOpenRedeemModal(r)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <Ticket size={15} /> Redeem
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Customer Loyalty Ledger */
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search customer name, mobile..."
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

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 18px' }}>Customer Details</th>
                <th style={{ padding: '12px 18px' }}>Total Lifetime Points</th>
                <th style={{ padding: '12px 18px' }}>Points Redeemed</th>
                <th style={{ padding: '12px 18px' }}>Available Balance</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBalances.map(cust => (
                <tr key={cust.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{cust.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{cust.mobile}</div>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#4b5563' }}>
                    {cust.totalPoints} Pts
                  </td>
                  <td style={{ padding: '14px 18px', color: '#ef4444', fontWeight: 500 }}>
                    -{cust.redeemedPoints} Pts
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      ⭐ {cust.availablePoints} Pts
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>Active Member</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Redeem Voucher Modal */}
      {isRedeemModalOpen && selectedReward && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Redeem Reward</h3>
              <button onClick={() => setIsRedeemModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleProcessRedeem} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#fafdfb', padding: '16px', borderRadius: '10px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ fontSize: '2rem' }}>{selectedReward.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{selectedReward.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>Cost: {selectedReward.pointsRequired} Reward Points</div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Select Customer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                >
                  {loyaltyBalances.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.mobile}) - Balance: {c.availablePoints} Pts
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsRedeemModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', backgroundColor: '#059669', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Confirm Redemption
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
