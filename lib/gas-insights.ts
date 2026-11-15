import type { Purchase } from '@/lib/gas-types'

const DAY_MS = 86_400_000
const AVERAGE_MONTH_DAYS = 30.4375

function dateToUtcDay(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

function historyIntervalDays(purchases: Purchase[]) {
  const dates = purchases
    .map((purchase) => dateToUtcDay(purchase.date))
    .filter(Number.isFinite)
    .sort((left, right) => left - right)
  if (dates.length < 2) return null

  const recentDates = dates.slice(-6)
  const intervals = recentDates.slice(1).map((date, index) => (date - recentDates[index]) / DAY_MS)
  const validIntervals = intervals.filter((interval) => interval > 0 && interval <= 365)
  if (!validIntervals.length) return null

  return validIntervals.reduce((sum, interval) => sum + interval, 0) / validIntervals.length
}

export function getMonthlyConsumption(purchases: Purchase[], frequency: string) {
  const intervalDays = historyIntervalDays(purchases)
  if (intervalDays) return AVERAGE_MONTH_DAYS / intervalDays

  const monthlyMatch = frequency.match(/(\d+(?:[.,]\d+)?)\s+botijas?\s+por\s+mês/i)
  if (monthlyMatch) return Number(monthlyMatch[1].replace(',', '.'))

  const everyMonthsMatch = frequency.match(/1\s+botija\s+a\s+cada\s+(\d+(?:[.,]\d+)?)\s+mes(?:es)?/i)
  if (everyMonthsMatch) return 1 / Number(everyMonthsMatch[1].replace(',', '.'))

  return null
}

export function getRefillEstimate(purchases: Purchase[], frequency: string, today = new Date()) {
  const latestPurchase = [...purchases].sort((left, right) => right.date.localeCompare(left.date))[0]
  if (!latestPurchase) return null

  const intervalDays = historyIntervalDays(purchases) ?? (() => {
    const monthly = getMonthlyConsumption([], frequency)
    return monthly && monthly > 0 ? AVERAGE_MONTH_DAYS / monthly : null
  })()
  if (!intervalDays) return null

  const nextDate = new Date(dateToUtcDay(latestPurchase.date) + Math.round(intervalDays) * DAY_MS)
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const daysUntil = Math.max(0, Math.ceil((nextDate.getTime() - todayDay) / DAY_MS))

  return { date: nextDate, daysUntil, intervalDays: Math.round(intervalDays) }
}

export function getMonthlySpending(purchases: Purchase[], now = new Date()) {
  return Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const amount = purchases.reduce((sum, purchase) => {
      const [purchaseYear, purchaseMonth] = purchase.date.split('-').map(Number)
      return purchaseYear === year && purchaseMonth === month + 1 ? sum + purchase.price : sum
    }, 0)

    return {
      label: new Intl.DateTimeFormat('pt-PT', { month: 'short' }).format(monthDate).replace('.', ''),
      amount,
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
    }
  })
}

export function getDaysSincePurchase(date: string, today = new Date()) {
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.max(0, Math.floor((todayDay - dateToUtcDay(date)) / DAY_MS))
}
