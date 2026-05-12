import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from "recharts";

/* ── types ──────────────────────────────────────────────── */

interface DonutDataItem {
  name: string;
  value: number;
}

interface DonutChartProps {
  title: string;
  data: DonutDataItem[];
  colors?: string[];
  loading?: boolean;
}

interface TooltipEntry {
  name?: string;
  value?: number;
}

interface DonutTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  total?: number;
}

/* ── constants ──────────────────────────────────────────── */

const DEFAULT_COLORS = ["#22d3ee", "#64748b", "#facc15", "#1e293b", "#5433ff"];
const RADIAN = Math.PI / 180;

/* ── helpers ────────────────────────────────────────────── */

function formatShort(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

/* ── outside labels ─────────────────────────────────────── */

function renderOuterLabel(props: PieLabelRenderProps) {
  const cx = Number(props.cx ?? 0);
  const cy = Number(props.cy ?? 0);
  const midAngle = Number(props.midAngle ?? 0);
  const outerRadius = Number(props.outerRadius ?? 0);
  const name = String(props.name ?? "");
  const value = Number(props.value ?? 0);

  const radius = outerRadius + 10;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="fill-gray-600"
      style={{ fontSize: 9, fontWeight: 600 }}
    >
      {`${name} ${formatShort(value)}`}
    </text>
  );
}

/* ── tooltip with percentage (factory) ──────────────────── */

function DonutTooltipContent({ active, payload, total = 0 }: DonutTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const val = item.value ?? 0;
  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0";

  return (
    <div className="bg-[#111] border border-gray-700 rounded-lg px-3 py-2 shadow-xl text-sm">
      <p className="text-white font-semibold">{item.name}</p>
      <p className="text-gray-300">{val.toLocaleString()}</p>
      <p className="text-gray-400 text-xs">{pct}%</p>
    </div>
  );
}

/* ── main component ─────────────────────────────────────── */

export default function DonutChart({
  title,
  data,
  colors = DEFAULT_COLORS,
  loading = false,
}: DonutChartProps) {
  if (loading) {
    return (
      <div className="card" style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 14, height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading…
      </div>
    );
  }

  const safeData = Array.isArray(data) ? data : [];
  const isEmpty = safeData.length === 0;
  const chartData = isEmpty ? [{ name: "No Data", value: 1 }] : safeData;
  const chartColors = isEmpty ? ["#374151"] : colors;

  const total = safeData.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  return (
    <div style={{ padding: "12px 4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "transparent" }}>
      {/* Title */}
      <h3 className="text-center text-gray-700 text-xs font-semibold mb-1 w-full">
        {title}
      </h3>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            label={isEmpty ? undefined : renderOuterLabel}
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          {!isEmpty && <Tooltip content={<DonutTooltipContent total={total} />} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
