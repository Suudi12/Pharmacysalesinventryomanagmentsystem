export function formatMoney(value) {
  const number = Number(value ?? 0);
  return `$${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(value) {
  if (!value) return '\u2014';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '\u2014';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Highlights medicines that are low on stock (<=10) or already expired,
// so the UI can flag them without the backend needing a dedicated endpoint.
export function isLowStock(quantity) {
  return Number(quantity) <= 10;
}

export function isExpired(expiryDate) {
  if (!expiryDate) return false;
  return new Date(expiryDate).getTime() < Date.now();
}
