import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import useAuth from "../../auth/useAuth";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AdminNewDevice = ({ isOpen, onClose, onSuccess }) => {

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const { logout, token } = useAuth();
    const [errors, setErrors] = useState({});
    const [deviceTypes, setDeviceTypes] = useState([]);

    const quitnew = () => {
        setWholeNewDevice({
            manufacturer: '',
            model: '',
            serialNumber: '',
            inventoryNumber: '',
            status: 'available',
            deviceTypeid: 1
        });
        setErrors({});
        onClose();
    }

    const [wholeNewDevice, setWholeNewDevice] = useState({

        manufacturer: '',
        model: '',
        serialNumber: '',
        inventoryNumber: '',
        status: 'available',
        deviceTypeid: 1
    });

    const deviceStatus = {
        'available': 'Kiadható',
        'assigned': 'Kiadva',
        'unavailable': 'Nem kiadható'
    };

    const makeNewDevicePOST = async () => {

        if (!validateDeiceNEW()) {
            return;
        };

        try {
            const res = await fetch(`${baseUrl}/Device`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wholeNewDevice)
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
            toast.error('Hiba az új eszköz felvitele során: ' + err.message);
        }
    };

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

    const validateDeiceNEW = () => {
        let newErrors = {};

        if (wholeNewDevice.manufacturer.trim() === '') {
            newErrors.manufacturer = " A gyártó megadása kötelező";
        }
        if (wholeNewDevice.model.trim() === '') {
            newErrors.model = " A modell megadása kötelező";
        }
        if (wholeNewDevice.serialNumber.trim() === '') {
            newErrors.serialNumber = " A sorozatszám megadása kötelező";
        }
        if (wholeNewDevice.inventoryNumber.trim() === '') {
            newErrors.inventoryNumber = " A leltári szám megadása kötelező";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0; // ha nincs hiba → true
    };

    useEffect(() => {
        if (isOpen)
            loadDevicesTypes();
    }, [isOpen]);

    return (
        <>
            <Modal
                data-testid="new-device-modal"
                className="custom-modal"
                isOpen={isOpen}
                toggle={quitnew}
                scrollable
                centered>
                <ModalHeader data-testid="new-device-modal-header" toggle={quitnew}>
                    <div data-testid="new-device-modal-title">Új eszköz rögzítése</div>
                </ModalHeader>

                <ModalBody data-testid="new-device-modal-body">
                    <div className="mb-3">
                        <label htmlFor="manufacturer" className="form-label">Gyártó</label>
                        {errors.manufacturer && (
                            <small className="text-danger">{errors.manufacturer}</small>
                        )}
                        <Input
                            value={wholeNewDevice.manufacturer}
                            onChange={(e) =>
                                setWholeNewDevice({
                                    ...wholeNewDevice,
                                    manufacturer: e.target.value
                                })
                            }
                            type="text"
                            id="manufacturer"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="model" className="form-label">Modell</label>
                        {errors.model && (
                            <small className="text-danger">{errors.model}</small>
                        )}
                        <Input
                            value={wholeNewDevice.model}
                            onChange={(e) =>
                                setWholeNewDevice({
                                    ...wholeNewDevice,
                                    model: e.target.value
                                })
                            }
                            type="text"
                            id="model"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="serialnumber" className="form-label">Sorozatszám</label>
                        {errors.serialNumber && (
                            <small className="text-danger">{errors.serialNumber}</small>
                        )}
                        <Input
                            value={wholeNewDevice.serialNumber}
                            onChange={(e) =>
                                setWholeNewDevice({
                                    ...wholeNewDevice,
                                    serialNumber: e.target.value
                                })
                            }
                            type="text"
                            id="serialnumber"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="inventorynumber" className="form-label">
                            Leltári szám
                        </label>
                        {errors.inventoryNumber && (
                            <small className="text-danger">{errors.inventoryNumber}</small>
                        )}
                        <Input
                            value={wholeNewDevice.inventoryNumber}
                            onChange={(e) =>
                                setWholeNewDevice({
                                    ...wholeNewDevice,
                                    inventoryNumber: e.target.value
                                })
                            }
                            type="text"
                            id="inventorynumber"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Eszköz típus</label>
                        <Input
                            type="select"
                            value={wholeNewDevice.deviceTypeid}
                            onChange={(e) =>
                                setWholeNewDevice({
                                    ...wholeNewDevice,
                                    deviceTypeid: Number(e.target.value)
                                })
                            }
                        >
                            {deviceTypes.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </Input>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Státusz</label>
                        <Input
                            type="select"
                            value={wholeNewDevice.status}
                            onChange={(e) =>
                                setWholeNewDevice({
                                    ...wholeNewDevice,
                                    status: e.target.value
                                })
                            }
                        >
                            {Object.entries(deviceStatus).map(([label, value]) => (
                                <option key={value} value={label}>
                                    {value}
                                </option>
                            ))}
                        </Input>
                    </div>
                </ModalBody>

                <ModalFooter data-testid="new-device-modal-footer" className="justify-content-center">
                    <Button
                        data-testid="new-device-modal-yes-btn"
                        className="btn btn-primary-custom"
                        onClick={makeNewDevicePOST}
                        disabled={wholeNewDevice.manufacturer === "" || wholeNewDevice.model === "" || wholeNewDevice.serialNumber === "" || wholeNewDevice.inventoryNumber === ""}>
                        Rögzítés
                    </Button>
                    <Button
                        data-testid="new-device-modal-no-btn"
                        className="btn btn-secondary"
                        onClick={quitnew}>
                        Mégse
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    )
}
export default AdminNewDevice