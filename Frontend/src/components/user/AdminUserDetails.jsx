import { useEffect, useState } from "react";
import { BsArrowLeft, BsFileEarmarkCode, BsTrash3 } from "react-icons/bs";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import useAuth from "../../auth/useAuth";
import { toast } from "react-toastify";

const AdminUserDetails = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const [profileData, setProfileData] = useState(null);
    const [showMod, setShowMod] = useState(false);
    const [deleteUSERId, setDeleteUSERId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, token } = useAuth();
    const { id } = useParams();
    const [errors, setErrors] = useState({});
    const [originalUser, setOriginalUser] = useState(null);
    const [roleobj, setRoleObj] = useState({
        'user': 'Felhasználó',
        'admin': 'Adminisztrátor'


    });

    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get("page") || 1;
    const pageSize = searchParams.get("count") || 10;
    const orderBy = searchParams.get("orderBy") || "assignment_date";
    const orderDir = searchParams.get("orderDir") || "desc";
    const search = searchParams.get("search") || "";

    const fetchData = async () => {
        try {
            const res = await fetch(`${baseUrl}/User/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                if (res.status === 401) {
                    logout();
                    return;
                }
                throw new Error("Hiba a kérésben");
            }
            const json = await res.json();
            setProfileData(json);
        } catch (error) {
            console.error("User fetch error: ", error);
            toast.error("Hiba történt az adatok betöltésekor");
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, id, logout, baseUrl]);

    const modUser = (item) => {
        const userData = {
            id: item.id,
            username: item.username,
            email: item.email,
            lastname: item.lastname,
            firstname: item.firstname,
            role: item.role,
            passwordHash: ''
        };

        setNewUser(userData);
        setOriginalUser(userData);
    }

    const isUserChanged = () => {
        if (!originalUser) return false;

        return (
            newUser.username !== originalUser.username ||
            newUser.email !== originalUser.email ||
            newUser.lastname !== originalUser.lastname ||
            newUser.firstname !== originalUser.firstname ||
            newUser.role !== originalUser.role ||
            newUser.passwordHash !== ''
        );
    };

    const quitmod = () => {
        setShowMod(false);
        setNewUser({
            id: 0,
            username: '',
            email: '',
            lastname: '',
            firstname: '',
            role: '',
            passwordHash: ''

        });
        setErrors({});
    };

    const [newUser, setNewUser] = useState({
        id: 0,
        username: '',
        email: '',
        lastname: '',
        firstname: '',
        role: '',
        passwordHash: ''
    });

    const putUser = async () => {

        if (!validateMOD()) {
            return;
        };


        try {
            const res = await fetch(`${baseUrl}/User/${newUser.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });
            if (res.status === 401) {
                navigate('/');
            }
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Hiba a felvitel során');
            }


            toast.success('Sikeres módositás');
            fetchData();
            quitmod();

        } catch (err) {
            toast.error('Hiba a módosítás során: ' + err.message);
            return
        }

    };

    const validateMOD = () => {
        let newErrors = {};

        if (newUser.username.length < 3) {
            newErrors.username = "Felhasználónév minimum 3 karakter";
        }
        if (newUser.firstname.length < 3) {
            newErrors.firstname = "Keresztnév minimum 3 karakter";
        }
        if (newUser.lastname.length < 3) {
            newErrors.lastname = "Vezeték minimum 3 karakter";
        }

        if (newUser.passwordHash && newUser.passwordHash.length < 3) {
            newErrors.passwordHash = "Jelszó minimum 3 karakter";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newUser.email)) {
            newErrors.email = "Hibás email formátum";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0; // ha nincs hiba → true
    };

    const handleUserDelete = async (id) => {


        try {
            const res = await fetch(`${baseUrl}/User/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                navigate('/');
            }
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            toast.success(`A(z) ${id}-es felhasználó törölve lett.`);
            navigate(`/users?page=${page}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}${search ? `&search=${encodeURIComponent(search)}` : ""}`);

        } catch (err) {
            console.error(err);
            toast.error("Hiba a törlés során: " + err.message);
        }
    };

    return (
        <>
            <div className="page" data-testid="profile-page">
                <div className="page-header">
                    <h3 data-testid="profile-details-title">Felhasználó részletek</h3>
                </div>
                <div className="content-card shadow-sm" data-testid="device-content">
                    <div><Button onClick={() => navigate(`/users?page=${page}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}${search ? `&search=${encodeURIComponent(search)}` : ""}`)} className="btn btn-primary-custom app-btn" title="Vissza"><BsArrowLeft data-testid="back-btn" /> Vissza</Button></div>
                    <div className="row justify-content-center">

                        <div className="col-md-6 col-lg-5">

                            <div className="content-card shadow-sm">
                                <div className="card-body">

                                    <h5 className="mb-4 text-center" data-testid="profile-data">Felhasználói adatok</h5>

                                    <div className="row mb-2">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="profile-name">Név</div>
                                        <div className="col-12 col-sm-8">
                                            {profileData?.lastname} {profileData?.firstname}
                                        </div>
                                    </div>

                                    <div className="row mb-2">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="profile-username">Felhasználónév</div>
                                        <div className="col-12 col-sm-8">{profileData?.username}</div>
                                    </div>

                                    <div className="row mb-2">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="profile-email">Email</div>
                                        <div className="col-12 col-sm-8">{profileData?.email}</div>
                                    </div>

                                    <div className="row mb-2">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="profile-role">Szerepkör</div>
                                        <div className="col-12 col-sm-8">{profileData?.role === "user" ? "Felhasználó" : "Admin"}</div>
                                    </div>

                                    <div className="row mb-2">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="profile-createdat">Létrehozva</div>
                                        <div className="col-12 col-sm-8">
                                            {profileData?.createdat ? new Date(profileData.createdat).toLocaleString("hu-HU") : "-"}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="profile-createdat">Szerkesztve</div>
                                        <div className="col-12 col-sm-8">
                                            {profileData?.updatedat ? new Date(profileData.updatedat).toLocaleString("hu-HU") : "-"}
                                        </div>
                                    </div>
                                    <br />
                                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                                        <Button className="btn btn-primary-custom app-btn" title="Módosítás" data-testid="profile-edit-btn"  onClick={() => { setShowMod(true), modUser(profileData) }}><BsFileEarmarkCode className="me-2" />Módosítás</Button>
                                        <Button className="btn btn-dark app-btn" title="Törlés" data-testid="profile-delete-btn"  onClick={() => setDeleteUSERId(profileData.id)}><BsTrash3 className="me-2" />Törlés</Button>
                                    </div>

                                    {/* MOD USER */}
                                    {showMod && (
                                        <>
                                            <Modal data-testid="profile-modify-user-modal" className="custom-modal" isOpen={true} toggle={quitmod} scrollable centered>
                                                <ModalHeader data-testid="profile-modify-user-modal-header" toggle={quitmod}>
                                                    <div data-testid="profile-modify-user-modal-title">Felhasználó módosítása</div>
                                                </ModalHeader>

                                                <ModalBody data-testid="profile-modify-user-modal-body">

                                                    <div className="mb-3">
                                                        <label htmlFor="username" className="form-label">Felhasználónév</label>
                                                        {errors.username && <small className="text-danger">{errors.username}</small>}
                                                        <Input
                                                            value={newUser.username}
                                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                                            id="username"
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="email" className="form-label">Email</label>
                                                        {errors.email && <small className="text-danger">{errors.email}</small>}
                                                        <Input
                                                            value={newUser.email}
                                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                            id="email"
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="lastname" className="form-label">Vezetéknév</label>
                                                        {errors.lastname && <small className="text-danger">{errors.lastname}</small>}
                                                        <Input
                                                            value={newUser.lastname}
                                                            onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })}
                                                            id="lastname"
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="firstname" className="form-label">Keresztnév</label>
                                                        {errors.firstname && <small className="text-danger">{errors.firstname}</small>}
                                                        <Input
                                                            value={newUser.firstname}
                                                            onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })}
                                                            id="firstname"
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="status" className="form-label">Státusz</label>
                                                        <Input
                                                            type="select"
                                                            value={newUser.role}
                                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                                            id="status"
                                                        >
                                                            {Object.entries(roleobj).map(([label, value]) => (
                                                                <option key={value} value={label}>
                                                                    {value}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="password" className="form-label">Új jelszó</label>
                                                        {errors.passwordHash && <small className="text-danger">{errors.passwordHash}</small>}
                                                        <Input
                                                            type="password"
                                                            value={newUser.passwordHash}
                                                            onChange={(e) => setNewUser({ ...newUser, passwordHash: e.target.value })}
                                                            id="password"
                                                        />
                                                    </div>

                                                </ModalBody>

                                                <ModalFooter data-testid="profile-modify-user-modal-footer">
                                                    <Button
                                                        data-testid="profile-modify-user-modal-ok-btn"
                                                        className="btn btn-primary-custom"
                                                        onClick={putUser}
                                                        disabled={!isUserChanged()}
                                                    >
                                                        Mentés
                                                    </Button>

                                                    <Button data-testid="profile-modify-user-modal-no-btn" className="btn btn-secondary" onClick={quitmod}>Mégse</Button>
                                                </ModalFooter>
                                            </Modal>
                                        </>
                                    )}

                                    {/* MOD USER */}

                                    {/* USER DELETE */}
                                    {deleteUSERId && (
                                        <>
                                            <Modal
                                                data-testid="profile-delete-user-modal"
                                                className="custom-modal"
                                                isOpen={deleteUSERId !== null}
                                                toggle={() => setDeleteUSERId(null)}
                                                scrollable
                                                centered>
                                                <ModalHeader data-testid="profile-delete-user-modal-header">
                                                    <div data-testid="profile-delete-user-modal-title">Felhasználó törlése</div>
                                                </ModalHeader>
                                                <ModalBody data-testid="profile-delete-user-modal-body">
                                                    <div>Biztosan törölni szeretné a(z) {profileData?.lastname} {profileData?.firstname} nevű felhasználót?</div>
                                                    <div style={{ color: "red" }}>Ez a művelet nem visszavonható!</div>
                                                </ModalBody>
                                                <ModalFooter data-testid="profile-delete-user-modal-footer">
                                                    <Button className="btn btn-primary-custom" data-testid="profile-delete-user-modal-ok-btn" onClick={() => {
                                                        handleUserDelete(deleteUSERId);
                                                        setDeleteUSERId(null);
                                                    }}>Törlés</Button>
                                                    <Button data-testid="profile-delete-user-modal-no-btn" className="btn btn-secondary" onClick={() => setDeleteUSERId(null)}>Mégsem</Button>
                                                </ModalFooter>
                                            </Modal>
                                        </>
                                    )}
                                    {/* USER DELETE */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default AdminUserDetails