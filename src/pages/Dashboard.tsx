import { useState, useEffect } from "react";
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
  getTopCustomers,
  type StatsResponse,
  type TrendPoint,
  type DistributionItem,
  type CustomerRecord,
} from "../services/api";

/* ── chart config ───────────────────────────────────────── */

const lineChartLines = [
  { key: "customers", name: "Total Customers", color: "#1a1a2e" },
  { key: "average", name: "Average Per Customer", color: "#22d3ee" },
];

const incomeColors = ["#22d3ee", "#64748b", "#facc15"];
const occupationColors = ["#facc15", "#22d3ee", "#1e293b"];

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

/* ── Dashboard page ─────────────────────────────────────── */

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [income, setIncome] = useState<DistributionItem[]>([]);
  const [occupation, setOccupation] = useState<DistributionItem[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [hoveredCustomer, setHoveredCustomer] = useState<CustomerRecord | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        setError(null);
        const [statsRes, trendRes, distRes, custRes] = await Promise.all([
          getStats(),
          getCustomerTrend(),
          getDistribution(),
          getTopCustomers(),
        ]);

        console.log("[Dashboard] statsRes:", statsRes);
        console.log("[Dashboard] trendRes:", trendRes);
        console.log("[Dashboard] distRes:", distRes);
        console.log("[Dashboard] custRes:", custRes);

        setStats(statsRes);
        setTrend(Array.isArray(trendRes) ? trendRes : []);
        setIncome(Array.isArray(distRes.income) ? distRes.income : []);
        setOccupation(Array.isArray(distRes.occupation) ? distRes.occupation : []);
        setCustomers(Array.isArray(custRes) ? custRes : []);

        // Only set hovered customer if data exists
        if (Array.isArray(custRes) && custRes.length > 0) {
          setHoveredCustomer(custRes[0]);
        }
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
      {/* ── Icon Rail ─────────────────────────────────────── */}
      <nav className="icon-rail">
        <button aria-label="Back">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        <button aria-label="Grid">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
          </svg>
        </button>
        <button aria-label="Chart">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m6 0V9a2 2 0 012-2h2a2 2 0 012 2v10m6 0v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4" />
          </svg>
        </button>
        <button aria-label="Globe">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10A15 15 0 0112 2z" />
          </svg>
        </button>
        <button aria-label="User" style={{ marginTop: "auto", marginBottom: 12 }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </nav>

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="sidebar">
        <StatsCard
          title="Unique Customers"
          value={stats ? formatStat(stats.customers) : "—"}
          loading={loading}
        />
        <div className="detail-label" style={{ padding: "2px 0" }}>
          Customer Detail Selected
        </div>
        <StatsCard
          title="Revenue Per Customer"
          value={stats ? formatStat(stats.revenuePerCustomer, "$") : "—"}
          loading={loading}
        />
        <DonutChart
          title="Orders by Income Level"
          data={income}
          colors={incomeColors}
          loading={loading}
        />
        <DonutChart
          title="Orders by Occupation"
          data={occupation}
          colors={occupationColors}
          loading={loading}
        />
      </aside>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="main">
        {/* Line Chart Card */}
        <Card className="chart-section">
          <div className="chart-tabs">
            <button>Total Customers</button>
            <button>Average Per Customer</button>
          </div>
          <div className="chart-body">
            <LineChartComponent
              data={trend}
              xKey="date"
              lines={lineChartLines}
              height={340}
              loading={loading}
            />
          </div>
          <RangeSlider min={2020} max={2022} minLabel="2020" maxLabel="2022" />
        </Card>

        {/* Bottom: Table + Detail Panel */}
        <Card className="bottom-section">
          {/* Customer Table */}
          <div className="table-panel">
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#374151", textAlign: "center", padding: "12px 0 8px", borderBottom: "1px solid #e5e7eb", marginBottom: 0, flexShrink: 0 }}>
              Top 100 Customers
            </h3>
            <CustomerTable
              data={customers}
              onHoverCustomer={setHoveredCustomer}
              loading={loading}
            />
          </div>

          {/* Right Column: Slider + Detail Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", minHeight: 0, paddingLeft: "20px" }}>
            {/* Timeline Filter */}
            <div style={{ padding: "0 16px" }}>
              <RangeSlider min={2020} max={2022} minLabel="2020" maxLabel="2022" />
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
