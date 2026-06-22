import { Field, Form, Formik } from "formik";
import AsyncSelect from "react-select/async";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import useAuth from "../../auth/useAuth";
import { toast } from "react-toastify";

const AdminNewAssignment = ({ isOpen, onClose }) => {

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const { logout, token } = useAuth();
    const loadUserOptions = async (inputValue) => {
        if (!inputValue || inputValue.trim().length < 3) {
            return [];
        }

        try {
            const response = await fetch(`${baseUrl}/User/search-user?search=${encodeURIComponent(inputValue)}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                return [];
            }

            const usersData = await response.json();

            return usersData;
        } catch (error) {
            console.error("Hiba a felhasználó keresésnél:", error);
            toast.error("Hiba a felhasználó keresésnél");
            return [];
        }
    };

    const loadDeviceOptions = async (inputValue) => {
        if (!inputValue || inputValue.trim().length < 3) {
            return [];
        }
        try {
            const response = await fetch(`${baseUrl}/Device/device-search?search=${encodeURIComponent(inputValue)}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                return [];
            }

            const devicesData = await response.json();

            return devicesData.map((device) => ({
                value: device.value ?? device.id ?? device.deviceId,
                label:
                    device.label ??
                    `${device.manufacturer || device.device_manufacturer || ""} ${device.model || device.device_model || ""} ${device.inventoryNumber || device.inventoryno || device.device_inventoryno || ""}`.trim(),
                manufacturer: device.manufacturer ?? device.device_manufacturer ?? "",
                model: device.model ?? device.device_model ?? "",
                deviceType: device.deviceType ?? device.device_type ?? "",
                serial: device.serialNumber ?? device.serial ?? device.device_serial ?? "",
                inventoryNo: device.inventoryNumber ?? device.inventoryno ?? device.device_inventoryno ?? "",
                raw: device,
            }));
        } catch (error) {
            console.error("Hiba a felhasználó keresésnél:", error);
            toast.error("Hiba a felhasználó keresésnél");
            return [];
        }
    };

    return (
        <>
            <Modal
                data-testid="new-assignment-modal"
                className="custom-modal"
                isOpen={isOpen}
                toggle={onClose}
                scrollable
                centered
                >
                <ModalHeader data-testid="new-assignment-modal-header" toggle={onClose}>
                    <div data-testid="new-assignment-modal-title">Új mozgás rögzítése</div>
                </ModalHeader>
                <Formik
                    initialValues={{
                        assignedPerson: null,
                        assignedDevice: null,
                        manufacturer: null,
                        model: "",
                        deviceType: "",
                        deviceSn: "",
                        deviceInvNr: "",
                    }}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            const payload = {
                                userId: values.assignedPerson?.value ?? null,
                                deviceId: values.assignedDevice?.value ?? null,
                            };

                            if (!payload.userId || !payload.deviceId) {
                                toast.error("A felhasználó és az eszköz kiválasztása kötelező");
                                return;
                            }

                            const response = await fetch(`${baseUrl}/Assignment`, {
                                method: "POST",
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(payload),
                            });

                            if (!response.ok) {
                                const errorText = await response.text();
                                toast.error(errorText || "A rögzítés sikertelen");
                                return;
                            }

                            await response.json();
                            toast.success("Az eszközkiadás sikeresen rögzítve");
                            onClose();
                        } catch (error) {
                            console.error("Hiba a rögzítés során:", error);
                            toast.error("Hiba a rögzítés során");
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ values, setFieldValue }) => (
                        <Form>
                            <ModalBody data-testid="new-assignment-modal-bodí">
                                <div className="mb-3">
                                    <label htmlFor="assignedPerson" className="form-label">Kiosztva</label>
                                    <AsyncSelect
                                        cacheOptions
                                        defaultOptions
                                        loadOptions={loadUserOptions}
                                        noOptionsMessage={() => "Nincs találat"}
                                        loadingMessage={() => "Keresés..."}
                                        placeholder="Felhasználó keresése..."
                                        value={values.assignedPerson}
                                        onChange={(selectedOption) => setFieldValue("assignedPerson", selectedOption)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="manufacturer" className="form-label">Gyártó</label>
                                    <AsyncSelect
                                        inputId="assignedDevice"
                                        cacheOptions
                                        defaultOptions={false}
                                        loadOptions={loadDeviceOptions}
                                        noOptionsMessage={() => "Nincs találat"}
                                        loadingMessage={() => "Keresés..."}
                                        placeholder="Eszköz keresése..."
                                        value={values.assignedDevice}
                                        formatOptionLabel={(option, { context }) =>
                                            context === "menu"
                                                ? `${option.manufacturer || ""} ${option.model || ""} ${option.inventoryNo || ""}`.trim()
                                                : option.label
                                        }
                                        onChange={(selectedOption) => {
                                            setFieldValue("assignedDevice", selectedOption);
                                            setFieldValue("manufacturer", selectedOption?.manufacturer || "");
                                            setFieldValue("model", selectedOption?.model || "");
                                            setFieldValue("deviceType", selectedOption?.deviceType || "");
                                            setFieldValue("deviceSn", selectedOption?.serial || "");
                                            setFieldValue("deviceInvNr", selectedOption?.inventoryNo || "");
                                        }}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="model" className="form-label">Modell</label>
                                    <Field className="form-control" id="model" name="model" type="text" disabled />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="deviceType" className="form-label">Típus</label>
                                    <Field className="form-control" id="deviceType" name="deviceType" type="text" disabled />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="deviceSn" className="form-label">Sorozatszám</label>
                                    <Field className="form-control" id="deviceSn" name="deviceSn" type="text" disabled />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="deviceInvNr" className="form-label">Leltári szám</label>
                                    <Field className="form-control" id="deviceInvNr" name="deviceInvNr" type="text" disabled />
                                </div>
                            </ModalBody>
                            <ModalFooter data-testid="new-assignment-modal-footer">
                                <Button type="submit" className="btn btn-primary-custom" data-testid="new-assignment-modal-yes-btn" disabled={values.assignedPerson === null || values.assignedDevice === null}>Rögzítés</Button>
                                <Button type="button" data-testid="new-assignment-modal-no-btn" onClick={onClose}>Mégse</Button>
                            </ModalFooter>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </>

    )
}
export default AdminNewAssignment