import React, { useState, useMemo } from 'react';
import {
  Gift,
  Coins,
  Award,
  Sparkles,
  Check,
  Plus,
  Search,
  CheckCircle,
  Ticket,
  User,
  Phone,
  Trash2,
  X
} from 'lucide-react';

export default function RedeemPointsPage({ customers = [] }) {
  const [activeSubTab, setActiveSubTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
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

  // Loyalty balances
  const [loyaltyBalances, setLoyaltyBalances] = useState(() => {
    const saved = localStorage.getItem('nandhi_loyalty_balances');
    return saved
      ? JSON.parse(saved)
      : [];
  });

  const [redemptions, setRedemptions] = useState(() => {
    const saved = localStorage.getItem('nandhi_redemptions');
    return saved
      ? JSON.parse(saved)
      : [];
  });

  const filteredBalances = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return loyaltyBalances.filter(
      (b) => !q || b.name.toLowerCase().includes(q) || b.mobile.includes(q) || b.id.toLowerCase().includes(q)
    );
  }, [loyaltyBalances, searchQuery]);

  const activeCustomer =
    loyaltyBalances.find((b) => b.id === selectedCustomerId) || (filteredBalances.length > 0 ? filteredBalances[0] : null);

  const handleRedeemClick = (reward) => {
    setSelectedReward(reward);
    setIsRedeemModalOpen(true);
  };

  const handleConfirmRedeem = (customer) => {
    if (!selectedReward || !customer) return;
    if (customer.availablePoints < selectedReward.pointsRequired) {
      alert(`Customer does not have enough points. Needs ${selectedReward.pointsRequired} points.`);
      return;
    }

    const updatedBalances = loyaltyBalances.map((b) => {
      if (b.id === customer.id) {
        return {
          ...b,
          availablePoints: b.availablePoints - selectedReward.pointsRequired,
          redeemedPoints: b.redeemedPoints + selectedReward.pointsRequired
        };
      }
      return b;
    });

    const newRedemption = {
      id: `RDM-${String(redemptions.length + 1).padStart(2, '0')}`,
      customerName: customer.name,
      customerMobile: customer.mobile,
      rewardTitle: selectedReward.title,
      pointsSpent: selectedReward.pointsRequired,
      voucherCode: `${selectedReward.id}-${customer.mobile.slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Redeemed'
    };

    setLoyaltyBalances(updatedBalances);
    setRedemptions([newRedemption, ...redemptions]);
    setIsRedeemModalOpen(false);
    alert(`Reward "${selectedReward.title}" redeemed successfully for ${customer.name}!`);
  };

  const totalPointsCirculation = loyaltyBalances.reduce((sum, b) => sum + (b.availablePoints || 0), 0);
  const totalRedeemed = loyaltyBalances.reduce((sum, b) => sum + (b.redeemedPoints || 0), 0);

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Sub Tabs */}
      <div className="sub-tabs-container">
        <span
          className={`sub-tab ${activeSubTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('catalog')}
        >
          <Gift size={14} style={{ marginRight: '6px' }} /> Rewards Catalog & Redemption
        </span>
        <span
          className={`sub-tab ${activeSubTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('ledger')}
        >
          <Ticket size={14} style={{ marginRight: '6px' }} /> Redemption History Log
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
        {/* LEFT COLUMN: Customer Balances or Rewards Catalog */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="card-title">
              <Coins size={18} style={{ color: '#059669' }} /> Customer Loyalty Balances
            </h3>
            <div className="quick-search">
              <Search size={14} className="quick-search-icon" />
              <input
                type="text"
                placeholder="Search member..."
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
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Active Members</span>
                <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{loyaltyBalances.length}</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>⭐ In Circulation</span>
                <strong style={{ fontSize: '0.9rem', color: '#059669' }}>{totalPointsCirculation} Pts</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>🎟️ Redeemed</span>
                <strong style={{ fontSize: '0.9rem', color: '#3b82f6' }}>{totalRedeemed} Pts</strong>
              </div>
            </div>

            {/* List of Member Balances */}
            {filteredBalances && filteredBalances.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredBalances.map((cust) => {
                  const isSelected = activeCustomer && activeCustomer.id === cust.id;

                  return (
                    <div
                      key={cust.id}
                      onClick={() => setSelectedCustomerId(cust.id)}
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
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              backgroundColor: isSelected ? '#a7f3d0' : '#fef3c7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              color: isSelected ? '#047857' : '#b45309'
                            }}
                          >
                            {(cust.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#1f2937' }}>{cust.name}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#6b7280', marginLeft: '6px' }}>#{cust.id}</span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #bbf7d0'
                          }}
                        >
                          ⭐ {cust.availablePoints} Pts
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#6b7280', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={11} color="#059669" /> {cust.mobile}
                        </span>
                        <span>Total Earned: {cust.totalPoints} Pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Coins size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '0.82rem' }}>No customer loyalty records found.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Customer Loyalty Pass & Rewards Voucher Preview */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              <Sparkles size={18} style={{ color: '#059669' }} /> Customer Loyalty Pass
            </h3>
            {activeCustomer && (
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                Pass #{activeCustomer.id}
              </span>
            )}
          </div>

          <div className="card-body">
            {activeCustomer ? (
              <div className="invoice-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #059669', paddingBottom: '12px' }}>
                  <div>
                    <div className="invoice-title" style={{ textAlign: 'left', margin: 0, fontSize: '1.25rem' }}>NANDHI MOTORS</div>
                    <p style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, margin: '2px 0 0' }}>
                      Exclusive Two-Wheeler Loyalty & Privilege Pass
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: '#f59e0b',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                    >
                      👑 GOLD MEMBER
                    </span>
                  </div>
                </div>

                {/* 2-Column Info Grid */}
                <div className="invoice-grid-2" style={{ marginTop: '16px' }}>
                  <div>
                    <div className="section-title">Member Particulars</div>
                    <p><strong>Name:</strong> {activeCustomer.name}</p>
                    <p>
                      <strong>Mobile:</strong>{' '}
                      <a href={`tel:${activeCustomer.mobile}`} style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                        {activeCustomer.mobile}
                      </a>
                    </p>
                    <p><strong>Member ID:</strong> {activeCustomer.id}</p>
                  </div>

                  <div>
                    <div className="section-title">Points Summary</div>
                    <p><strong>Available Balance:</strong> <span style={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>{activeCustomer.availablePoints} Points</span></p>
                    <p><strong>Lifetime Points:</strong> {activeCustomer.totalPoints} Points</p>
                    <p><strong>Redeemed:</strong> {activeCustomer.redeemedPoints} Points</p>
                  </div>
                </div>

                {/* Available Rewards Redemption Grid */}
                <div style={{ marginTop: '16px' }}>
                  <div className="section-title">Claimable Service & Accessory Rewards</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {rewardsCatalog.map((reward) => {
                      const canRedeem = activeCustomer.availablePoints >= reward.pointsRequired;

                      return (
                        <div
                          key={reward.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            backgroundColor: canRedeem ? '#f0fdf4' : '#f9fafb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.25rem' }}>{reward.icon}</span>
                            <div>
                              <strong style={{ fontSize: '0.84rem', color: '#1f2937' }}>{reward.title}</strong>
                              <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280' }}>
                                Worth {reward.value} • Requires {reward.pointsRequired} Pts
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`btn btn-sm ${canRedeem ? 'btn-primary' : 'btn-secondary'}`}
                            disabled={!canRedeem}
                            style={{ fontSize: '0.74rem', padding: '4px 10px', opacity: canRedeem ? 1 : 0.5 }}
                            onClick={() => handleConfirmRedeem(activeCustomer)}
                          >
                            {canRedeem ? 'Claim Reward' : 'Needs More Pts'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Coins size={36} strokeWidth={1} style={{ marginBottom: '8px' }} />
                <p>Select a member from the loyalty ledger on the left to preview.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
