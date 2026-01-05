import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Calendar } from "lucide-react";
import type { TimelinePoint } from "@/types/analysis";

interface TimelineDensityProps {
  timelineData: TimelinePoint[];
}

export function TimelineDensity({ timelineData }: TimelineDensityProps) {
  if (!timelineData || timelineData.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Review Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No date information available for timeline analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate average for detecting bursts
  const avgCount = timelineData.reduce((sum, d) => sum + d.count, 0) / timelineData.length;
  const threshold = avgCount * 2;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} review{payload[0].value !== 1 ? 's' : ''}
          </p>
          {payload[0].value > threshold && (
            <p className="text-xs text-risk-medium mt-1">Above average density</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Review Timeline Density
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] sm:h-[200px] w-full -ml-2 sm:ml-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timelineData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {timelineData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count > threshold ? 'hsl(var(--risk-medium))' : 'hsl(var(--primary))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-primary shrink-0" />
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-risk-medium shrink-0" />
            <span>Above avg (burst)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
