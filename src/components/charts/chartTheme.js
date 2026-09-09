import { useTheme } from '@/hooks/useTheme';

/**
 * Chart tokens. Dashboard charts are all single-series, so we only need one
 * data hue (blue, from the validated reference palette) plus recessive
 * grid/axis/text tokens — no categorical palette / CVD concerns.
 */
export function useChartTheme() {
  const { isDark } = useTheme();
  return {
    series: isDark ? '#3987e5' : '#2a78d6',
    seriesSoft: isDark ? 'rgba(57,135,229,0.18)' : 'rgba(42,120,214,0.14)',
    grid: isDark ? 'rgba(255,255,255,0.08)' : '#f2f4f7',
    axis: isDark ? '#98a2b3' : '#98a2b3',
    text: isDark ? '#c3c2b7' : '#52514e',
    surface: isDark ? '#1a2231' : '#ffffff',
    border: isDark ? '#1d2939' : '#e4e7ec',
  };
}

/** Shared <Tooltip> style props. */
export function tooltipProps(t) {
  return {
    cursor: { fill: t.seriesSoft },
    contentStyle: {
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      fontSize: 12,
      color: t.text,
      boxShadow: '0px 4px 8px -2px rgba(16,24,40,0.1)',
    },
    labelStyle: { color: t.text, fontWeight: 600, marginBottom: 4 },
  };
}
