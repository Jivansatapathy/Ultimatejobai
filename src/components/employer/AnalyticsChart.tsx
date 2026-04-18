import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function AnalyticsChart({
  data,
}: {
  data: Array<{ name: string; applications: number }>;
}) {
  return (
    <ChartContainer
      config={{
        applications: {
          label: "Applications",
          color: "hsl(var(--accent))",
        },
      }}
      className="h-[280px] w-full"
    >
      <BarChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          interval={0}
          tickFormatter={(value: string) => value.slice(0, 12)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="applications" radius={[12, 12, 4, 4]} fill="var(--color-applications)" />
      </BarChart>
    </ChartContainer>
  );
}
