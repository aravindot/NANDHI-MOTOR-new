export function buildWarrantyClaimMail({ claim = {}, companyProfile = {} } = {}) {
  const to = (companyProfile.email || 'contact@nandhimotors.com').trim();
  const subject = `Warranty Claim Submission - ${claim.id || 'WC-000'} | ${claim.customerName || 'Customer'}`;

  const clean = (value) => String(value ?? '').trim();
  const partNumber = clean(claim.partCode || claim.partNo || claim.part_number || 'Not provided');
  const defectName = clean(claim.defectivePart || 'Not provided');
  const issueText = clean(claim.issueDescription || 'Not provided');
  const customerMobile = clean(claim.customerMobile || 'Not provided');
  const vehicleName = clean(claim.vehicleModel || 'Not provided');
  const vehicleReg = clean(claim.vehicleRegNo || 'Not provided').toUpperCase();
  const category = clean(claim.defectCategory || 'Not provided');
  const amount = Number(claim.claimAmount || 0);
  const date = clean(claim.submissionDate || new Date().toISOString().split('T')[0]);

  const body = [
    'Dear Team,',
    '',
    'Please review the below warranty claim details and confirm the approval / part replacement status.',
    '',
    'Claim ID: ' + (claim.id || 'WC-000'),
    'Customer Name: ' + (claim.customerName || 'Not provided'),
    'Mobile Number: ' + customerMobile,
    'Vehicle Model: ' + vehicleName,
    'Vehicle Reg No: ' + vehicleReg,
    'Defective Part Name: ' + defectName,
    'Part Number / Code: ' + partNumber,
    'Category: ' + category,
    'Claim Amount: ₹' + amount.toLocaleString('en-IN'),
    'Submission Date: ' + date,
    'Issue Description: ' + issueText,
    '',
    'Regards,',
    claim.customerName || 'Customer',
    'NANDHI MOTORS Warranty Desk'
  ].join('\n');

  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return {
    to,
    subject,
    body,
    mailto,
    htmlBody: body.replace(/\n/g, '<br />')
  };
}
