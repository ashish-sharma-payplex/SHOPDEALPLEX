export function formatVariation(type, unit) {
  if (!type) return "";

  const cleanType = String(type).trim();
  const cleanUnit = String(unit || "").trim();

  // Agar type me already letter hai → return same
  if (/[a-zA-Z]/.test(cleanType)) {
    return cleanType;
  }

  // Agar sirf number hai → unit add karo
  return cleanType + cleanUnit;
}