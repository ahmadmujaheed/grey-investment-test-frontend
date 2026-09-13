export const sanitizeCurrencyInput = (value) => {
  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "");

  const [integerPart = "", ...decimalParts] = cleaned.split(".");
  const decimalPart = decimalParts.join("").slice(0, 2);
  const hasDecimalPoint = cleaned.includes(".");

  return hasDecimalPoint
    ? `${integerPart}.${decimalPart}`
    : integerPart;
};

export const formatCurrencyInput = (value) => {
  if (value === "" || value === null || value === undefined) return "";

  const sanitized = sanitizeCurrencyInput(value);
  const [integerPart = "", decimalPart] = sanitized.split(".");
  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ",",
  );

  return decimalPart !== undefined
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
};
