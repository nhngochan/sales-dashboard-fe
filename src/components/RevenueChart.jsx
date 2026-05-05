import { LineChart } from '@mui/x-charts/LineChart';

export default function RevenueChart({ data = [], filter, setFilter }) {
  const formatted = data.map((d) => ({
    label: String(
      filter.layer === "year" ? (d.year || d.Year)
      : filter.layer === "month" ? `${d.monthName || d.MonthName} ${d.year || d.Year}` 
      : (d.fullDate || d.full_date)
    ),
    revenue: Number(d.totalRevenue || d.total_revenue || d.Revenue || 0),
    raw: d,
  }));

  const xLabels = formatted.map(item => item.label);
  const seriesData = formatted.map(item => item.revenue);

  const handleMarkClick = (event, itemIdentifier) => {
    const dataIndex = itemIdentifier.dataIndex;
    const payload = formatted[dataIndex]?.raw;
    if (!payload) return;

    if (filter.layer === "year") {
      setFilter((prev) => ({ ...prev, year: payload.year || payload.Year, layer: "month" }));
    } else if (filter.layer === "month") {
      setFilter((prev) => ({ ...prev, month: payload.monthNumber || payload.MonthNumber, layer: "day" }));
    } else if (filter.layer === "day") {
      setFilter((prev) => ({ ...prev, date: payload.fullDate || payload.full_date }));
    }
  };

  const formatMoney = (val) => `$${Number(val).toLocaleString()}`;

  if (xLabels.length === 0) return <div style={{ color: 'gray', marginTop: 20 }}>No data available</div>;

  return (
    <LineChart
      height={250}
      series={[
        {
          data: seriesData,
          color: '#00E5FF',
          valueFormatter: (v) => formatMoney(v),
          showMark: true,
        },
      ]}
      xAxis={[{ scaleType: 'point', data: xLabels }]}
      yAxis={[{ valueFormatter: (v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}` }]}
      onMarkClick={handleMarkClick}
      margin={{ top: 20, bottom: 30, left: 30, right: 30 }}
      sx={{
        '& .MuiLineElement-root': { cursor: 'pointer' },
        '& .MuiMarkElement-root': { cursor: 'pointer' },
      }}
    />
  );
}