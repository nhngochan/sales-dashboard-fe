import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ── types ──────────────────────────────────────────────── */

interface LineConfig {
  key: string;
  name: string;
  color: string;
}

interface LineChartComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xKey: string;
  lines: LineConfig[];
  height?: number;
  loading?: boolean;
}

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

/* ── helpers ────────────────────────────────────────────── */

function formatShort(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

function shortenDate(dateStr: string): string {
  const parts = dateStr.split(" ");
  if (parts.length >= 2) {
    return parts[0].substring(0, 3) + " " + parts[parts.length - 1];
  }
  return dateStr;
}

/* ── custom tooltip ─────────────────────────────────────── */

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "8px 12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <p style={{ color: "#6b7280", fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontSize: 13, fontWeight: 600 }}>
          {entry.name}: {formatShort(entry.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

/* ── custom legend ──────────────────────────────────────── */

interface LegendEntry {
  value?: string;
  color?: string;
  type?: string;
}

function CustomLegend({ payload }: { payload?: LegendEntry[] }) {
  if (!payload?.length) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 4 }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: entry.color,
            }}
          />
          <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── main component ─────────────────────────────────────── */

export default function LineChartComponent({
  data,
  xKey,
  lines,
  height = 300,
  loading = false,
}: LineChartComponentProps) {
  if (loading) {
    return (
      <div
        className="bg-white flex items-center justify-center text-gray-400 text-sm"
        style={{ height }}
      >
        Loading chart…
      </div>
    );
  }

  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "13px",
          background: "white",
        }}
      >
        No trend data available
      </div>
    );
  }

  return (
    <div style={{ background: "white" }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={safeData} margin={{ top: 20, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 9, fill: "#6b7280" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            interval={2}
            tickFormatter={(v: string) => shortenDate(v)}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatShort(v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} verticalAlign="top" />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: line.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
