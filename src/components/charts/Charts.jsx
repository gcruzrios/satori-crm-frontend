import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/states';
import { useChartTheme, tooltipProps } from './chartTheme';

export function ChartCard({ title, description, children, action }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
          {description && (
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

const axisTick = (t) => ({ fill: t.axis, fontSize: 11 });

/** Single-series vertical bar chart. data: [{ label, value }] */
export function SeriesBarChart({ data, height = 260, valueName = 'Total', horizontal = false }) {
  const t = useChartTheme();
  if (!data?.length) return <EmptyState title="Sin datos" />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 4, right: 8, bottom: 4, left: horizontal ? 8 : 0 }}
        barCategoryGap="28%"
      >
        <CartesianGrid
          stroke={t.grid}
          horizontal={!horizontal}
          vertical={horizontal}
        />
        {horizontal ? (
          <>
            <XAxis type="number" tick={axisTick(t)} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="label"
              tick={axisTick(t)}
              axisLine={false}
              tickLine={false}
              width={120}
            />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tick={axisTick(t)} axisLine={false} tickLine={false} interval={0} angle={-12} textAnchor="end" height={48} />
            <YAxis tick={axisTick(t)} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
          </>
        )}
        <Tooltip {...tooltipProps(t)} />
        <Bar
          dataKey="value"
          name={valueName}
          fill={t.series}
          radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          maxBarSize={horizontal ? 22 : 40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Single-series line chart. data: [{ label, value }] */
export function SeriesLineChart({ data, height = 260, valueName = 'Total' }) {
  const t = useChartTheme();
  if (!data?.length) return <EmptyState title="Sin datos" />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
        <CartesianGrid stroke={t.grid} vertical={false} />
        <XAxis dataKey="label" tick={axisTick(t)} axisLine={false} tickLine={false} />
        <YAxis tick={axisTick(t)} axisLine={false} tickLine={false} width={48} />
        <Tooltip {...tooltipProps(t)} />
        <Line
          type="monotone"
          dataKey="value"
          name={valueName}
          stroke={t.series}
          strokeWidth={2}
          dot={{ r: 3, fill: t.series }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
