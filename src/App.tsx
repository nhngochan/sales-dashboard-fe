import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
import CustomerDashboard from "./pages/CustomerDashboard";
import ExecutiveDashboard from "./pages/ExecutiveDashboard.jsx";
import { useState } from "react";

export default function App() {
  const [filter, setFilter] = useState({
    layer: "year",
    year: null,
    month: null,
    date: null,
    category: null,
    country: null,
  });
  return (
    <BrowserRouter>
      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#f3f4f6",
        }}
      >
        <Sidebar setFilter={setFilter}/>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <Routes>
            <Route path="/" element={<CustomerDashboard />} />
            <Route path="/sales" element={<ExecutiveDashboard filter={filter} setFilter={setFilter}/>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}