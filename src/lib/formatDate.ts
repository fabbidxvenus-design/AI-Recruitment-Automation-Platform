type AppLocale = 'vi' | 'en';

function toIntlLocale(locale: AppLocale): string {
  return locale === 'vi' ? 'vi-VN' : 'en-US';
}

export function formatDate(value: string | Date, locale: AppLocale, options?: Intl.DateTimeFormatOptions): string {
  return new Date(value).toLocaleDateString(toIntlLocale(locale), options);
}

export function formatTime(value: string | Date, locale: AppLocale, options?: Intl.DateTimeFormatOptions): string {
  return new Date(value).toLocaleTimeString(toIntlLocale(locale), options);
}

export function formatDateTime(value: string | Date, locale: AppLocale): string {
  return new Date(value).toLocaleString(toIntlLocale(locale));
}

export function formatNumber(value: number, locale: AppLocale): string {
  return value.toLocaleString(toIntlLocale(locale));
}
