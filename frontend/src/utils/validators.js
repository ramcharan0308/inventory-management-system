export const required = (msg = "This field is required") => (v) =>
  (v !== undefined && v !== null && String(v).trim() !== "") || msg;

export const minValue = (min, msg) => (v) =>
  Number(v) >= min || (msg ?? `Must be at least ${min}`);

export const maxValue = (max, msg) => (v) =>
  Number(v) <= max || (msg ?? `Must be at most ${max}`);

export const email = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address";

export const positiveNumber = (v) =>
  (Number(v) > 0 && !isNaN(Number(v))) || "Must be a positive number";

export const nonNegativeInt = (v) =>
  (Number.isInteger(Number(v)) && Number(v) >= 0) || "Must be a non-negative whole number";
