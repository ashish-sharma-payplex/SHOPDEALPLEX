// src/components/home/module-wise-components/utility/Help_Support/dispositionConstants.js

export const dispositions = [
  { code: "D11", name: "Payment successful but service not received" },
  { code: "D12", name: "Payment successful but service disconnected" },
  { code: "D13", name: "Late payment charge added after payment" },
  { code: "D21", name: "Paid to the wrong account / consumer number" },
  { code: "D22", name: "Duplicate payment made" },
  { code: "D23", name: "Paid the wrong amount" },
  { code: "D31", name: "Payment information not received by biller" },
  { code: "D32", name: "Bill paid but amount not adjusted / still showing due" },
];

// Code se name resolve karne ke liye
export const DISPOSITION_MAP = Object.fromEntries(
  dispositions.map((d) => [d.code, d.name])
);