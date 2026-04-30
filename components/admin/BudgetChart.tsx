"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type Vendor } from "./useVendors";
import { formatCurrency } from "./utils/formatCurrency";

type BudgetChartProps = {
  items: Vendor[];
};

export function BudgetChart({ items }: BudgetChartProps) {
  // Aggregate data by category
  const data = items.reduce((acc, item) => {
    const category = item.category || "otros";
    const existing = acc.find((d) => d.name === category);
    
    // For vendors, we treat costEstimate as the "real" cost if it exists, 
    // and paidAmount as the progress.
    const estimado = item.costEstimate || 0;
    const pagado = item.paidAmount || 0;

    if (existing) {
      existing.estimado += estimado;
      existing.pagado += pagado;
    } else {
      acc.push({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        estimado,
        pagado,
      });
    }
    return acc;
  }, [] as Array<{ name: string; estimado: number; pagado: number }>);

  // Sort by highest estimated cost
  data.sort((a, b) => b.estimado - a.estimado);

  if (data.length === 0) return null;

  return (
    <div className="h-[400px] w-full rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]">
      <h3 className="mb-6 text-lg font-semibold">Desglose por Categoría</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: "var(--color-muted)" }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "var(--color-muted)" }} 
            tickFormatter={(value) => `${value / 1000}k`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            formatter={(value: any) => formatCurrency(Number(value) || 0)}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
          />
          <Bar 
            dataKey="estimado" 
            name="Presupuesto" 
            fill="#94a3b8" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />
          <Bar 
            dataKey="pagado" 
            name="Pagado" 
            fill="#d4a373" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
