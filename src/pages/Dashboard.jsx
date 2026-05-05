import { Grid, Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getExecutiveKPIs,
  getRevenueTrending,
  getSalesByCategory,
  getCountryStats,
} from "../services/analytics";

import StatCard from "../components/StatCard";
import RevenueChart from "../components/RevenueChart";
import CategoryBar from "../components/CategoryBar";
import CountryTable from "../components/CountryTable";

export default function Dashboard() {
  const [filter, setFilter] = useState({
    layer: "year",
    year: null,
    month: null,
    date: null,
    country: null,
    category: null,
  });

  const { data: kpis, isLoading: kpiLoading } = useQuery({
    queryKey: ["kpis", filter],
    queryFn: () => getExecutiveKPIs(filter),
  });

  const { data: trend = [] } = useQuery({
    queryKey: ["trend", filter],
    queryFn: () => getRevenueTrending(filter),
  });

  const { data: category = [] } = useQuery({
    queryKey: ["category", filter],
    queryFn: () => getSalesByCategory(filter),
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["countries", filter],
    queryFn: () => getCountryStats({ ...filter, limit: 5 }),
  });

  if (kpiLoading) return "Loading...";
  if (!kpis) return "No data";

  // Hàm rút gọn số liệu
  const formatCompact = (num) => {
    if (!num) return "0";
    const n = Number(num);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toLocaleString();
  };

  const currentReturnRate = kpis.totalQuantitySold
    ? ((kpis.totalReturnQuantity / kpis.totalQuantitySold) * 100).toFixed(2)
    : 0;

  return (
    <Box p={2}>
      {/* NÚT RESET FILTER */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          size="small"
          variant="outlined"
          sx={{ color: "#00E5FF", borderColor: "#00E5FF" }}
          onClick={() =>
            setFilter({
              layer: "year",
              year: null,
              month: null,
              date: null,
              category: null,
              country: null,
            })
          }
        >
          Reset
        </Button>
      </Box>

      {/* HEADER KPI CARDS */}
      <Grid container spacing={2} alignItems="center" mb={4}>
        <Grid item xs={2.5} textAlign="center"></Grid>
        <Grid item xs={9.5}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <StatCard
                title="Revenue"
                value={`$${formatCompact(kpis.totalRevenue)}`}
              />
            </Grid>
            <Grid item xs={3}>
              <StatCard
                title="Profit"
                value={`$${formatCompact(kpis.totalProfit)}`}
              />
            </Grid>
            <Grid item xs={3}>
              <StatCard
                title="Orders"
                value={formatCompact(kpis.totalOrders)}
              />
            </Grid>
            <Grid item xs={3}>
              <StatCard title="Return Rate" value={`${currentReturnRate}%`} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* LINE CHART */}
      <Grid item xs={5}>
        <Box sx={{ bgcolor: "background.paper", p: 3, borderRadius: 2 }}>
          <Typography
            variant="subtitle1"
            align="center"
            mb={1}
            color="textSecondary"
          >
            Revenue Trending
          </Typography>
          <RevenueChart data={trend} filter={filter} setFilter={setFilter} />
        </Box>
      </Grid>

      {/* BAR CHART */}
      <Grid item xs={5}>
        <Box sx={{ bgcolor: "background.paper", p: 3, borderRadius: 2 }}>
          <Typography
            variant="subtitle1"
            align="center"
            mb={1}
            color="textSecondary"
          >
            Orders by Category
          </Typography>
          <CategoryBar data={category} filter={filter} setFilter={setFilter} />
        </Box>
      </Grid>

      {/* TABLE */}
      <Box sx={{ mt: 3, bgcolor: "background.paper", p: 3, borderRadius: 2 }}>
        <Typography
          variant="subtitle1"
          align="center"
          mb={2}
          color="textSecondary"
        >
          Top Countries Performance
        </Typography>
        <CountryTable filter={filter} setFilter={setFilter} />
      </Box>
    </Box>
  );
}
