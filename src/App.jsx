import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
// import CustomerProduct from "./pages/CustomerProduct";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        
        {/* Sidebar */}
        <Sidebar/>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* <Route path="/customer-product" element={<CustomerProduct />} /> */}
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}