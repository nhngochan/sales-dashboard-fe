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

/**
 * Fetches customer stats by combining /overview and /executive-kpis.
 * - totalCustomers comes from the overview endpoint
 * - revenuePerCustomer = totalRevenue / totalCustomers
 */
export async function getStats(): Promise<StatsResponse> {
  const [overviewRes, kpiRes] = await Promise.all([
    api.get("/analytics/overview"),
    api.get("/analytics/executive-kpis"),
  ]);

  const overview = overviewRes.data?.data ?? overviewRes.data ?? {};
  const kpis = kpiRes.data?.data ?? kpiRes.data ?? {};

  const totalCustomers = toNum(overview.totalCustomers);
  const totalRevenue = toNum(kpis.totalRevenue);
  const revenuePerCustomer = totalCustomers > 0
    ? Math.round((totalRevenue / totalCustomers) * 100) / 100
    : 0;

  return {
    customers: totalCustomers,
    revenuePerCustomer,
  };
}

/**
 * Fetches monthly revenue trending as a proxy for customer trend.
 * Uses /revenue-trending?layer=month to show monthly data points.
 */
export async function getCustomerTrend(): Promise<TrendPoint[]> {
  const response = await api.get("/analytics/revenue-trending", {
    params: { layer: "month" },
  });

  const raw = response.data?.data ?? response.data;
  const dataArray = Array.isArray(raw) ? raw : [];

  return dataArray.map((item: Record<string, unknown>) => ({
    date: String(
      item.monthYearLabel ??
      `${item.monthName ?? item.MonthName ?? ""} ${item.year ?? item.Year ?? ""}`
    ).trim(),
    customers: toNum(item.totalCustomers),
    average: toNum(item.totalRevenue),
  }));
}

/**
 * Fetches distribution data using the dedicated income-level and occupation endpoints.
 * - income → /orders-by-income-level (groups by AnnualIncome bracket)
 * - occupation → /orders-by-occupation (groups by customer occupation)
 */
export async function getDistribution(): Promise<DistributionResponse> {
  const [incomeRes, occupationRes] = await Promise.all([
    api.get("/analytics/orders-by-income-level"),
    api.get("/analytics/orders-by-occupation"),
  ]);

  const incomeRaw = incomeRes.data?.data ?? incomeRes.data;
  const occupationRaw = occupationRes.data?.data ?? occupationRes.data;

  const incomeArr = Array.isArray(incomeRaw) ? incomeRaw : [];
  const occupationArr = Array.isArray(occupationRaw) ? occupationRaw : [];

  return {
    income: incomeArr.map((d: Record<string, unknown>) => ({
      name: String(d.incomeLevel ?? d.income_level ?? "Unknown"),
      value: toNum(d.totalOrders ?? d.orders ?? d.count),
    })),
    occupation: occupationArr.map((d: Record<string, unknown>) => ({
      name: String(d.Occupation ?? d.occupation ?? "Unknown"),
      value: toNum(d.orders ?? d.totalOrders ?? d.count),
    })),
  };
}

/**
 * Fetches top customers by aggregating sales-detail rows by customerName.
 * Groups individual order rows into per-customer totals (orders + quantity).
 */
export async function getTopCustomers(): Promise<CustomerRecord[]> {
  const response = await api.get("/analytics/sales-detail", {
    params: { limit: 5000, page: 1 },
  });

  const payload = response.data?.data ?? response.data ?? {};
  const rows = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.rows) ? payload.rows : (Array.isArray(payload) ? payload : []));

  // Aggregate by customerName
  const customerMap = new Map<
    string,
    { orders: Set<string>; totalQuantity: number }
  >();

  for (const row of rows) {
    const name = String(row.customerName ?? row.customer_name ?? "Unknown");
    const orderNum = String(row.orderNumber ?? row.order_number ?? "");
    const qty = toNum(row.orderQuantity ?? row.order_quantity);

    if (!customerMap.has(name)) {
      customerMap.set(name, { orders: new Set(), totalQuantity: 0 });
    }
    const entry = customerMap.get(name)!;
    if (orderNum) entry.orders.add(orderNum);
    entry.totalQuantity += qty;
  }

  // Convert to array, sort by order count descending, take top 100
  const customers: CustomerRecord[] = [];
  let id = 1;
  for (const [name, data] of customerMap.entries()) {
    customers.push({
      id: id++,
      name,
      orders: data.orders.size,
      revenue: data.totalQuantity, // quantity sold (revenue needs price data)
    });
  }

  customers.sort((a, b) => b.orders - a.orders);
  return customers.slice(0, 100);
}
