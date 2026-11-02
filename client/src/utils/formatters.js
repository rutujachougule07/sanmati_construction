// SANMATI CONSTRUCTIONS ERP - Formatters & Calculators

/**
 * Format number to Indian Currency string (₹)
 * Example: 1545000 -> ₹15,45,000.00
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(num);
};

/**
 * Format Indian number without currency symbol
 */
export const formatNumber = (num, decimals = 2) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(Number(num));
};

/**
 * Format date to standard Day-Month-Year format (DD-MM-YYYY)
 */
export const formatDate = (dateInput, includeTime = false) => {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';
  
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  
  if (includeTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${d}-${m}-${y} ${hours}:${minutes}`;
  }
  return `${d}-${m}-${y}`;
};

/**
 * Calculate BOQ item total
 */
export const calculateBOQItem = (quantity, rate) => {
  const q = Number(quantity) || 0;
  const r = Number(rate) || 0;
  return q * r;
};

/**
 * Calculate GST Breakdown (Maharashtra intra-state vs inter-state)
 */
export const calculateGST = (taxableAmount, gstRate = 18, isInterState = false) => {
  const base = Number(taxableAmount) || 0;
  const rate = Number(gstRate) || 0;
  const totalTax = (base * rate) / 100;
  
  if (isInterState) {
    return {
      taxableAmount: base,
      gstRate: rate,
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      totalTax,
      totalAmount: base + totalTax
    };
  } else {
    const halfTax = totalTax / 2;
    return {
      taxableAmount: base,
      gstRate: rate,
      cgst: halfTax,
      sgst: halfTax,
      igst: 0,
      totalTax,
      totalAmount: base + totalTax
    };
  }
};

/**
 * Calculate RA Bill Net Payable
 */
export const calculateRABill = ({
  currentAmount = 0,
  retentionPercent = 5,
  advanceRecovery = 0,
  otherDeductions = 0,
  gstPercent = 18,
  isInterState = false
}) => {
  const current = Number(currentAmount) || 0;
  const retention = (current * Number(retentionPercent)) / 100;
  const advance = Number(advanceRecovery) || 0;
  const deductions = Number(otherDeductions) || 0;
  const totalDeductions = retention + advance + deductions;
  
  const taxableSubtotal = Math.max(0, current - totalDeductions);
  const gst = calculateGST(current, gstPercent, isInterState);
  
  const netPayable = current - totalDeductions + gst.totalTax;
  
  return {
    currentAmount: current,
    retentionAmount: retention,
    advanceRecovery: advance,
    otherDeductions: deductions,
    totalDeductions,
    taxableSubtotal,
    gst,
    netPayable
  };
};

/**
 * Haversine Formula: Calculate Distance between two GPS points in meters
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in meters
};

/**
 * Convert number to Indian Currency words (Rupees in Words)
 * Example: 193400 -> "One Lakh Ninety-Three Thousand Four Hundred Rupees Only"
 */
export const numberToWordsIndian = (num) => {
  const n = Math.round(Number(num) || 0);
  if (n === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (val) => {
    if (val < 20) return a[val];
    const tens = b[Math.floor(val / 10)];
    const units = a[val % 10];
    return units ? `${tens} ${units}` : tens;
  };

  const convertThreeDigits = (val) => {
    const hundreds = Math.floor(val / 100);
    const rest = val % 100;
    if (hundreds && rest) return `${a[hundreds]} Hundred and ${convertTwoDigits(rest)}`;
    if (hundreds) return `${a[hundreds]} Hundred`;
    return convertTwoDigits(rest);
  };

  let words = '';
  let remainder = n;

  if (remainder >= 10000000) {
    const crores = Math.floor(remainder / 10000000);
    words += `${convertTwoDigits(crores)} Crore `;
    remainder %= 10000000;
  }
  if (remainder >= 100000) {
    const lakhs = Math.floor(remainder / 100000);
    words += `${convertTwoDigits(lakhs)} Lakh `;
    remainder %= 100000;
  }
  if (remainder >= 1000) {
    const thousands = Math.floor(remainder / 1000);
    words += `${convertTwoDigits(thousands)} Thousand `;
    remainder %= 1000;
  }
  if (remainder > 0) {
    words += `${convertThreeDigits(remainder)} `;
  }

  return `${words.trim()} Rupees Only`;
};
