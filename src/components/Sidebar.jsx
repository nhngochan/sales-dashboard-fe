import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    {
      label: "Customer & Product",
      icon: <PeopleIcon />,
      path: "/",
    },
    {
      label: "Executive",
      icon: <DashboardIcon />,
      path: "/sales",
    },
  ];

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
      <Box p={2}>
        <Typography variant="h6" fontWeight={700}>
          Sales Dashboard
        </Typography>
      </Box>

      {/* MENU */}
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
                "&:hover": {
                  bgcolor: "#1e293b",
                },
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
  );
}