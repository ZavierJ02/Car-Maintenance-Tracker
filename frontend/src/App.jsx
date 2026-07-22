import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
