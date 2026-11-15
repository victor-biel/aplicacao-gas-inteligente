'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatEuro } from '@/lib/gas-types'
import type { getMonthlySpending } from '@/lib/gas-insights'

type SpendingMonth = ReturnType<typeof getMonthlySpending>[number]

const chartConfig = {
  amount: { label: 'Gasto', color: 'var(--chart-1)' },
}

export function SpendingChart({ data }: { data: SpendingMonth[] }) {
  const total = data.reduce((sum, month) => sum + month.amount, 0)
  const monthsWithPurchases = data.filter((month) => month.amount > 0).length
  const monthlyAverage = monthsWithPurchases ? total / monthsWithPurchases : 0

  return (
    <section className="spending-panel" aria-labelledby="spending-title">
      <div className="spending-heading">
        <div><span className="mvp-eyebrow">OS TEUS GASTOS</span><h2 id="spending-title">Últimos 6 meses</h2></div>
        <div className="spending-metrics"><div><strong>{formatEuro(total)}</strong><span>total em 6 meses</span></div><div className="spending-average"><strong>{formatEuro(monthlyAverage)}</strong><span>média por mês ativo</span></div></div>
      </div>
      {total > 0 ? <ChartContainer config={chartConfig} className="spending-chart">
        <BarChart accessibilityLayer data={data} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatEuro(Number(value))} />} />
          <Bar dataKey="amount" fill="var(--color-amount)" radius={[5, 5, 1, 1]} maxBarSize={42} />
        </BarChart>
      </ChartContainer> : <div className="spending-empty">Ainda não há compras neste período. Os teus gastos mensais aparecem aqui à medida que registas compras.</div>}
      <p className="spending-caption">Valores calculados apenas a partir das compras que registaste.</p>
    </section>
  )
}
