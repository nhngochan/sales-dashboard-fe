import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useNavigate, useLocation } from "react-router-dom";


export default function Sidebar({ setFilter }) { 
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    {
      label: "Executive",
      icon: <DashboardIcon />,
      path: "/sales",
    },
    {
      label: "Customer & Product",
      icon: <PeopleIcon />,
      path: "/",
    },
  ];

  const handleReset = () => {
    if (typeof setFilter === 'function') {
      setFilter({
        layer: "year",
        year: null,
        month: null,
        date: null,
        category: null,
        country: null,
      });
    }
  };

  return (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        bgcolor: "#0f172a",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #1e293b",
      }}
    >
      {/* LOGO */}
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", ml: 3 }}>
          Dashboard
        </Typography>
      </Box>

      {/* MENU */}
      <Box sx={{ flexGrow: 1 }}>
        <List>
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: active ? "#1e293b" : "transparent",
                  "&:hover": { bgcolor: "#1e293b" },
                }}
              >
                <ListItemIcon sx={{ color: "#00E5FF" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* NÚT RESET*/}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ bgcolor: "#1e293b", mb: 2 }} />
        <ListItemButton
          onClick={handleReset}
          sx={{
            borderRadius: 2,
            bgcolor: "rgba(0, 229, 255, 0.05)",
            "&:hover": {
              bgcolor: "rgba(0, 229, 255, 0.15)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#00E5FF" }}>
            <RestartAltIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Reset Filters" 
            primaryTypographyProps={{ fontSize: '14px', fontWeight: 'bold' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}