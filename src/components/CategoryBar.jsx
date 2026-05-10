import { BarChart } from "@mui/x-charts/BarChart";

export default function CategoryBar({ data = [], filter, setFilter }) {
  const formattedData = data.map((d) => ({
    name: d.categoryName || d.CategoryName || "Unknown",
    orders: Number(d.totalOrders || d.total_orders || d.Orders || 0),
    raw: d,
  }));

  const yLabels = formattedData.map((item) => item.name);
  const seriesData = formattedData.map((item) => item.orders);

  const handleItemClick = (event, itemIdentifier) => {
    const dataIndex = itemIdentifier.dataIndex;
    const categoryName = formattedData[dataIndex]?.name;
    if (!categoryName) return;

    setFilter((prev) => ({
      ...prev,
      category: prev.category === categoryName ? null : categoryName,
    }));
  };

  if (yLabels.length === 0)
    return (
      <div style={{ color: "gray", marginTop: 20 }}>No data available</div>
    );

  return (
    <BarChart
      height={250}
      layout="horizontal"
      series={[
        {
          data: seriesData,
        },
      ]}
      yAxis={[
        {
          scaleType: "band",
          data: yLabels,
          tickLabelStyle: {
            fontSize: 12,
          },
          colorMap: {
            type: "ordinal",
            values: yLabels, 
            colors: ["#00E5FF", "#FFB74D", "#BA68C8", "#4DB6AC"],
          },
        },
      ]}
      margin={{ top: 20, bottom: 30, left: 80, right: 80 }}
      onItemClick={handleItemClick}
      sx={{
        "& .MuiBarElement-root": { cursor: "pointer" },
      }}
    />
  );
}
