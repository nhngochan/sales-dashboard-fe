import { useState, useEffect, useMemo } from "react";
import StatsCard from "../components/StatsCard";
import Card from "../components/Card";
import LineChartComponent from "../components/LineChartComponent";
import DonutChart from "../components/DonutChart";
import CustomerTable from "../components/CustomerTable";
import RangeSlider from "../components/RangeSlider";

import {
  getStats,
  getCustomerTrend,
  getDistribution,
  getRawSalesDetail,
  type StatsResponse,
  type TrendPoint,
  type DistributionItem,
  type CustomerRecord,
  type SalesDetailRow,
} from "../services/api.ts";

/* ── chart config ───────────────────────────────────────── */

const lineChartLines = [
  { key: "customers", name: "Total Customers", color: "#1a1a2e" },
  { key: "average", name: "Average Per Customer", color: "#22d3ee" },
];

const genderColors = ["#22d3ee", "#facc15", "#64748b"];
const occupationColors = ["#facc15", "#22d3ee", "#1e293b", "#64748b", "#5433ff"];

/* ── helpers ────────────────────────────────────────────── */

function formatShort(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

function formatStat(value: number, prefix = ""): string {
  if (value >= 10000) return `${prefix}${(value / 1000).toFixed(1)}K`;
  if (value >= 1000) return `${prefix}${value.toLocaleString()}`;
  return `${prefix}${value}`;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Extract year from a trend point date string like "January 2021" */
function extractYear(dateStr: string): number {
  const match = dateStr.match(/(\d{4})/);
  return match ? Number(match[1]) : 0;
}

/** Aggregate raw sales-detail rows into per-customer records */
function aggregateCustomers(rows: SalesDetailRow[]): CustomerRecord[] {
  const customerMap = new Map<string, { orders: Set<string>; totalQuantity: number }>();

  for (const row of rows) {
    if (!customerMap.has(row.customerName)) {
      customerMap.set(row.customerName, { orders: new Set(), totalQuantity: 0 });
    }
    const entry = customerMap.get(row.customerName)!;
    if (row.orderNumber) entry.orders.add(row.orderNumber);
    entry.totalQuantity += row.orderQuantity;
  }

  const customers: CustomerRecord[] = [];
  let id = 1;
  for (const [name, data] of customerMap.entries()) {
    customers.push({
      id: id++,
      name,
      orders: data.orders.size,
      revenue: data.totalQuantity,
    });
  }

  customers.sort((a, b) => b.orders - a.orders);
  return customers.slice(0, 100);
}

/** Aggregate rows into a distribution (e.g. by gender or occupation) */
function aggregateDistribution(rows: SalesDetailRow[], field: "gender" | "occupation"): DistributionItem[] {
  const map = new Map<string, Set<string>>();

  for (const row of rows) {
    const key = row[field];
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(row.orderNumber);
  }

  const items: DistributionItem[] = [];
  for (const [name, orderSet] of map.entries()) {
    items.push({ name, value: orderSet.size });
  }

  items.sort((a, b) => b.value - a.value);
  return items;
}

/* ── Dashboard page ─────────────────────────────────────── */

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [gender, setGender] = useState<DistributionItem[]>([]);
  const [occupation, setOccupation] = useState<DistributionItem[]>([]);
  const [rawRows, setRawRows] = useState<SalesDetailRow[]>([]);
  const [hoveredCustomer, setHoveredCustomer] = useState<CustomerRecord | null>(null);

  // Toggle states for chart lines (both start ON = combined view)
  const [showCustomers, setShowCustomers] = useState(true);
  const [showAverage, setShowAverage] = useState(true);

  // Chart-local slider: filters the line chart data range [low, high]
  const [chartYearRange, setChartYearRange] = useState<[number, number]>([2020, 2022]);

  // Global slider: filters the whole page data [low, high]
  const [globalYearRange, setGlobalYearRange] = useState<[number, number]>([2020, 2022]);

  useEffect(() => {
    async function fetchAll() {
      try {
        setError(null);
        const [statsRes, trendRes, distRes, rawRes] = await Promise.all([
          getStats(),
          getCustomerTrend(),
          getDistribution(),
          getRawSalesDetail(),
        ]);

        console.log("[Dashboard] statsRes:", statsRes);
        console.log("[Dashboard] trendRes:", trendRes);
        console.log("[Dashboard] distRes:", distRes);
        console.log("[Dashboard] rawRes rows:", rawRes.length);

        setStats(statsRes);
        setTrend(Array.isArray(trendRes) ? trendRes : []);
        setGender(Array.isArray(distRes.gender) ? distRes.gender : []);
        setOccupation(Array.isArray(distRes.occupation) ? distRes.occupation : []);
        setRawRows(rawRes);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Dashboard] Error fetching dashboard data:", err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Is the global slider at the full range? (no filtering needed)
  const isFullRange = globalYearRange[0] === 2020 && globalYearRange[1] === 2022;

  // ── Filter raw rows by global year range ──
  const filteredRows = useMemo(() => {
    if (isFullRange) return rawRows;
    return rawRows.filter((r) => r.year >= globalYearRange[0] && r.year <= globalYearRange[1]);
  }, [rawRows, globalYearRange, isFullRange]);

  // ── Derived: Customer table (filtered by global year range) ──
  const customers = useMemo(() => aggregateCustomers(filteredRows), [filteredRows]);

  // ── Derived: Gender distribution (filtered by global year range) ──
  const filteredGender = useMemo(() => {
    if (isFullRange) return gender; // use original API data
    return aggregateDistribution(filteredRows, "gender");
  }, [filteredRows, gender, isFullRange]);

  // ── Derived: Occupation distribution (filtered by global year range) ──
  const filteredOccupation = useMemo(() => {
    if (isFullRange) return occupation; // use original API data
    return aggregateDistribution(filteredRows, "occupation");
  }, [filteredRows, occupation, isFullRange]);

  // ── Filter trend data by chart slider ──
  const filteredTrend = useMemo(() => {
    return trend.filter((point) => {
      const year = extractYear(point.date);
      return year >= chartYearRange[0] && year <= chartYearRange[1];
    });
  }, [trend, chartYearRange]);

  // ── Also filter trend data by GLOBAL slider (for the line chart) ──
  const globalFilteredTrend = useMemo(() => {
    // Apply both chart range AND global range
    return trend.filter((point) => {
      const year = extractYear(point.date);
      return year >= globalYearRange[0] && year <= globalYearRange[1]
        && year >= chartYearRange[0] && year <= chartYearRange[1];
    });
  }, [trend, globalYearRange, chartYearRange]);

  // ── Recalculate stats based on global year range ──
  const filteredStats = useMemo(() => {
    if (!stats) return null;

    if (isFullRange) return stats;

    // Calculate from global-filtered trend data
    const globalTrend = trend.filter((point) => {
      const year = extractYear(point.date);
      return year >= globalYearRange[0] && year <= globalYearRange[1];
    });
    const totalCustomers = globalTrend.reduce((sum, p) => sum + p.customers, 0);
    const totalRevenue = globalTrend.reduce((sum, p) => sum + p.average, 0);
    const revenuePerCustomer = totalCustomers > 0
      ? Math.round((totalRevenue / totalCustomers) * 100) / 100
      : 0;

    return {
      customers: totalCustomers,
      revenuePerCustomer,
    };
  }, [stats, globalYearRange, trend, isFullRange]);

  // ── Set initial hovered customer when customers change ──
  useEffect(() => {
    if (customers.length > 0) {
      setHoveredCustomer(customers[0]);
    }
  }, [customers]);

  // Build active lines based on toggle states
  const activeLines = useMemo(() => {
    const lines = [];
    if (showCustomers) lines.push(lineChartLines[0]);
    if (showAverage) lines.push(lineChartLines[1]);
    // If nothing selected, show both (fallback)
    if (lines.length === 0) return lineChartLines;
    return lines;
  }, [showCustomers, showAverage]);

  return (
    <div className="dashboard">
      {/* ── Error Banner ───────────────────────────────────── */}
      {error && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "#dc2626", color: "white", padding: "8px 16px",
          fontSize: "13px", textAlign: "center"
        }}>
          ⚠ API Error: {error} — Check backend connection
        </div>
      )}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="sidebar" style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "20px", gap: "16px" }}>

        <StatsCard
          title="Unique Customers"
          value={filteredStats ? formatStat(filteredStats.customers) : "—"}
          loading={loading}
        />

        <StatsCard
          title="Revenue Per Customer"
          value={filteredStats ? formatCurrency(filteredStats.revenuePerCustomer) : "—"}
          loading={loading}
        />

        <DonutChart
          title="Orders by Gender"
          data={filteredGender}
          colors={genderColors}
          loading={loading}
        />

        <DonutChart
          title="Orders by Occupation"
          data={filteredOccupation}
          colors={occupationColors}
          loading={loading}
        />
      </aside>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="main">
        {/* Line Chart Card */}
        <Card className="chart-section">
          {/* Tab buttons — toggle lines on/off */}
          <div className="chart-tabs">
            <button
              onClick={() => setShowCustomers((prev) => !prev)}
              style={{
                background: showCustomers ? "#1a1a2e" : "white",
                color: showCustomers ? "white" : "#374151",
              }}
            >
              Total Customers
            </button>
            <button
              onClick={() => setShowAverage((prev) => !prev)}
              style={{
                background: showAverage ? "#1a1a2e" : "white",
                color: showAverage ? "white" : "#374151",
              }}
            >
              Average Per Customer
            </button>
          </div>
          <div className="chart-body">
            <LineChartComponent
              data={globalFilteredTrend}
              xKey="date"
              lines={activeLines}
              height={340}
              loading={loading}
            />
          </div>
          {/* Chart-local slider: filters chart date range */}
          <RangeSlider
            min={2020}
            max={2022}
            value={chartYearRange}
            minLabel="2020"
            maxLabel="2022"
            onChange={setChartYearRange}
          />
        </Card>

        {/* Bottom: Table + Detail Panel */}
        <Card className="bottom-section">
          {/* Customer Table — Top 10 sorted by revenue */}
          <div className="table-panel">
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#374151", textAlign: "center", padding: "12px 0 8px", borderBottom: "1px solid #e5e7eb", marginBottom: 0, flexShrink: 0 }}>
              Top 10 Customers
            </h3>
            <CustomerTable
              data={customers}
              onHoverCustomer={setHoveredCustomer}
              loading={loading}
            />
          </div>

          {/* Right Column: Global Slider + Detail Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", minHeight: 0, paddingLeft: "20px" }}>
            {/* Global year filter — filters entire page */}
            <div style={{ padding: "0 16px" }}>
              <RangeSlider
                min={2020}
                max={2022}
                value={globalYearRange}
                minLabel="2020"
                maxLabel="2022"
                onChange={setGlobalYearRange}
              />
            </div>

            {/* Right Detail Panel */}
            <div className="detail-panel" style={{ flex: 1 }}>
              <p className="detail-label">
                Top Customer (by Revenue)
              </p>

              <div className="detail-name-card">
                <p>{hoveredCustomer?.name ?? "—"}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, textAlign: "center" }}>
                <p className="detail-label">Orders</p>
                <p className="detail-label">Revenue</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div className="detail-stat-card">
                  <p>{hoveredCustomer?.orders ?? "—"}</p>
                </div>
                <div className="detail-stat-card">
                  <p>{hoveredCustomer ? formatShort(hoveredCustomer.revenue) : "—"}</p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                <div className="info-icon">i</div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
