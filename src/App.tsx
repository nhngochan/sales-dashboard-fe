import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
// @ts-ignore - JSX module
import SalesDashboard from "./pages/SalesDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "#0f172a" }}>
        <Sidebar />
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<SalesDashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
