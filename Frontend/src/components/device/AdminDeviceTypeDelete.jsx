import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import useAuth from "../../auth/useAuth";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";


const AdminDeviceTypeDelete = ({ isOpen, onClose, onSuccess }) => {



    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const { logout, token } = useAuth();
    const [errors, setErrors] = useState({});
    const [deviceTypes, setDeviceTypes] = useState([]);
    const [isDeletable, setIsDeletable] = useState(true);


    const quitDelete = () => {
        setDeviceTypeToDelete({
            id: 0,
            name: "",
            deviceCount: 0
        });
        setIsDeletable(true);
        setErrors({});
        onClose();
    }


    const [deviceDeleteConfirm, setDeviceDeleteConfirm] = useState(false);
    const [DeviceTypeToDelete, setDeviceTypeToDelete] = useState({
        id: 0,
        name: "",
        deviceCount: 0

    });



    // const makeNewDevicePOST = async () => {

    //     if (!validateNewDeviceType()) {
    //         return;
    //     };

    //     try {

    //         const isDeviceTypeExist = await validateDeviceTypeUniq(NewDeviceType.name);

    //         if (!isDeviceTypeExist) {
    //             toast.error("Eszköztípus már létezik");
    //             return;
    //         }

    //         const res = await fetch(`${baseUrl}/DeviceType`, {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `Bearer ${token}`,
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify(NewDeviceType)
    //         });

    //         if (res.status === 401) {
    //             logout();
    //             return;
    //         }

    //         if (!res.ok) {
    //             const text = await res.text();
    //             throw new Error(text || 'Hiba a felvitel során');
    //         }

    //         toast.success('Sikeres felvitel.');
    //         if (onSuccess)
    //             await onSuccess();
    //         quitnew();
    //     } catch (err) {
    //         toast.error('Hiba az új eszköz felvitele során: ' + err.message);
    //     }
    // };



    // const validateNewDeviceType = () => {
    //     let newErrors = {};

    //     if (NewDeviceType.name.trim() === '') {
    //         newErrors.name = " Az Új eszköz típusának maegadása kötelező";
    //     }


    //     setErrors(newErrors);

    //     return Object.keys(newErrors).length === 0; // ha nincs hiba → true
    // };

    // const validateDeviceTypeUniq = async (NewDeviceType) => {
    //     try {
    //         const res = await fetch(`${baseUrl}/DeviceType`, {
    //             headers: { Authorization: `Bearer ${token}` },
    //         });

    //         if (res.status === 401) {
    //             Navigate("/");
    //             return false;
    //         }

    //         if (!res.ok) {
    //             throw new Error("Nem sikerült ellenőrizni az eszköztipust.");
    //         }

    //         const data = await res.json();
    //         const exists = data.some(
    //             (item) => item.name?.toLowerCase() === NewDeviceType.trim().toLowerCase()
    //         );

    //         return !exists;
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Hiba az eszköztipus ellenőrzése során.");
    //         return false;
    //     }
    // };

    const deviceTypeDelete = async () => {

        try {
            const res = await fetch(`${baseUrl}/DeviceType/${DeviceTypeToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                logout();
                return;
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }


            toast.success(`A(z) ${DeviceTypeToDelete.id}-es eszköztipus törölve lett.`);
            if (onSuccess)
                await onSuccess();
            quitDelete();
            //Navigate("/devices")
        } catch (err) {
            console.error(err);
            toast.error("Hiba a törlés során: " + err.message);
        }
    };


    useEffect(() => {
        const loadDevicesTypes = async () => {
            try {
                const res = await fetch(
                    `${baseUrl}/DeviceType`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
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
        };
        if (isOpen)
            loadDevicesTypes();
    }, [isOpen]);

    //console.log(deviceDeleteConfirm);

    return (
        <>
            <Modal
                data-testid="delete-type-modal"
                className="custom-modal"
                isOpen={isOpen}
                toggle={quitDelete}
                scrollable
                centered>
                <ModalHeader data-testid="delete-type-modal-header" toggle={quitDelete}>
                    <div data-testid="delete-type-modal-title">Eszköztípus törlése</div>
                </ModalHeader>

                <ModalBody data-testid="delete-type-modal-body">
                    <div className="mb-3">
                        <label htmlFor="manufacturer" className="form-label">Eszköztípus</label>
                        {errors.name && (
                            <small className="text-danger">{errors.name}</small>
                        )}
                        {!isDeletable && (
                            <small className="text-danger">
                                Nem törölhető, mert eszközök vannak hozzárendelve.
                            </small>
                        )}
                        <Input
                            type="select"
                            value={DeviceTypeToDelete.id}
                            onChange={(e) => {
                                const selectedId = Number(e.target.value);
                                const selectedItem = deviceTypes.find(item => item.id === selectedId);

                                setDeviceTypeToDelete({
                                    id: selectedItem.id,
                                    name: selectedItem.name,
                                    deviceCount: selectedItem.deviceCount
                                });
                                setIsDeletable(selectedItem.deviceCount === 0);
                            }}
                        >
                            <option>Válasszon Eszköztipust...</option>
                            {deviceTypes.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}  :  {!item.deviceCount ? "(Törölhető)" : "(Nem törölhető)"}
                                </option>
                            ))}
                        </Input>
                    </div>




                </ModalBody>

                <ModalFooter data-testid="delete-type-modal-footer" className="justify-content-center">
                    <Button data-testid="delete-type-modal-yes-btn" disabled={!DeviceTypeToDelete.id || !isDeletable} className="btn btn-primary-custom" onClick={() => setDeviceDeleteConfirm(true)}>
                        Törlés
                    </Button>
                    <Button data-testid="delete-type-modal-no-btn" className="btn btn-secondary" onClick={quitDelete}>
                        Mégse
                    </Button>
                </ModalFooter>
            </Modal>



            {/* DeviceType DELETE CONFIM */}
            {deviceDeleteConfirm &&
                <Modal
                    data-testid="delete-confirm-type-modal"
                    isOpen={deviceDeleteConfirm}
                    toggle={() => setDeviceDeleteConfirm(false)}
                    centered
                >
                    <ModalHeader data-testid="delete-confirm-type-modal-header">
                        <div data-testid="delete-confirm-type-modal-title">Eszköztipus törlés megerősítése</div>
                    </ModalHeader>

                    <ModalBody data-testid="delete-confirm-type-modal-body">
                        <div>
                            {`Biztosan törölni szeretnéd a(z) "${DeviceTypeToDelete.name}" eszköztípust?`}
                        </div>
                        <div style={{ color: "red" }}>
                            Ez a művelet nem visszavonható!
                        </div>
                    </ModalBody>

                    <ModalFooter data-testid="delete-confirm-type-modal-footer">
                        <Button
                            data-testid="delete-confirm-type-modal-yes-btn"
                            className="btn btn-primary-custom"
                            onClick={async () => {
                                await deviceTypeDelete();
                                setDeviceDeleteConfirm(false);
                            }}
                        >
                            Törlés
                        </Button>

                        <Button
                            data-testid="delete-confirm-type-modal-no-btn"
                            className="btn btn-secondary"
                            onClick={() => setDeviceDeleteConfirm(false)}
                        >
                            Mégse
                        </Button>
                    </ModalFooter>
                </Modal>
            }
            {/* DeviceType DELETE CONFIRM */}
        </>
    )
}

export default AdminDeviceTypeDelete