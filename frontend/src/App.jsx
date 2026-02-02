import React, { useState, useEffect } from "react";
import { MysqlService } from "./services/mysqlService";
import PublicHeader from "./components/PublicHeader";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import DataReportPage from "./pages/Dashboard/DataReportPage";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("hydro_user") || "null"),
  );

  const [waterData, setWaterData] = useState([]);
  const [rainData, setRainData] = useState([]);
  const [damData, setDamData] = useState([]);

  const fetchData = async () => {
    try {
      const [wData, rData, dData] = await Promise.all([
        MysqlService.getAllReports(),
        MysqlService.getRainReports(),
        MysqlService.getDamReports(),
      ]);
      setWaterData(wData || []);
      setRainData(rData || []);
      setDamData(dData || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem("hydro_user", JSON.stringify(newUser));
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("hydro_user", JSON.stringify(userData));
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("hydro_user");
    setCurrentPage("login");
  };

  if (currentPage === "dashboard" && user) {
    return (
      <DashboardLayout
        user={user}
        onLogout={handleLogout}
        onGoHome={() => setCurrentPage("home")}
        waterData={waterData}
        rainData={rainData}
        damData={damData}
        refreshData={fetchData}
        onUpdateUser={handleUpdateUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans print:bg-white">
      <PublicHeader setCurrentPage={setCurrentPage} user={user} />
      
      {/* 🔴 แก้ตรงนี้จ้ะ: ลบ print:hidden ออก เปลี่ยนเป็น print:p-0 */}
      <main className="pt-6 pb-12 print:p-0 print:pt-0"> 
        
        {currentPage === "home" && (
          <HomePage
            waterData={waterData}
            rainData={rainData}
            damData={damData}
          />
        )}
        
        {currentPage === "report" && (
          // ✅ ตรงนี้ถูกแล้วจ้ะ (เอา animate-fade-in ออกแล้ว)
          <div className="w-full ">
            <DataReportPage
              waterData={waterData}
              rainData={rainData}
              damData={damData}
            />
          </div>
        )}

        {currentPage === "about" && <AboutPage />}
        {currentPage === "login" && <LoginPage onLogin={handleLogin} />}
      </main>

      <footer className="bg-white border-t py-8 text-center text-gray-500 text-sm print:hidden">
        <p>&copy; 2026 HydroMonitor System. All rights reserved.</p>
      </footer>
    </div>
  );
}