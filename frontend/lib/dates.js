// What `<input type="date">` and the backend's `LocalDate.parse` both speak.
export const iso = (date) => date.toISOString().slice(0, 10);

export const today = () => iso(new Date());

// `setMonth` rolls the 31st of a shorter month forward, which a range does not mind.
export const monthsAgo = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return iso(date);
};

export const rangeOf = (months) => ({ from: monthsAgo(months), to: today() });

export const sameWindow = (a, b) => a?.from === b?.from && a?.to === b?.to;
