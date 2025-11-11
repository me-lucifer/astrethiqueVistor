
"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  money: {
    label: "Money",
    color: "hsl(var(--primary))",
  },
  health: {
    label: "Health",
    color: "hsl(var(--success))",
  },
  work: {
    label: "Work",
    color: "hsl(var(--secondary))",
  },
  love: {
    label: "Love",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

export function MoodChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: -10,
          bottom: 0,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Legend />
        {Object.entries(chartConfig).map(([key, config]) => (
            <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={config.color}
                strokeWidth={2}
                dot={true}
                connectNulls
            />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
