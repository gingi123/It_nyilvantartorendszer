import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import useAuth from "../../auth/useAuth";

const UserReport = () => {

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { token, logout } = useAuth();
  const COLORS = ["#0a58ca",
    "#084298",
    "#052c65",
    "#031633",
    "#02101f"];
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceManufacturer, setDeviceManufacturer] = useState([]);
  const [assDeviceType, setAssDeviceType] = useState([]);
  const [assDirectionType, setAssDirectionType] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const requests = [
          fetch(`${baseUrl}/Report/me/device-type-report`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseUrl}/Report/me/device-manufacturer-report`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseUrl}/Report/me/assignment-device-type-report`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseUrl}/Report/me/assignment-direction-type-report`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ];

        const responses = await Promise.all(requests);

        for (const res of responses) {
          if (!res.ok) {
            if (res.status === 401) {
              logout();
              return;
            }
            throw new Error("Hiba a lekérésekben");
          }
        }

        const [d1, d2, d3, d4] = await Promise.all(
          responses.map((res) => res.json())
        );

        setDeviceTypes(d1);
        setDeviceManufacturer(d2);
        setAssDeviceType(d3);
        setAssDirectionType(d4);

      } catch (error) {
        console.error("Reports fetch error: ", error);
        toast.error("Hiba történt az adatok betöltésekor");
      }
    };

    fetchData();
  }, [token, baseUrl, logout]);

  const chartWrapperStyle = {
    width: "100%",
    height: 250,
    minWidth: 0,
    overflow: "hidden",
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 576);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <h5 data-testid="report-status-title">Saját riportjaim</h5>
      <div className="container-fluid mt-4">

        <div className="row g-4 mt-1">
          <div className="col-12 col-md-6 col-xl-6">
            <div className="card h-100 shadow-sm report-card">
              <div className="card-body" data-testid="report-card" style={{ minWidth: 0, overflow: "hidden" }}>
                <h6 data-testid="report-by-device-type">Eszközeim típus szerint</h6>
                <div style={chartWrapperStyle}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deviceTypes}
                      margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip formatter={(value) => [`${value}`, "Darab"]} />
                      <Bar dataKey="value" fill="#084298" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-6">
            <div className="card h-100 shadow-sm report-card">
              <div className="card-body" data-testid="report-card" style={{ minWidth: 0, overflow: "hidden" }}>
                <h6 data-testid="report-by-device-manufacturer">Eszközeim gyártó szerint</h6>
                <div style={chartWrapperStyle}>
                  <ResponsiveContainer width="100%" height="100%" key={isMobile ? "mobile" : "desktop"}>
                    <PieChart>
                      <Pie
                        data={deviceManufacturer.map((item, index) => ({
                          ...item,
                          fill: COLORS[index % COLORS.length],
                        }))}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={isMobile ? 40 : 50}
                        outerRadius={isMobile ? 60 : 80}
                        label={!isMobile ? ({ name }) => name : false}
                        labelLine={!isMobile}
                        isAnimationActive={true}
                        animationDuration={500}
                      />
                      <Tooltip formatter={(value, name) => [`${value} db`, name]} />
                      {isMobile && <Legend />}
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-6">
            <div className="card h-100 shadow-sm report-card">
              <div className="card-body" data-testid="report-card" style={{ minWidth: 0, overflow: "hidden" }}>
                <h6 data-testid="report-by-assignment-device-type">Mozgásaim eszköztípus szerint</h6>
                <div style={chartWrapperStyle}>
                  <ResponsiveContainer width="100%" height="100%" key={isMobile ? "mobile" : "desktop"}>
                    <PieChart>
                      <Pie
                        data={assDeviceType.map((item, index) => ({
                          ...item,
                          fill: COLORS[index % COLORS.length],
                        }))}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={isMobile ? 40 : 50}
                        outerRadius={isMobile ? 60 : 80}
                        label={!isMobile ? ({ name }) => name : false}
                        labelLine={!isMobile}
                        isAnimationActive={true}
                        animationDuration={500}
                      />
                      <Tooltip formatter={(value, name) => [`${value} db`, name]} />
                      {isMobile && <Legend />}
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-6">
            <div className="card h-100 shadow-sm report-card">
              <div className="card-body" data-testid="report-card" style={{ minWidth: 0, overflow: "hidden" }}>
                <h6 data-testid="report-by-assignment-direction">Mozgásaim irány szerint</h6>
                <div style={chartWrapperStyle}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={assDirectionType}
                      margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="name"
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip formatter={(value) => [`${value}`, "Darab"]} />
                      <Bar dataKey="value" fill="#1b2e66" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserReport;