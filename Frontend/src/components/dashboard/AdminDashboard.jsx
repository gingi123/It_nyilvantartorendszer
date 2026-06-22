import { BsArrowRight, BsBan, BsCheckCircle, BsList, BsPauseCircle, BsPersonPlus, BsPlusCircle } from "react-icons/bs"
import useAuth from "../../auth/useAuth"
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import AdminNewAssignment from "../assignment/AdminNewAssignment";
import { toast } from "react-toastify";
import AdminNewUser from "../user/AdminNewUser";
import AdminNewDevice from "../device/AdminNewDevice";

const iconMap = {
    assigned: { icon: BsPauseCircle, color: "bg-warning bg-gradient" },
    available: { icon: BsCheckCircle, color: "bg-success bg-gradient" },
    unavailable: { icon: BsBan, color: "bg-danger bg-gradient" }
}

const labels = {
    assigned: "Kiadva",
    available: "Kiadható",
    unavailable: "Nem kiadható"
}

const AdminDashboard = () => {

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const { token, logout } = useAuth();
    const [statusData, setStatusData] = useState([]);
    const [lastData, setLastData] = useState([]);
    const navigate = useNavigate();
    const [showNewAssModal, setShowNewAssModal] = useState(false);
    const [showNewDeviceModal, setShowNewDeviceModal] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pageNumb, setPageNumb] = useState(1);
    const [usersPerPage, setUserPerPage] = useState(10);
    const [users, setUsers] = useState([]);
    const [data, setData] = useState({});

    const fetchData = async () => {
        if (!token) return;
        try {
            const summaryResponse = await fetch(
                `${baseUrl}/Report/status-summary`,
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
            setStatusData(summaryJson);

            const lastResponse = await fetch(
                `${baseUrl}/Assignment/last-five-assignments`,
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

        } catch (error) {
            console.error("Dashboard fetch error:", error);
            toast.error("Hiba történt az adatok betöltésekor");
        }
    };

    const loadUsers = async () => {
        try {
            const res = await fetch(
                `${baseUrl}/User/page-to-page?pageNumb=${pageNumb}&amountperside=${usersPerPage}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.status === 401) {
                navigate('/');
            }
            const data = await res.json();
            setUsers(data.actualUsers);
            setData(data);
        } catch (err) {
            console.error(err);
        }
    };

    const setMyNewUSer = () => {
        setWholeNewUser({

            username: '',
            email: '',
            lastName: '',
            firstName: '',
            role: 'user',
            passwordHash: ''

        });
    };

    const [WholenewUser, setWholeNewUser] = useState({
        username: '',
        email: '',
        lastName: '',
        firstName: '',
        role: 'user',
        passwordHash: ''
    });

    useEffect(() => {
        fetchData();
    }, [token, logout, baseUrl]);

    return (
        <>
            <h5 data-testid="quick-actions-title">Gyors műveletek</h5>
            <div className="d-flex flex-wrap gap-2 mb-4">
                <Button className="btn btn-info app-btn" onClick={() => setShowNewDeviceModal(true)} title="Új eszköz" data-testid="new-device-btn"><BsPlusCircle className="me-2" />Új eszköz</Button>
                <AdminNewDevice isOpen={showNewDeviceModal} onClose={() => setShowNewDeviceModal(false)} />
                <Button className="btn btn-dark app-btn" onClick={() => setShowNewAssModal(true)} title="Új mozgás" data-testid="new-assignment-btn"><BsArrowRight className="me-2" />Új mozgás</Button>
                <AdminNewAssignment isOpen={showNewAssModal} onClose={() => setShowNewAssModal(false)} onSuccess={() => { setShowNewAssModal(false); fetchData() }} />
                <Button onClick={() => { setShowNew(true); setMyNewUSer(); }} className="btn btn-info app-btn" title="Új felhasználó" data-testid="new-user-btn"><BsPersonPlus className="me-2" />Új felhasználó</Button>
                <AdminNewUser
                    isOpen={showNew}
                    onClose={() => setShowNew(false)}
                    onSuccess={loadUsers}
                />
            </div>
            <br />
            <h5 data-testid="dashboard-status-title">Eszközök státusz szerint</h5>
            <div data-testid="dashboard-sum-device-count">Összes eszköz: {statusData.reduce((sum, item) => sum + item.count, 0)}</div>
            <div className="row" data-testid="dashboard-status-cards">
                {statusData.map((item) => {
                    const config = iconMap[item.status] || { icon: null, color: "bg-dark" };
                    const Icon = config.icon;
                    const targetUrl = `/devices?page=1&count=10&orderBy=status&orderDir=asc&search=${encodeURIComponent(item.status)}`;
                    return (
                        <div key={item.status} className="col-md-3 mb-3" data-testid={`dashboard-card-${item.status}`}>
                            <Link to={targetUrl} className="text-decoration-none d-block report-card">
                                <div className={`card text-white ${config.color} shadow summary-card`}>
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="fw-bold" data-testid={`dashboard-count-${item.status}`}>{item.count}</h2>
                                            <span data-testid={`dashboard-label-${item.status}`}>{labels[item.status] ?? item.status}</span>
                                        </div>
                                        {Icon ? <Icon data-testid={`dashboard-icon-${item.status}`} size={32} /> : null}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div ><br />
            <h5 data-testid="dashboard-last-assignments-title">Utolsó öt mozgás</h5>
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
                                const detailUrl = `/dashboard/assignments/admin/${item.id}`;
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
                                            data-testid="assignment-details-btn" 
                                            size="sm"
                                            className="app-btn btn btn-primary-custom"
                                            onClick={() => navigate(detailUrl)}
                                            title="Részletek"><BsList /></Button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}
export default AdminDashboard