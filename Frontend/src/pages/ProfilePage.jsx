import { useEffect, useState } from "react"
import useAuth from "../auth/useAuth";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { ErrorMessage, Field, Formik, Form } from "formik";
import { toast } from "react-toastify";

const ProfilePage = () => {

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const [profileData, setProfileData] = useState(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { logout, token } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${baseUrl}/User/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    if (res.status === 401) logout();
                    throw new Error("Hiba a kérésben");
                }
                const json = await res.json();
                setProfileData(json);
            } catch (error) {
                console.error("Profile fetch error: ", error);
                toast.error("Hiba történt az adatok betöltésekor");
            }
        };
        if (token) {
            fetchData();
        }
    }, [token, logout, baseUrl]);

    return (
        <>
            <div className="page" data-testid="profile-page">
                <header className="page-header">
                    <h3 data-testid="profile-title">Profil</h3>
                </header>
                <div className="content-card shadow-sm" data-testid="profile-content">
                    <div className="row justify-content-center">

                        <div className="col-md-6 col-lg-5">

                            <section className="card shadow-sm" aria-labelledby="profile-data-title">
                                <div className="card-body">

                                    <h5 className="mb-4 text-center" data-testid="profile-data">Felhasználói adatok</h5>
                                    <dl className="mb-0">
                                        <div className="row mb-2">
                                            <dt className="col-12 col-sm-4 fw-bold" data-testid="profile-name">Név</dt>
                                            <dd className="col-12 col-sm-8">
                                                {profileData?.lastname} {profileData?.firstname}
                                            </dd>
                                        </div>

                                        <div className="row mb-2">
                                            <dt className="col-12 col-sm-4 fw-bold" data-testid="profile-username">Felhasználónév</dt>
                                            <dd className="col-12 col-sm-8">{profileData?.username}</dd>
                                        </div>

                                        <div className="row mb-2">
                                            <dt className="col-12 col-sm-4 fw-bold" data-testid="profile-email">Email</dt>
                                            <dd className="col-12 col-sm-8">{profileData?.email}</dd>
                                        </div>

                                        <div className="row mb-2">
                                            <dt className="col-12 col-sm-4 fw-bold" data-testid="profile-role">Szerepkör</dt>
                                            <dd className="col-12 col-sm-8">{profileData?.role === "user" ? "Felhasználó" : "Admin"}</dd>
                                        </div>

                                        <div className="row">
                                            <dt className="col-12 col-sm-4 fw-bold" data-testid="profile-createdat">Létrehozva</dt>
                                            <dd className="col-12 col-sm-8">
                                                {profileData?.createdat ? new Date(profileData.createdat).toLocaleString("hu-HU") : "-"}
                                            </dd>
                                        </div>
                                        <br />
                                        <div className="d-flex justify-content-center mt-3">
                                            <button className="btn btn-primary-custom app-btn" data-testid="profile-password-change-btn" title="Jelszó változtatás" onClick={() => setShowPasswordModal(true)}>
                                                Jelszó változtatás
                                            </button>
                                        </div>

                                        {showPasswordModal && (
                                            <Modal
                                                className="custom-modal"
                                                isOpen={showPasswordModal}
                                                toggle={() => setShowPasswordModal(false)}
                                                scrollable
                                                centered
                                            >
                                                <ModalHeader toggle={() => setShowPasswordModal(false)}>
                                                    Jelszó változtatás
                                                </ModalHeader>

                                                <Formik
                                                    initialValues={{
                                                        currentPassword: "",
                                                        newPassword: "",
                                                        confirmPassword: "",
                                                    }}
                                                    validate={(values) => {
                                                        const errors = {};

                                                        if (!values.currentPassword) {
                                                            errors.currentPassword = "Add meg a jelenlegi jelszót";
                                                        }

                                                        if (!values.newPassword) {
                                                            errors.newPassword = "Add meg az új jelszót";
                                                        } else if (values.newPassword.length < 5) {
                                                            errors.newPassword = "Az új jelszónak legalább 5 karakternek kell lennie";
                                                        }

                                                        if (!values.confirmPassword) {
                                                            errors.confirmPassword = "Erősítsd meg az új jelszót";
                                                        } else if (values.newPassword !== values.confirmPassword) {
                                                            errors.confirmPassword = "A két új jelszó nem egyezik";
                                                        }

                                                        return errors;
                                                    }}
                                                    onSubmit={async (values, { resetForm, setSubmitting, setStatus }) => {
                                                        try {
                                                            setStatus(null);

                                                            const response = await fetch(`${baseUrl}/User/me/password`, {
                                                                method: "PATCH",
                                                                headers: {
                                                                    "Content-Type": "application/json",
                                                                    Authorization: `Bearer ${token}`,
                                                                },
                                                                body: JSON.stringify({
                                                                    currentPassword: values.currentPassword,
                                                                    newPassword: values.newPassword,
                                                                }),
                                                            });

                                                            const text = await response.text();

                                                            let data = null;
                                                            try {
                                                                data = text ? JSON.parse(text) : null;
                                                            } catch (parseError) {
                                                                console.log("JSON parse hiba:", parseError);
                                                            }

                                                            if (!response.ok) {
                                                                const errorMsg = data?.error || text || "Hiba történt a jelszó módosítása közben";
                                                                setStatus(errorMsg);
                                                                return;
                                                            }

                                                            resetForm();
                                                            setShowPasswordModal(false);
                                                            toast.success(data?.message || "A jelszó módosítás megtörtént.");
                                                        } catch (error) {
                                                            console.error("SUBMIT ERROR:", error);
                                                            const errorMsg = "Nem sikerült kapcsolódni a szerverhez";
                                                            toast.error(errorMsg);
                                                        } finally {
                                                            setSubmitting(false);
                                                        }
                                                    }}
                                                >
                                                    {({ isSubmitting, status, values }) => (
                                                        <Form>
                                                            <ModalBody>
                                                                {status && (
                                                                    <div className="alert alert-danger" role="alert">
                                                                        {status}
                                                                    </div>
                                                                )}
                                                                <div className="mb-3">
                                                                    <label htmlFor="currentPassword" className="form-label">Jelenlegi jelszó</label>
                                                                    <Field
                                                                        id="currentPassword"
                                                                        className="form-control"
                                                                        type="password"
                                                                        name="currentPassword"
                                                                    />
                                                                    <ErrorMessage
                                                                        name="currentPassword"
                                                                        component="div"
                                                                        className="text-danger mt-1"
                                                                    />
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label htmlFor="newPassword" className="form-label">Új jelszó</label>
                                                                    <Field
                                                                        id="newPassword"
                                                                        className="form-control"
                                                                        type="password"
                                                                        name="newPassword"
                                                                    />
                                                                    <ErrorMessage
                                                                        name="newPassword"
                                                                        component="div"
                                                                        className="text-danger mt-1"
                                                                    />
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label htmlFor="confirmPassword" className="form-label">Új jelszó megerősítése</label>
                                                                    <Field
                                                                        id="confirmPassword"
                                                                        className="form-control"
                                                                        type="password"
                                                                        name="confirmPassword"
                                                                    />
                                                                    <ErrorMessage
                                                                        name="confirmPassword"
                                                                        component="div"
                                                                        className="text-danger mt-1"
                                                                    />
                                                                </div>
                                                            </ModalBody>

                                                            <ModalFooter>
                                                                <Button
                                                                    type="submit"
                                                                    className="btn btn-primary-custom"
                                                                    disabled={isSubmitting || values.newPassword === "" || values.confirmPassword === ""}
                                                                >
                                                                    {isSubmitting ? "Mentés..." : "Mentés"}
                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    className="btn btn-secondary"
                                                                    onClick={() => setShowPasswordModal(false)}
                                                                    disabled={isSubmitting}
                                                                >
                                                                    Mégse
                                                                </Button>
                                                            </ModalFooter>
                                                        </Form>
                                                    )}
                                                </Formik>
                                            </Modal>
                                        )}
                                    </dl>
                                </div>
                            </section>

                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
export default ProfilePage