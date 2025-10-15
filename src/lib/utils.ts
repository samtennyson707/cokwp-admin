import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


type FormattedDateTime = {
  date: string;         // e.g. "15 Oct 2025"
  time: string;         // e.g. "02:31 PM"
  dateTime: string;     // e.g. "15 Oct 2025, 02:31 PM"
};

export function formatLocalDateTime(
  isoString: string,
  options?: {
    targetTimeZone?: string;   // default 'Asia/Kolkata'
    assumeUTCForNaive?: boolean; // default true: treat "YYYY-...T..." (no Z/offset) as UTC
    locale?: string;            // default 'en-IN'
  }
): FormattedDateTime {
  const {
    targetTimeZone = 'Asia/Kolkata',
    assumeUTCForNaive = true,
    locale = 'en-IN',
  } = options ?? {};

  // detect if string includes timezone info (Z or ±hh:mm)
  const hasTZ = /(?:Z|[+-]\d{2}:\d{2})$/i.test(isoString.trim());

  // If naive (no TZ) and we assume it's UTC, append 'Z' so JS parses it as UTC.
  const normalizedIso = hasTZ
    ? isoString
    : (assumeUTCForNaive ? isoString.trim() + 'Z' : isoString);

  const date = new Date(normalizedIso);

  // Intl formatter for date and time in targetTimeZone
  const dtOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: targetTimeZone,
  };

  const full = date.toLocaleString(locale, dtOptions);

  // split into date & time parts more reliably using Intl.DateTimeFormat
  const datePart = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: targetTimeZone,
  }).format(date);

  const timePart = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: targetTimeZone,
  }).format(date);

  return {
    date: datePart,
    time: timePart,
    dateTime: full,
  };
}

export function getDurationBetween(startIso: string, endIso: string, assumeUTCForNaive = true) {
  // reuse same normalization rule as above for consistency
  const normalize = (s: string) => {
    const hasTZ = /(?:Z|[+-]\d{2}:\d{2})$/i.test(s.trim());
    return hasTZ ? s : (assumeUTCForNaive ? s.trim() + 'Z' : s);
  };

  const diffMs = new Date(normalize(endIso)).getTime() - new Date(normalize(startIso)).getTime();
  if (Number.isNaN(diffMs)) return null;

  const seconds = Math.floor(diffMs / 1000);
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);

  if (hrs > 0) return `${hrs}h ${mins % 60}m ${seconds % 60}s`;
  if (mins > 0) return `${mins}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Formats a date/time input with rich options using Intl APIs.
 * Keeps output split as date, time and combined strings, with optional time zone label.
 */
export type FormatDateTimeInput = {
  locale?: string;
  targetTimeZone?: string;
  hour12?: boolean;
  includeSeconds?: boolean;
  includeWeekday?: boolean;
  timeZoneName?: 'short' | 'long';
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  assumeUTCForNaive?: boolean;
};

export type FormattedDateTimeRich = {
  date: string;
  time: string;
  dateTime: string;
  tzName?: string;
};

function parseToDate(input: string | number | Date, assumeUTCForNaive: boolean = true): Date {
  if (input instanceof Date) return new Date(input.getTime());
  if (typeof input === 'number') return new Date(input);
  const trimmed = input.trim();
  const hasTZ = /(?:Z|[+-]\d{2}:\d{2})$/i.test(trimmed);
  const normalized = hasTZ ? trimmed : (assumeUTCForNaive ? trimmed + 'Z' : trimmed);
  return new Date(normalized);
}

export function formatDateTime(
  input: string | number | Date,
  options?: FormatDateTimeInput,
): FormattedDateTimeRich {
  const {
    locale = 'en-IN',
    targetTimeZone = 'Asia/Kolkata',
    hour12 = true,
    includeSeconds = false,
    includeWeekday = false,
    timeZoneName,
    dateStyle,
    timeStyle,
    assumeUTCForNaive = true,
  } = options ?? {};

  const date = parseToDate(input, assumeUTCForNaive);
  if (Number.isNaN(date.getTime())) {
    return { date: '-', time: '-', dateTime: '-' };
  }

  // Build formatters
  const dateFormatter = new Intl.DateTimeFormat(locale, dateStyle
    ? { dateStyle, timeZone: targetTimeZone, weekday: includeWeekday ? 'short' : undefined }
    : {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: targetTimeZone,
        weekday: includeWeekday ? 'short' : undefined,
      }
  );

  const timeFormatterOptions: Intl.DateTimeFormatOptions = timeStyle
    ? { timeStyle, timeZone: targetTimeZone, hour12, timeZoneName }
    : {
        hour: '2-digit',
        minute: '2-digit',
        second: includeSeconds ? '2-digit' : undefined,
        hour12,
        timeZone: targetTimeZone,
        timeZoneName,
      };
  const timeFormatter = new Intl.DateTimeFormat(locale, timeFormatterOptions);

  const combinedFormatter = new Intl.DateTimeFormat(
    locale,
    dateStyle || timeStyle
      ? { dateStyle: dateStyle ?? 'medium', timeStyle: timeStyle ?? 'short', timeZone: targetTimeZone, hour12, timeZoneName }
      : {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: includeSeconds ? '2-digit' : undefined,
          hour12,
          timeZone: targetTimeZone,
          timeZoneName,
        }
  );

  const dateStr = dateFormatter.format(date);
  const timeStr = timeFormatter.format(date);
  const dateTimeStr = combinedFormatter.format(date);
  const tzName = timeFormatter.formatToParts(date).find((p) => p.type === 'timeZoneName')?.value;

  return { date: dateStr, time: timeStr, dateTime: dateTimeStr, tzName };
}
