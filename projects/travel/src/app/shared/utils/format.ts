export function formatCurrency(amount: number, currency = 'VND'): string {
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString('vi-VN')} ${currency}`;
  }
}

export function formatDate(value: string | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  if (start && end) return `${formatDate(start)} — ${formatDate(end)}`;
  return formatDate(start || end);
}

export function tripDurationDays(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return null;
  return Math.max(1, Math.round((e - s) / 86_400_000) + 1);
}

export const STATUS_LABEL_VI: Record<string, string> = {
  draft: 'Bản nháp',
  upcoming: 'Sắp đi',
  in_progress: 'Đang đi',
  completed: 'Đã đi qua',
};

export function statusLabel(status: string): string {
  return STATUS_LABEL_VI[status] ?? status;
}
