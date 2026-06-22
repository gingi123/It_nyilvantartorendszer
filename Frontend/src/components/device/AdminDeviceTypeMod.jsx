import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import useAuth from "../../auth/useAuth";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AdminDeviceTypeMod = ({ isOpen, onClose, onSuccess }) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const { logout, token } = useAuth();

    const [errors, setErrors] = useState({});
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [deviceTypeToMod, setDeviceTypeToMod] = useState({
        id: 0,
        name: ""
    });

    const quitMod = () => {
        setDeviceTypeToMod({
            id: 0,
            name: ""
        });
        setErrors({});
        onClose();
    }

    
    // const validateDeviceMod = () => {
    //     let newErrors = {};
    //     if (deviceTypeToMod.name.trim() === "") {
    //         newErrors.name = "A név megadása kötelező";
    //     }
    //     setErrors(newErrors);
    //     return Object.keys(newErrors).length === 0;
    // }

   
    const putDevice = async () => {
       // if (!validateDeviceMod()) return;

        try {
            const res = await fetch(`${baseUrl}/DeviceType/${deviceTypeToMod.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(deviceTypeToMod)
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Hiba a módosítás során");
            }

            toast.success("Sikeres módosítás");
            if (onSuccess) await onSuccess();
            quitMod();
        } catch (err) {
            toast.error("Hiba a módosítás során: " + err.message);
        }
    }

    
    useEffect(() => {
        const loadDeviceTypes = async () => {
            try {
                const res = await fetch(`${baseUrl}/DeviceType`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.status === 401) {
                    logout();
                    return;
                }

                const data = await res.json();
                setDeviceTypes(data);
            } catch (err) {
                console.error(err);
                toast.error("Hiba történt az eszköztípusok betöltésekor");
            }
        }

        if (isOpen) loadDeviceTypes();
    }, [isOpen]);

    return (
        <>
            <Modal
                data-testid="edit-type-modal"
                className="custom-modal"
                isOpen={isOpen}
                toggle={quitMod}
                scrollable
                centered
            >
                <ModalHeader data-testid="edit-type-modal-header" toggle={quitMod}>
                    <div data-testid="edit-type-modal-title">Eszköztípus módosítása</div>
                </ModalHeader>

                <ModalBody data-testid="edit-type-modal-body">
                    <div className="mb-3">
                        <label className="form-label">Eszköztípus kiválasztása</label>
                        <Input
                            type="select"
                            value={deviceTypeToMod.id}
                            onChange={(e) => {
                                const selectedId = Number(e.target.value);
                                const selectedItem = deviceTypes.find(item => item.id === selectedId);
                                if (selectedItem) {
                                    setDeviceTypeToMod({
                                        id: selectedItem.id,
                                        name: selectedItem.name
                                    });
                                }
                            }}
                        >
                            <option value={0}>Válasszon eszköztípust...</option>
                            {deviceTypes.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </Input>

                        {errors.name && (
                            <small className="text-danger">{errors.name}</small>
                        )}
                    </div>

                    {deviceTypeToMod.id > 0 && (
                        <div className="mb-3">
                            <label className="form-label">Név módosítása</label>
                            <Input
                                type="text"
                                value={deviceTypeToMod.name}
                                onChange={(e) =>
                                    setDeviceTypeToMod({
                                        ...deviceTypeToMod,
                                        name: e.target.value
                                    })
                                }
                            />
                        </div>
                    )}
                </ModalBody>

                <ModalFooter data-testid="edit-type-modal-footer" className="justify-content-center">
                    <Button
                        data-testid="edit-type-modal-yes-btn"
                        disabled={deviceTypeToMod.id === 0 || deviceTypeToMod.name.trim() === ""}
                        className="btn btn-primary-custom"
                        onClick={putDevice}
                    >
                        Mentés
                    </Button>
                    <Button
                        data-testid="edit-type-modal-no-btn"
                        className="btn btn-secondary"
                        onClick={quitMod}>
                        Mégse
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

export default AdminDeviceTypeMod;