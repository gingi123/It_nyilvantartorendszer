import { BsDisplay, BsKeyboard, BsLaptop, BsList, BsMouse2, BsPhone, BsUsb } from "react-icons/bs";
import useAuth from "../../auth/useAuth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "reactstrap";

const iconMap = {
    Monitor: { icon: BsDisplay, color: "bg-primary bg-gradient" },
    Billentyűzet: { icon: BsKeyboard, color: "bg-secondary bg-gradient" },
    Egér: { icon: BsMouse2, color: "bg-success bg-gradient" },
    Dokkoló: { icon: BsUsb, color: "bg-danger bg-gradient" },
    Laptop: { icon: BsLaptop, color: "bg-warning bg-gradient" },
    Mobiltelefon: { icon: BsPhone, color: "bg-info bg-gradient" }
}

const UserDashboard = () => {

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const { logout, token } = useAuth();
    const [summaryData, setSummaryData] = useState([]);
    const [lastData, setLastData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const summaryResponse = await fetch(
                    `${baseUrl}/Report/me/device-type-summary`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!summaryResponse.ok) {
                    if (summaryResponse.status === 401) {
                        logout();
                        return;
                    }
                    throw new Error("Summary hiba");
                }

                const summaryJson = await summaryResponse.json();
                setSummaryData(summaryJson);

                const lastResponse = await fetch(
                    `${baseUrl}/Assignment/my/last-five-assignments`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!lastResponse.ok) {
                    if (lastResponse.status === 401) {
                        logout();
                        return;
                    }
                    throw new Error("Last assignments hiba");
                }

                const lastJson = await lastResponse.json();
                setLastData(lastJson);

            } catch (err) {
                console.error("Dashboard fetch error: ", err);
                toast.error("Nem sikerült betölteni az adatokat");
            }
        };

        if (token) {
            fetchData();
        }
    }, [token, logout, baseUrl]);

    return (
        <>
            <h5 data-testid="dashboard-status-title">Hozzám rendelt eszközök</h5>
            <div className="row" data-testid="dashboard-status-cards">
                {summaryData.map((item, index) => {
                    const config = iconMap[item.type] || { icon: "bi-box", color: "bg-dark" };
                    const Icon = config.icon;
                    const targetUrl = `/devices?page=1&count=10&orderBy=id&orderDir=asc&search=${encodeURIComponent(item.type)}`;
                    return (
                        <div key={index} className="col-md-3 mb-3" data-testid={`dashboard-card-${item.type}`}>
                            <Link to={targetUrl} className="text-decoration-none d-block report-card">
                                <div className={`card text-white ${config.color} shadow summary-card`}>
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="fw-bold" data-testid={`dashboard-count-${item.type}`}>{item.count}</h2>
                                            <span data-testid={`dashboard-label-${item.type}`}>{item.type}</span>
                                        </div>
                                        {Icon ? <Icon data-testid={`dashboard-icon-${item.type}`} size={32} /> : null}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div><br />
            <h5 data-testid="dasboard-last-assignments">Utolsó öt mozgás</h5>
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th data-testid="th-id" scope="col">ID</th>
                            <th data-testid="th-name" scope="col">Név</th>
                            <th data-testid="th-serial" scope="col">Sorozatszám</th>
                            <th data-testid="th-type" scope="col">Típus</th>
                            <th data-testid="th-direction" scope="col">Irány</th>
                            <th data-testid="th-date" scope="col">Dátum</th>
                            <th data-testid="th-details" scope="col">Részletek</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            lastData.map((item) => {
                                const detailsUrl = `/dashboard/assignments/user/${item.id}`;
                                return (
                                    <tr key={item.id}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>{item.id}</td>
                                        <td>{item.user}</td>
                                        <td>{item.device_serial}</td>
                                        <td>{item.device_type}</td>
                                        <td>{item.assignment_type === "Assignment" ? "Kiadás" : item.assignment_type === "Return" ? "Visszavétel" : item.assignment_type}</td>
                                        <td>{new Date(item.assignment_date).toLocaleString("hu-HU")}</td>
                                        <td><Button
                                            data-testid="details-btn"
                                            size="sm"
                                            className="btn btn-primary-custom app-btn"
                                            onClick={() => navigate(detailsUrl)}
                                            title="Részletek"><BsList /></Button></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </>
    );
};
export default UserDashboard