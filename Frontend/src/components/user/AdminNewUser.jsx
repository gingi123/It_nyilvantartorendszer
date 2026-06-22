import { useState } from "react";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useAuth from "../../auth/useAuth";

const defaultNewUser = {
    username: "",
    email: "",
    lastName: "",
    firstName: "",
    role: "user",
    passwordHash: "",
};

const roleobj = {
    user: "Felhasználó",
    admin: "Adminisztrátor",
};

const AdminNewUser = ({ isOpen, onClose, onSuccess }) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const { token } = useAuth();
    const navigate = useNavigate();

    const [wholeNewUser, setWholeNewUser] = useState(defaultNewUser);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setWholeNewUser(defaultNewUser);
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose?.();
    };

    const validateNEW = () => {
        const newErrors = {};

        if (wholeNewUser.username.trim().length < 3) {
            newErrors.username = "Felhasználónév minimum 3 karakter";
        }

        if (wholeNewUser.firstName.trim().length < 3) {
            newErrors.firstName = "Keresztnév minimum 3 karakter";
        }

        if (wholeNewUser.lastName.trim().length < 3) {
            newErrors.lastName = "Vezetéknév minimum 3 karakter";
        }

        if (wholeNewUser.passwordHash.trim().length < 3) {
            newErrors.passwordHash = "Jelszó minimum 3 karakter";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(wholeNewUser.email.trim())) {
            newErrors.email = "Hibás email formátum";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateUserName = async (username) => {
        try {
            const res = await fetch(`${baseUrl}/User`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                navigate("/");
                return false;
            }

            if (!res.ok) {
                throw new Error("Nem sikerült ellenőrizni a felhasználónevet.");
            }

            const data = await res.json();
            const exists = data.some(
                (item) => item.username?.toLowerCase() === username.trim().toLowerCase()
            );

            return !exists;
        } catch (err) {
            console.error(err);
            toast.error("Hiba a felhasználónév ellenőrzése során.");
            return false;
        }
    };

    const makeNewUserPOST = async () => {
        if (!validateNEW()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const isUserNameAvailable = await validateUserName(wholeNewUser.username);

            if (!isUserNameAvailable) {
                toast.error("Felhasználónév már létezik");
                return;
            }

            const res = await fetch(`${baseUrl}/User/new-user`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...wholeNewUser,
                    username: wholeNewUser.username.trim(),
                    email: wholeNewUser.email.trim(),
                    lastName: wholeNewUser.lastName.trim(),
                    firstName: wholeNewUser.firstName.trim(),
                    passwordHash: wholeNewUser.passwordHash.trim(),
                }),
            });

            if (res.status === 401) {
                navigate("/");
                return;
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Hiba a felvitel során");
            }

            toast.success("Sikeres felvitel");
            resetForm();
            onSuccess?.();
            onClose?.();
        } catch (err) {
            console.error(err);
            toast.error("Hiba az új felhasználó felvitele során: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal data-testid="profile-new-user-modal" className="custom-modal" isOpen={isOpen} toggle={handleClose} scrollable centered>
            <ModalHeader data-testid="profile-new-user-modal-header" toggle={handleClose}>
                <div data-testid="profile-new-user-modal-title">Új felhasználó rögzítése</div>
            </ModalHeader>

            <ModalBody data-testid="profile-new-user-modal-body">
                <div className="mb-3">
                    <label htmlFor="new-username" className="form-label">
                        Felhasználónév
                    </label>
                    {errors.username && <small className="text-danger d-block">{errors.username}</small>}
                    <Input
                        id="new-username"
                        type="text"
                        value={wholeNewUser.username}
                        onChange={(e) =>
                            setWholeNewUser({ ...wholeNewUser, username: e.target.value })
                        }
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="new-email" className="form-label">
                        Email
                    </label>
                    {errors.email && <small className="text-danger d-block">{errors.email}</small>}
                    <Input
                        id="new-email"
                        type="text"
                        value={wholeNewUser.email}
                        onChange={(e) =>
                            setWholeNewUser({ ...wholeNewUser, email: e.target.value })
                        }
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="new-lastname" className="form-label">
                        Vezetéknév
                    </label>
                    {errors.lastName && <small className="text-danger d-block">{errors.lastName}</small>}
                    <Input
                        id="new-lastname"
                        type="text"
                        value={wholeNewUser.lastName}
                        onChange={(e) =>
                            setWholeNewUser({ ...wholeNewUser, lastName: e.target.value })
                        }
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="new-firstname" className="form-label">
                        Keresztnév
                    </label>
                    {errors.firstName && <small className="text-danger d-block">{errors.firstName}</small>}
                    <Input
                        id="new-firstname"
                        type="text"
                        value={wholeNewUser.firstName}
                        onChange={(e) =>
                            setWholeNewUser({ ...wholeNewUser, firstName: e.target.value })
                        }
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="new-role" className="form-label">
                        Státusz
                    </label>
                    <Input
                        id="new-role"
                        type="select"
                        value={wholeNewUser.role}
                        onChange={(e) =>
                            setWholeNewUser({ ...wholeNewUser, role: e.target.value })
                        }
                    >
                        {Object.entries(roleobj).map(([label, value]) => (
                            <option key={label} value={label}>
                                {value}
                            </option>
                        ))}
                    </Input>
                </div>

                <div className="mb-3">
                    <label htmlFor="new-password" className="form-label">
                        Új jelszó
                    </label>
                    {errors.passwordHash && (
                        <small className="text-danger d-block">{errors.passwordHash}</small>
                    )}
                    <Input
                        id="new-password"
                        type="password"
                        value={wholeNewUser.passwordHash}
                        onChange={(e) =>
                            setWholeNewUser({ ...wholeNewUser, passwordHash: e.target.value })
                        }
                    />
                </div>
            </ModalBody>

            <ModalFooter data-testid="profile-new-user-modal-footer">
                <Button
                    data-testid="profile-new-user-modal-ok-btn"
                    className="btn btn-primary-custom"
                    onClick={makeNewUserPOST}
                    disabled={isSubmitting || wholeNewUser.username === "" || wholeNewUser.email === "" || wholeNewUser.firstName === "" || wholeNewUser.lastName === "" || wholeNewUser.passwordHash === ""}
                >
                    {isSubmitting ? "Rögzítés..." : "Rögzítés"}
                </Button>
                <Button
                    data-testid="profile-new-user-modal-ok-btn"
                    className="btn btn-secondary"
                    onClick={handleClose}
                    disabled={isSubmitting}>
                    Mégse
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default AdminNewUser;