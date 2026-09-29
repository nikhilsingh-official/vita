const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const longDateFormatter = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const monthFormatter = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const longMonthFormatter = new Intl.DateTimeFormat('en-IN', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const moneyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function asUtcDate(date) {
  return new Date(isYearMonth(date) ? `${date}-01T00:00:00Z` : `${date}T00:00:00Z`)
}

function isYearOnly(date) {
  return /^\d{4}$/.test(String(date ?? ''))
}

function isYearMonth(date) {
  return /^\d{4}-\d{2}$/.test(String(date ?? ''))
}

// Dates can be a full day, a month ("2026-02") or just a year ("2023").
function formatDate(date, formatter, monthOnlyFormatter) {
  if (!date) return 'Date not recorded'
  if (isYearOnly(date)) return String(date)

  const parsedDate = asUtcDate(date)
  if (Number.isNaN(parsedDate.getTime())) return 'Date not recorded'
  return (isYearMonth(date) ? monthOnlyFormatter : formatter).format(parsedDate)
}

export function formatShortDate(date) {
  return formatDate(date, dateFormatter, monthFormatter)
}

export function formatLongDate(date) {
  return formatDate(date, longDateFormatter, longMonthFormatter)
}

export function formatMoney(amount, fallback = '-') {
  return amount == null ? fallback : moneyFormatter.format(amount)
}
