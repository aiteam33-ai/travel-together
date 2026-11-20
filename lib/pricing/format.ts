// Formats paise as Indian-grouped rupees, e.g. 11550000 -> "₹1,15,500"
export function formatRupees(paise: number): string {
  const rupees = Math.round(paise / 100);
  const sign = rupees < 0 ? "-" : "";
  const abs = Math.abs(rupees);
  const str = abs.toString();
  let formatted: string;
  if (str.length <= 3) {
    formatted = str;
  } else {
    const last3 = str.slice(-3);
    const rest = str.slice(0, -3);
    const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    formatted = `${grouped},${last3}`;
  }
  return `${sign}₹${formatted}`;
}

export function formatLakh(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 1e7) return `₹${(rupees / 1e7).toFixed(2)} crore`;
  if (rupees >= 1e5) return `₹${(rupees / 1e5).toFixed(2)} lakh`;
  return formatRupees(paise);
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

const IST_DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export function formatDateIST(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return IST_DATE_FORMATTER.format(d);
}
