const fs = require('fs');

let content = fs.readFileSync('src/components/pages/PurchasePage.jsx', 'utf8');

// 1. Add Edit3 import
content = content.replace(/Trash2,/, 'Trash2,\n  Edit3,');

// 2. Add editingPurchaseId state
content = content.replace(
  /const \[selectedInvoiceId, setSelectedInvoiceId\] = useState\(null\);/,
  `const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);\n  const [editingPurchaseId, setEditingPurchaseId] = useState(null);`
);

// 3. Add handleEdit and handleDelete functions right before getVehTotals
const editDeleteFuncs = `
  const handleDeleteInvoice = (id) => {
    if (window.confirm("Are you sure you want to delete this purchase invoice?")) {
      setPurchaseInvoices(prev => prev.filter(inv => inv.id !== id));
      if (selectedInvoiceId === id) setSelectedInvoiceId(null);
    }
  };

  const handleEditInvoice = (inv) => {
    setEditingPurchaseId(inv.id);
    if (inv.purchaseType === 'Vehicle Purchases') {
      setVehFormData({
        supplierName: inv.supplierName || '',
        supplierGst: inv.supplierGst || '',
        invoiceNo: inv.invoiceNo || '',
        date: inv.date || new Date().toISOString().split('T')[0],
        model: inv.itemDetails?.replace(/\\dx /, '').split(' (')[0] || 'Activa 6G',
        color: inv.itemDetails?.includes('(') ? inv.itemDetails.split('(')[1].replace(')', '') : 'Matte Blue',
        qty: inv.qty || 1,
        unitPrice: inv.unitPrice || 0,
        gstRate: inv.gstRate || 5
      });
      setIsVehicleModalOpen(true);
    } else {
      setSpareFormData({
        supplierName: inv.supplierName || '',
        invoiceNo: inv.invoiceNo || '',
        date: inv.date || new Date().toISOString().split('T')[0],
        spareId: inv.partCode || 'NEW',
        newPartName: inv.itemDetails || '',
        qty: inv.qty || 1,
        unitPrice: inv.unitPrice || 0,
        gstRate: inv.gstRate || 18
      });
      setIsSpareModalOpen(true);
    }
  };
`;
content = content.replace('const getVehTotals = () => {', editDeleteFuncs + '\n  const getVehTotals = () => {');

// 4. Modify handleVehiclePurchaseSubmit
const vehSubmitReplacement = `
    const newInvoice = {
      id: editingPurchaseId || newId,
      purchaseType: 'Vehicle Purchases',
      supplierName: vehFormData.supplierName,
      supplierGst: (vehFormData.supplierGst || '').toUpperCase(),
      invoiceNo: vehFormData.invoiceNo,
      date: vehFormData.date,
      itemDetails: \`\${vehFormData.qty}x \${vehFormData.model} (\${vehFormData.color})\`,
      qty: Number(vehFormData.qty),
      unitPrice: Number(vehFormData.unitPrice),
      gstRate: Number(vehFormData.gstRate),
      gstAmount: totals.gst,
      totalAmount: totals.grand
    };

    if (editingPurchaseId) {
      setPurchaseInvoices(prev => prev.map(inv => inv.id === editingPurchaseId ? newInvoice : inv));
      setEditingPurchaseId(null);
    } else {
      setPurchaseInvoices([newInvoice, ...purchaseInvoices]);
      setSelectedInvoiceId(newId);
    }
`;
content = content.replace(/const newInvoice = {[\s\S]*?setSelectedInvoiceId\(newId\);/, vehSubmitReplacement);

// 5. Modify handleSparePurchaseSubmit
const spareSubmitReplacement = `
    const newInvoice = {
      id: editingPurchaseId || newId,
      purchaseType: 'Spare Purchases',
      supplierName: spareFormData.supplierName,
      supplierGst: '',
      invoiceNo: spareFormData.invoiceNo,
      date: spareFormData.date,
      itemDetails: partName,
      partCode: targetSpareId,
      qty: Number(spareFormData.qty),
      unitPrice: Number(spareFormData.unitPrice),
      gstRate: Number(spareFormData.gstRate),
      gstAmount: totals.gst,
      totalAmount: totals.grand
    };

    if (editingPurchaseId) {
      setPurchaseInvoices(prev => prev.map(inv => inv.id === editingPurchaseId ? newInvoice : inv));
      setEditingPurchaseId(null);
    } else {
      setPurchaseInvoices([newInvoice, ...purchaseInvoices]);
      setSelectedInvoiceId(newId);
    }
`;
content = content.replace(/const newInvoice = {[\s\S]*?setSelectedInvoiceId\(newId\);/, spareSubmitReplacement);

// 6. Reset editingPurchaseId when modals close
content = content.replace(/setIsVehicleModalOpen\(false\)/g, 'setIsVehicleModalOpen(false); setEditingPurchaseId(null)');
content = content.replace(/setIsSpareModalOpen\(false\)/g, 'setIsSpareModalOpen(false); setEditingPurchaseId(null)');

// 7. Inject Edit / Delete buttons into Right panel header
const buttonsHtml = `
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  Voucher #{activeInvoice.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleEditInvoice(activeInvoice)}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '2px' }}
                  title="Edit Invoice"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteInvoice(activeInvoice.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                  title="Delete Invoice"
                >
                  <Trash2 size={15} />
                </button>
              </div>
`;

content = content.replace(
  /<span style=\{\{ fontSize: '0.74rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' \}\}>\s*Voucher #\{activeInvoice.id\}\s*<\/span>/,
  buttonsHtml
);

fs.writeFileSync('src/components/pages/PurchasePage.jsx', content, 'utf8');
console.log('PurchasePage updated with edit and delete options.');
