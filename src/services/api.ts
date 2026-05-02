import axios from "axios";

/* ── types ──────────────────────────────────────────────── */

export interface StatsResponse {
  customers: number;
  revenuePerCustomer: number;
}

export interface TrendPoint {
  date: string;
  customers: number;
  average: number;
}

export interface DistributionItem {
  name: string;
  value: number;
}

export interface DistributionResponse {
  income: DistributionItem[];
  occupation: DistributionItem[];
}

export interface CustomerRecord {
  id: number;
  name: string;
  orders: number;
  revenue: number;
}

/* ── base config ────────────────────────────────────────── */

export const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  timeout: 15_000,
});

/* ── helper: safely coerce to number ────────────────────── */

function toNum(val: unknown, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

/* ── API functions ──────────────────────────────────────── */

export async function getStats(): Promise<StatsResponse> {
  const response = await api.get("/analytics/customers/stats");
  console.log("[getStats] full response.data:", JSON.stringify(response.data));

  const raw = response.data?.data ?? response.data ?? {};
  console.log("[getStats] unwrapped raw:", JSON.stringify(raw));

  return {
    customers: toNum(raw.customers ?? raw.unique_customers),
    revenuePerCustomer: toNum(raw.revenuePerCustomer ?? raw.revenue_per_customer),
  };
}

export async function getCustomerTrend(): Promise<TrendPoint[]> {
  const response = await api.get("/analytics/customers/trend");
  console.log("[getCustomerTrend] full response.data:", JSON.stringify(response.data));

  const raw = response.data?.data ?? response.data;
  const dataArray = Array.isArray(raw) ? raw : [];
  console.log("[getCustomerTrend] parsed array length:", dataArray.length);

  return dataArray.map((item: Record<string, unknown>) => ({
    date: String(item.date ?? `${item.MonthName ?? ""} ${item.Year ?? ""}`).trim(),
    customers: toNum(item.customers ?? item.unique_customers),
    average: toNum(item.average ?? item.revenue_per_customer),
  }));
}

export async function getDistribution(): Promise<DistributionResponse> {
  const response = await api.get("/analytics/customers/distribution");
  console.log("[getDistribution] full response.data:", JSON.stringify(response.data));

  const raw = response.data?.data ?? response.data ?? {};
  const incomeRaw = Array.isArray(raw.income) ? raw.income : [];
  const occupationRaw = Array.isArray(raw.occupation) ? raw.occupation : [];

  console.log("[getDistribution] income items:", incomeRaw.length, "occupation items:", occupationRaw.length);

  return {
    income: incomeRaw.map((d: Record<string, unknown>) => ({
      name: String(d.name ?? "Unknown"),
      value: toNum(d.value),
    })),
    occupation: occupationRaw.map((d: Record<string, unknown>) => ({
      name: String(d.name ?? "Unknown"),
      value: toNum(d.value),
    })),
  };
}

export async function getTopCustomers(): Promise<CustomerRecord[]> {
  const response = await api.get("/analytics/customers/top", { params: { limit: 100 } });
  console.log("[getTopCustomers] full response.data:", JSON.stringify(response.data));

  const raw = response.data?.data ?? response.data;
  const dataArray = Array.isArray(raw) ? raw : [];
  console.log("[getTopCustomers] parsed array length:", dataArray.length);

  return dataArray.map((item: Record<string, unknown>) => ({
    id: toNum(item.id ?? item.CustomerKey),
    name: String(item.name ?? item.customer_name ?? item.FirstName ?? "Unknown"),
    orders: toNum(item.orders ?? item.total_orders),
    revenue: toNum(item.revenue ?? item.total_revenue),
  }));
}
