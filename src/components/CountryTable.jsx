import { DataGrid } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { getCountryStats } from "../services/analytics";

export default function CountryTable({ filter, setFilter }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["country-stats", filter],
    queryFn: () => getCountryStats({ ...filter, limit: 5 }),
  });

  const columns = [
    { field: "country", headerName: "Country", flex: 1 },
    { field: "orders", headerName: "Orders", flex: 1 },
    {
      field: "revenue",
      headerName: "Revenue",
      flex: 1,
      valueFormatter: (val) => {
        const v =
          typeof val === "object" && val !== null && "value" in val
            ? val.value
            : val;
        return `$${Number(v || 0).toLocaleString()}`;
      },
    },
    {
      field: "returnRate",
      headerName: "Return Rate",
      flex: 1,
      valueFormatter: (val) => {
        const v =
          typeof val === "object" && val !== null && "value" in val
            ? val.value
            : val;
        return `${v || 0}%`;
      },
    },
  ];

  const handleRowClick = (params) => {
    const clickedCountry = params.row.country;
    setFilter((prev) => ({
      ...prev,
      country: prev.country === clickedCountry ? null : clickedCountry,
    }));
  };

  return (
    <DataGrid
      rows={data}
      columns={columns}
      getRowId={(row) => row.country}
      loading={isLoading}
      autoHeight
      onRowClick={handleRowClick}
      hideFooter={true}
      sx={{ cursor: "pointer", border: "none" }}
    />
  );
}
