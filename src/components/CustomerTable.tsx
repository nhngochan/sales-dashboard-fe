import type { CustomerRecord } from "../services/api";

interface CustomerTableProps {
  data: CustomerRecord[];
  onHoverCustomer: (customer: CustomerRecord) => void;
  loading?: boolean;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

export default function CustomerTable({ data, onHoverCustomer, loading = false }: CustomerTableProps) {
  if (loading) {
    return (
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9ca3af",
        fontSize: "13px"
      }}>
        Loading…
      </div>
    );
  }

  const dataArray = Array.isArray(data) ? data : [];

  // Sort by revenue descending, take top 10
  const sorted = [...dataArray].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  const totalOrders = sorted.reduce((sum, c) => sum + (Number(c.orders) || 0), 0);
  const totalRevenue = sorted.reduce((sum, c) => sum + (Number(c.revenue) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowX: "auto" }}>
        <table className="table-wrapper" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>CustomerKey</th>
              <th>Full Name</th>
              <th style={{ textAlign: "right" }}>Orders</th>
              <th style={{ textAlign: "right" }}>Revenue ▼</th>
            </tr>
          </thead>

          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "#6b7280", padding: "32px 0" }}>
                  No customer records found
                </td>
              </tr>
            ) : (
              sorted.map((customer) => (
                <tr
                  key={customer.id}
                  onMouseEnter={() => onHoverCustomer(customer)}
                >
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td style={{ textAlign: "right" }}>{customer.orders}</td>
                  <td style={{ textAlign: "right", color: "#22d3ee", fontWeight: 600 }}>
                    {formatCurrency(customer.revenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>

          <tfoot style={{ backgroundColor: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
            <tr>
              <td style={{ fontWeight: 600 }}>Total</td>
              <td />
              <td style={{ textAlign: "right", fontWeight: 600 }}>
                {totalOrders.toLocaleString()}
              </td>
              <td style={{ textAlign: "right", fontWeight: 600, color: "#22d3ee" }}>
                {formatCurrency(totalRevenue)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
