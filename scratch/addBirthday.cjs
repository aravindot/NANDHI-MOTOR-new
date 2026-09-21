const fs = require('fs');
let code = fs.readFileSync('src/components/pages/LeadsManagement.jsx', 'utf8');

// 1. Initial State
const oldInit = `    invoiceDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerAadhar: '',
    customerGst: '',`;
const newInit = `    invoiceDate: new Date().toISOString().split('T')[0],
    customerName: '',
    customerPhone: '',
    customerBirthday: '',
    customerAddress: '',
    customerAadhar: '',
    customerGst: '',`;
code = code.replace(oldInit, newInit);

// 2. handlePickInvoiceCustomerSuggestion
const oldPick = `      customerName: match.name || match.customerName || prev.customerName,
      customerPhone: match.mobile || match.customerPhone || prev.customerPhone,
      customerAddress: match.address || match.customerAddress || prev.customerAddress,`;
const newPick = `      customerName: match.name || match.customerName || prev.customerName,
      customerPhone: match.mobile || match.customerPhone || prev.customerPhone,
      customerBirthday: match.birthday || match.customerBirthday || prev.customerBirthday,
      customerAddress: match.address || match.customerAddress || prev.customerAddress,`;
code = code.replace(oldPick, newPick);

// 3. handleEditInvoice
const oldEdit = `      customerName: inv.customerName || '',
      customerPhone: inv.customerPhone || inv.customerMobile || '',
      customerAddress: inv.customerAddress || '',`;
const newEdit = `      customerName: inv.customerName || '',
      customerPhone: inv.customerPhone || inv.customerMobile || '',
      customerBirthday: inv.customerBirthday || '',
      customerAddress: inv.customerAddress || '',`;
code = code.replace(oldEdit, newEdit);

// 4. Form UI - Right after customerPhone
const oldForm = `                    {/* Floating Suggestion Dropdown for Phone */}
                    {showInvoicePhoneSuggestions && invoicePhoneMatches.length > 0 && (`;
const newForm = `                    {/* Floating Suggestion Dropdown for Phone */}
                    {showInvoicePhoneSuggestions && invoicePhoneMatches.length > 0 && (`;

// Actually, I need to add the Customer Birthday field next to Aadhar or Customer Address. Let's see the form layout.
// In form layout, there is:
//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label className="form-label">Aadhar Number</label>

const oldAadharSection = `<div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Aadhar Number</label>`;
const newAadharSection = `<div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Customer Birthday (Optional)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={invoiceFormData.customerBirthday || ''}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerBirthday: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Aadhar Number</label>`;
code = code.replace(oldAadharSection, newAadharSection);

// Wait, the Aadhar Section has a grid with 2 columns: Aadhar Number and Customer GSTIN.
// If I add Customer Birthday before Aadhar, I will make it 3 columns? Or should I make a new grid?
// Let's replace the single Customer Address full-width with a grid!

const oldAddressSection = `                <div className="form-group">
                  <label className="form-label">Customer Address</label>
                  <input
                    type="text"
                    className="form-control"
                    
                    value={invoiceFormData.customerAddress}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerAddress: e.target.value })}
                  />
                </div>`;
const newAddressSection = `                <div className="form-grid">
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
                </div>`;
// Actually, let me just undo the Aadhar replace and do the Address replace instead.
code = code.replace(newAadharSection, oldAadharSection);
code = code.replace(oldAddressSection, newAddressSection);

fs.writeFileSync('src/components/pages/LeadsManagement.jsx', code, 'utf8');
console.log("Added customerBirthday to LeadsManagement.jsx");
