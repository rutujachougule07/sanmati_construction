// SANMATI CONSTRUCTIONS ERP - Tally ERP & TallyPrime Integration Service
// Standard Tally XML Envelope Builder & Synchronization Engine

/**
 * Generate standard Tally XML envelope for Sales / RA Bill Voucher
 */
export const buildTallySalesVoucherXML = ({
  companyName = "SANMATI CONSTRUCTIONS (FY 2026-2027)",
  voucherNo,
  date = new Date().toISOString().slice(0, 10).replace(/-/g, ''),
  partyLedger,
  salesLedger = "Construction Revenue A/c",
  amount,
  cgst = 0,
  sgst = 0,
  igst = 0,
  narration = "Construction RA Bill billing entry"
}) => {
  const formattedDate = date.replace(/-/g, '');
  const totalAmount = Number(amount) + Number(cgst) + Number(sgst) + Number(igst);

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${formattedDate}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${voucherNo}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${partyLedger}</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
            <NARRATION>${narration}</NARRATION>
            
            <!-- Debit Party (Customer / Client) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${partyLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${totalAmount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            
            <!-- Credit Sales (Revenue) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${salesLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${Number(amount).toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            
            ${cgst > 0 ? `
            <!-- Credit CGST -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output CGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${Number(cgst).toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>` : ''}
            
            ${sgst > 0 ? `
            <!-- Credit SGST -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output SGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${Number(sgst).toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>` : ''}

            ${igst > 0 ? `
            <!-- Credit IGST -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output IGST @ 18%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${Number(igst).toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>` : ''}
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
};

/**
 * Generate standard Tally XML for Ledger Master Creation
 */
export const buildTallyLedgerXML = ({
  companyName = "SANMATI CONSTRUCTIONS (FY 2026-2027)",
  ledgerName,
  parentGroup = "Sundry Debtors",
  gstin = "",
  state = "Maharashtra",
  address = "Kolhapur"
}) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${ledgerName}" ACTION="Create">
            <NAME.LIST>
              <NAME>${ledgerName}</NAME>
            </NAME.LIST>
            <PARENT>${parentGroup}</PARENT>
            <ISBILLWISEON>Yes</ISBILLWISEON>
            <PARTYGSTIN>${gstin}</PARTYGSTIN>
            <LEDSTATENAME>${state}</LEDSTATENAME>
            <COUNTRYNAME>India</COUNTRYNAME>
            <ADDRESS.LIST>
              <ADDRESS>${address}</ADDRESS>
            </ADDRESS.LIST>
          </LEDGER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
};

/**
 * Generate standard Tally XML for any Voucher Type (Sales, Purchase, Payment, Receipt, Contra, Journal)
 */
export const buildGenericVoucherXML = ({
  companyName = "SANMATI CONSTRUCTIONS (FY 2026-2027)",
  voucherType = "Payment",
  voucherNo,
  date = new Date().toISOString().slice(0, 10).replace(/-/g, ''),
  debitLedger,
  creditLedger,
  amount,
  narration = ""
}) => {
  const formattedDate = date.replace(/-/g, '');
  const numAmount = Number(amount) || 0;
  const vchTypeName = voucherType.replace(' Voucher', '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="${vchTypeName}" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${formattedDate}</DATE>
            <VOUCHERTYPENAME>${vchTypeName}</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${voucherNo}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${creditLedger || debitLedger}</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
            <NARRATION>${narration || `${vchTypeName} transaction transferred from Sanmati ERP.`}</NARRATION>
            
            <!-- Debit Ledger -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${debitLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${numAmount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            
            <!-- Credit Ledger -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${creditLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${numAmount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
};

/**
 * Download generated Tally XML file directly
 */
export const downloadTallyXML = (xmlContent, filename = "TallyImport.xml") => {
  const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
