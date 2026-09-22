import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWarrantyClaimMail } from './warrantyMailUtil.js';

test('buildWarrantyClaimMail creates a valid company mailto payload with part number details', () => {
  const claim = {
    id: 'WC-05',
    customerName: 'Ravi',
    customerMobile: '9876543210',
    vehicleRegNo: 'TN-10-AB-1234',
    vehicleModel: 'Honda Activa 6G',
    defectivePart: 'Starter Motor Assembly',
    partCode: 'SM-1234-A',
    defectCategory: 'Electrical',
    issueDescription: 'Starter motor fails intermittently',
    claimAmount: 2450,
    submissionDate: '2026-09-22'
  };

  const companyProfile = {
    name: 'NANDHI MOTORS',
    email: 'claims@nandhimotors.com'
  };

  const mail = buildWarrantyClaimMail({ claim, companyProfile });

  assert.equal(mail.to, 'claims@nandhimotors.com');
  assert.match(mail.subject, /WC-05|Warranty Claim/i);
  assert.match(mail.body, /Part Number.*SM-1234-A/i);
  assert.match(mail.body, /Defective Part Name.*Starter Motor Assembly/i);
  assert.match(mail.body, /Vehicle Reg No.*TN-10-AB-1234/i);
  assert.match(mail.mailto, /mailto:/i, 'Expected a mailto link');
});
