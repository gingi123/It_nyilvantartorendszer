import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import useAuth from "../../auth/useAuth";
import {  useState } from "react";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";

const AdminDeviceTypeNew = ({ isOpen, onClose, onSuccess }) => {


    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const { logout, token } = useAuth();
    const [errors, setErrors] = useState({});
    //const [deviceTypes, setDeviceTypes] = useState([]);
    

        const quitnew = () => {
        setNewDeviceType({
            name : ""
        });
        setErrors({});
        onClose();
    }



    const [NewDeviceType, setNewDeviceType] = useState({

       name : ""
    });



     const makeNewDevicePOST = async () => {

        if (!validateNewDeviceType()) {
            return;
        };

        try {

            const isDeviceTypeExist = await validateDeviceTypeUniq(NewDeviceType.name);

            if (!isDeviceTypeExist) {
                toast.error("Eszköztípus már létezik");
                return;
            }

            const res = await fetch(`${baseUrl}/DeviceType`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(NewDeviceType)
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Hiba a felvitel során');
            }

            toast.success('Sikeres felvitel.');
            if (onSuccess)
                await onSuccess();
            quitnew();
        } catch (err) {
            toast.error('Hiba az új eszköztipus felvitele során: ' + err.message);
        }
    };

    // const loadDevicesTypes = async () => {
    //     try {
    //         const res = await fetch(
    //             `${baseUrl}/DeviceType`,
    //             { headers: { Authorization: `Bearer ${token}` } }
    //         );
    //         if (res.status === 401) {
    //             logout();
    //             return;
    //         }
    //         const data = await res.json();
    //         setDeviceTypes(data);

    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Hiba történt az eszköztípusok betöltésekor");
    //     }
    // };

    const validateNewDeviceType = () => {
        let newErrors = {};

        if (NewDeviceType.name.trim() === '') {
            newErrors.name = " Az új eszköztípus megadása kötelező";
        }
      

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0; // ha nincs hiba → true
    };

    const validateDeviceTypeUniq = async (NewDeviceType) => {
        try {
            const res = await fetch(`${baseUrl}/DeviceType`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                Navigate("/");
                return false;
            }

            if (!res.ok) {
                throw new Error("Nem sikerült ellenőrizni az eszköztipust.");
            }

            const data = await res.json();
            const exists = data.some(
                (item) => item.name?.toLowerCase() === NewDeviceType.trim().toLowerCase()
            );

            return !exists;
        } catch (err) {
            console.error(err);
            toast.error("Hiba az eszköztipus ellenőrzése során.");
            return false;
        }
    };


    // useEffect(() => {
    //     if (isOpen)
    //         //loadDevicesTypes();
    // }, [isOpen]);

    //console.log(NewDeviceType);
    return (
        <>
            <Modal
                data-testid="new-type-modal"
                className="custom-modal"
                isOpen={isOpen}
                toggle={quitnew}
                scrollable
                centered>
                <ModalHeader data-testid="new-type-modal-header" toggle={quitnew}>
                    <div data-testid="new-type-modal-title">Új eszköztípus rögzítése</div>
                </ModalHeader>

                <ModalBody data-testid="new-type-modal-body">
                    <div className="mb-3">
                        <label htmlFor="manufacturer" className="form-label">Új eszköztípus</label>
                        {errors.name && (
                            <small className="text-danger">{errors.name}</small>
                        )}
                        <Input
                            value={NewDeviceType.name}
                            onChange={(e) =>
                                setNewDeviceType({
                                    ...NewDeviceType,
                                    name: e.target.value
                                })
                            }
                            type="text"
                            id="manufacturer"
                        />
                    </div>

            

                    
                </ModalBody>

                <ModalFooter data-testid="new-type-modal-footer" className="justify-content-center">
                    <Button
                        data-testid="new-type-modal-yes-btn"
                        className="btn btn-primary-custom"
                        disabled={NewDeviceType.name === ""}
                        onClick={makeNewDevicePOST}>
                        Rögzítés
                    </Button>
                    <Button
                        data-testid="new-type-modal-no-btn"
                        className="btn btn-secondary"
                        onClick={quitnew}>
                        Mégse
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    )
}

export default AdminDeviceTypeNew