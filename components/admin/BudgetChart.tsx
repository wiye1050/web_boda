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
import type { BudgetItem } from "./useBudget";
import { formatCurrency } from "./utils/formatCurrency";

type BudgetChartProps = {
  items: BudgetItem[];
};

export function BudgetChart({ items }: BudgetChartProps) {
  // Aggregate data by category
  const data = items.reduce((acc, item) => {
    const category = item.category || "Otros";
    const existing = acc.find((d) => d.name === category);
    
    if (existing) {
      existing.estimado += item.estimate || 0;
      existing.real += item.actual || 0;
    } else {
      acc.push({
        name: category,
        estimado: item.estimate || 0,
        real: item.actual || 0,
      });
    }
    return acc;
  }, [] as Array<{ name: string; estimado: number; real: number }>);

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
            formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
          />
          <Bar 
            dataKey="estimado" 
            name="Estimado" 
            fill="#94a3b8" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />
          <Bar 
            dataKey="real" 
            name="Real (Comprometido)" 
            fill="#d4a373" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
