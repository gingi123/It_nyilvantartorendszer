import { useLocation, useNavigate, useParams } from "react-router-dom";
import { BsArrowLeft, BsFileEarmarkCode, BsFileEarmarkPdf, BsTrash3 } from "react-icons/bs";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import AssignmentPdf from "./AssignmentPdf";
import useAuth from "../../auth/useAuth";
import { Field, Form, Formik } from "formik";
import AsyncSelect from 'react-select/async';

const AdminAssignmentDetails = () => {

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const [assignmentData, setAssignmentData] = useState(null);
    const { logout, token } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get("page") || 1;
    const pageSize = searchParams.get("count") || 10;
    const orderBy = searchParams.get("orderBy") || "assignment_date";
    const orderDir = searchParams.get("orderDir") || "desc";
    const search = searchParams.get("search") || "";

    const fetchData = async () => {
        try {
            const res = await fetch(`${baseUrl}/Assignment/${id}`, {
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
            setAssignmentData(json);
        } catch (error) {
            console.error("Assignment fetch error: ", error);
            toast.error("Hiba történt az adatok betöltésekor");
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, id, logout, baseUrl]);

    const navigateBack = () => {
        if (location.pathname.startsWith("/dashboard/assignments/")) {
            navigate("/dashboard");
            return;
        }
        if (location.pathname.startsWith("/assignments/")) {
            navigate(`/assignments?page=${page}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}${search ? `&search=${encodeURIComponent(search)}` : ""}`);
            return;
        }
        navigate(-1);
    }

    const confirmReturn = async () => {
        if (!assignmentData?.id) return;

        try {
            const response = await fetch(`${baseUrl}/Assignment/${assignmentData.id}/return`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                }
            );
            const message = await response.text();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }
                toast.error(message || "Sikertelen visszavétel");
                return;
            }
            toast.success(message || "Sikeres visszavétel");
            setShowReturnModal(false);
            fetchData();

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Nem sikerült kapcsolódni a szerverhez");
        }
    }

    const generatePdf = async () => {
        if (!assignmentData) {
            toast.error("Nincs betöltött adat a PDF generáláshoz");
            return;
        }

        try {
            const blob = await pdf(
                <AssignmentPdf assignmentData={assignmentData} />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `jegyzokonyv_${assignmentData.device_inventoryno || assignmentData.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("PDF sikeresen generálva");
        } catch (error) {
            console.error(error);
            toast.error("Nem sikerült a PDF generálása");
        }
    };

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

    const confirmDelete = async () => {
        if (!assignmentData?.id) return;

        try {
            const response = await fetch(`${baseUrl}/Assignment/${assignmentData.id}/delete`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const message = await response.text();

            if (!response.ok) {
                if (response.status === 401) {
                    logout();
                    return;
                }
                toast.error(message || "Sikertelen törlés");
                return;
            }
            toast.success(message || "Sikeres törlés");
            setShowReturnModal(false);
            navigateBack();

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Nem sikerült kapcsolódni a szerverhez");
        }
    };

    return (
        <>
            <div className="page" data-testid="assignment-details-page">
                <div className="page-header">
                    <h3 data-testid="assignment-details-title">Mozgás részletek</h3>
                </div>
                <div className="content-card shadow-sm" data-testid="assignment-details-content">
                    <div><Button onClick={navigateBack} className="btn btn-primary-custom app-btn" title="Vissza" data-testid="back-btn"><BsArrowLeft /> Vissza</Button></div>
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-5">

                            <div className="card shadow-sm">
                                <div className="card-body">

                                    <h5 className="mb-4 text-center" data-testid="assignment-data">Mozgás adatok</h5>

                                    <div className="row mb-2">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="assignment-user">Kiosztva</div>
                                        <div className="col-12 col-sm-8">{assignmentData?.user}</div>
                                    </div>

                                    <div className="row mb-2">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="assignment-manufactorer">Gyártó</div>
                                        <div className="col-12 col-sm-8">{assignmentData?.device_manufacturer}</div>
                                    </div>

                                    <div className="row mb-2">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="assignment-model">Modell</div>
                                        <div className="col-12 col-sm-8">{assignmentData?.device_model}</div>
                                    </div>

                                    <div className="row mb-2">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="assignment-type">Típus</div>
                                        <div className="col-12 col-sm-8">{assignmentData?.device_type}</div>
                                    </div>

                                    <div className="row mb-2">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="assignment-serial">Sorozatszám</div>
                                        <div className="col-12 col-sm-8">{assignmentData?.device_serial}</div>
                                    </div>

                                    <div className="row mb-2">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="assignment-inventoryno">Leltári szám</div>
                                        <div className="col-12 col-sm-8">{assignmentData?.device_inventoryno}</div>
                                    </div>

                                    <div className="row mb-2">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="assignment-direction">Mozgás</div>
                                        <div className="col-12 col-sm-8">{assignmentData?.assignment_type === "Assignment" ? "Kiadás" : "Visszavétel"}</div>
                                    </div>

                                    <div className="row">
                                        <div className="col-12 col-sm-4 fw-bold" data-testid="assignment-date">Dátum</div>
                                        <div className="col-12 col-sm-8">
                                            {assignmentData?.assignment_date ? new Date(assignmentData.assignment_date).toLocaleString("hu-HU") : "-"}
                                        </div>
                                    </div>
                                    <br />

                                </div>
                                <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
                                    {assignmentData?.assignment_type === "Assignment" && <Button className="btn btn-primary-custom app-btn" title="Módosítás" data-testid="assignment-edit-btn" onClick={() => setShowEditModal(true)}>
                                        <BsFileEarmarkCode className="me-2" />Módosítás</Button>}
                                    {assignmentData?.assignment_type === "Assignment" && <Button className="btn btn-dark app-btn" title="Visszavétel" data-testid="assignment-return-btn" onClick={() => setShowReturnModal(true)}>
                                        <BsArrowLeft className="me-2" />Visszavétel</Button>}
                                    <Button className="btn btn-primary-custom app-btn" title="Jegyzőkönyv" data-testid="assignment-pdf-btn" onClick={generatePdf}><BsFileEarmarkPdf className="me-2" /> Jegyzőkönyv</Button>
                                    {assignmentData?.assignment_type === "Assignment" && <Button className="btn btn-dark app-btn" title="Törlés" data-testid="assignment-delete-btn" onClick={() => setShowDeleteModal(true)}>
                                        <BsTrash3 className="me-2" />Törlés</Button>}
                                </div>
                                {showReturnModal && (
                                    <Modal
                                        data-testid="return-modal"
                                        className="custom-modal"
                                        isOpen={showReturnModal}
                                        toggle={() => setShowReturnModal(false)}
                                        scrollable
                                        centered>
                                        <ModalHeader data-testid="return-modal-header" toggle={() => setShowReturnModal(false)}>
                                            <div data-testid="return-modal-title">Eszköz visszavétele</div>
                                        </ModalHeader>
                                        <ModalBody data-testid="return-modal-body">
                                            <div>{`Biztosan vissza szeretné venni a(z) ${assignmentData?.device_inventoryno} leltári számú ${assignmentData?.device_manufacturer}
                                            ${assignmentData?.device_model} ${assignmentData?.device_type} eszközt?`}</div>
                                        </ModalBody>
                                        <ModalFooter data-testid="return-modal-footer">
                                            <Button className="btn btn-primary-custom" data-testid="return-modal-yes-btn" onClick={confirmReturn}>Igen</Button>
                                            <Button className="btn btn-secondary" data-testid="return-modal-no-btn" onClick={() => setShowReturnModal(false)}>Nem</Button>
                                        </ModalFooter>
                                    </Modal>
                                )}
                                {showEditModal && (
                                    <Modal
                                        data-testid="edit-modal"
                                        className="custom-modal"
                                        isOpen={showEditModal}
                                        toggle={() => setShowEditModal(false)}
                                        scrollable
                                        centered>
                                        <ModalHeader data-testid="edit-modal-header" toggle={() => setShowEditModal(false)}>
                                            <div data-testid="edit-modal-title">Mozgás adatok módosítása</div>
                                        </ModalHeader>
                                        <Formik
                                            enableReinitialize
                                            initialValues={{
                                                assignedPerson: assignmentData?.user
                                                    ? {
                                                        value: assignmentData?.userId ?? assignmentData?.user_id ?? null,
                                                        label: assignmentData.user
                                                    }
                                                    : null,
                                                assignedDevice: assignmentData
                                                    ? {
                                                        value:
                                                            assignmentData?.device_id ??
                                                            assignmentData?.deviceId ??
                                                            null,
                                                        label: `${assignmentData?.device_manufacturer || ""} ${assignmentData?.device_model || ""
                                                            } ${assignmentData?.device_inventoryno || ""}`.trim(),
                                                        manufacturer:
                                                            assignmentData?.device_manufacturer || "",
                                                        model: assignmentData?.device_model || "",
                                                        deviceType: assignmentData?.device_type || "",
                                                        serial: assignmentData?.device_serial || "",
                                                        inventoryNo:
                                                            assignmentData?.device_inventoryno || "",
                                                    }
                                                    : null,
                                                manufacturer: assignmentData.device_manufacturer,
                                                model: assignmentData.device_model,
                                                deviceType: assignmentData.device_type,
                                                deviceSn: assignmentData.device_serial,
                                                deviceInvNr: assignmentData.device_inventoryno,
                                            }}
                                            onSubmit={async (values) => {
                                                try {
                                                    if (!values.assignedPerson.value) {
                                                        toast.error("Válassz felhasználót.");
                                                        return;
                                                    }
                                                    if (!values.assignedDevice.value) {
                                                        toast.error("Válassz eszközt.");
                                                        return;
                                                    }

                                                    const payload = {
                                                        userId: Number(values.assignedPerson.value),
                                                        deviceId: Number(values.assignedDevice.value)
                                                    };

                                                    const response = await fetch(`${baseUrl}/Assignment/${assignmentData.id}/edit`, {
                                                        method: "PATCH",
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                            "Content-Type": "application/json"
                                                        },
                                                        body: JSON.stringify(payload)
                                                    });

                                                    if (!response.ok) {
                                                        if (response.status === 401) {
                                                            logout();
                                                            return;
                                                        }
                                                        const errorText = await response.text();
                                                        throw new Error(errorText);
                                                    }

                                                    toast.success("Sikeres mozgás módosítás");
                                                    setShowEditModal(false);
                                                    fetchData();

                                                } catch (error) {
                                                    console.error("Mentési hiba:", error);
                                                    toast.error("Hiba történt mentés közben.");
                                                }
                                            }}
                                        >
                                            {({ values, setFieldValue, isSubmitting, initialValues }) => {
                                                const isChanged =
                                                    values.assignedPerson?.value !== initialValues.assignedPerson?.value ||
                                                    values.assignedDevice?.value !== initialValues.assignedDevice?.value;
                                                return (
                                                    <Form>
                                                        <ModalBody data-testid="edit-modal-body">
                                                            <div className="mb-3">
                                                                <label htmlFor="assignedPerson" className="form-label">Kiosztva</label>
                                                                <AsyncSelect
                                                                    data-testid="edit-modal-user-select"
                                                                    cacheOptions
                                                                    defaultOptions
                                                                    loadOptions={loadUserOptions}
                                                                    noOptionsMessage={() => "Nincs találat"}
                                                                    loadingMessage={() => "Keresés..."}
                                                                    value={values.assignedPerson}
                                                                    onChange={(selectedOption) => setFieldValue("assignedPerson", selectedOption)} />
                                                            </div>
                                                            <div className="mb-3">
                                                                <label htmlFor="manufacturer" className="form-label">Gyártó</label>
                                                                <AsyncSelect
                                                                    data-testid="edit-modal-device-select"
                                                                    inputId="assignedDevice"
                                                                    cacheOptions
                                                                    defaultOptions={false}
                                                                    loadOptions={loadDeviceOptions}
                                                                    noOptionsMessage={() => "Nincs találat"}
                                                                    loadingMessage={() => "Keresés..."}
                                                                    value={values.assignedDevice}
                                                                    formatOptionLabel={(option, { context }) =>
                                                                        context === "menu"
                                                                            ? `${option.manufacturer || ""} ${option.model || ""} ${option.inventoryNo || ""}`.trim()
                                                                            : option.manufacturer || ""
                                                                    }
                                                                    onChange={(selectedOption) => {
                                                                        setFieldValue("assignedDevice", selectedOption);
                                                                        setFieldValue(
                                                                            "manufacturer",
                                                                            selectedOption?.manufacturer || ""
                                                                        );
                                                                        setFieldValue("model", selectedOption?.model || "");
                                                                        setFieldValue(
                                                                            "deviceType",
                                                                            selectedOption?.deviceType || ""
                                                                        );
                                                                        setFieldValue("deviceSn", selectedOption?.serial || "");
                                                                        setFieldValue(
                                                                            "deviceInvNr",
                                                                            selectedOption?.inventoryNo || ""
                                                                        );
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
                                                        <ModalFooter>
                                                            <Button type="submit" data-testid="edit-modal-yes-btn" className="btn btn-primary-custom" disabled={isSubmitting || !isChanged}>Módosít</Button>
                                                            <Button type="button" data-testid="edit-modal-no-btn" onClick={() => setShowEditModal(false)}>Mégsem</Button>
                                                        </ModalFooter>
                                                    </Form>
                                                );
                                            }}
                                        </Formik>
                                    </Modal>
                                )}
                                {showDeleteModal && (
                                    <Modal
                                        data-testid="delete-modal"
                                        className="custom-modal"
                                        isOpen={showDeleteModal}
                                        toggle={() => setShowDeleteModal(false)}
                                        scrollable
                                        centered>
                                        <ModalHeader data-testid="delete-modal-header" toggle={() => setShowDeleteModal(false)}>
                                            <div data-testid="delete-modal-title">Mozgás adatok törlése</div>
                                        </ModalHeader>
                                        <ModalBody data-testid="delete-modal-body">
                                            <div>{`Biztosan törölni szeretné a(z) ${assignmentData.user} nevű felhasználóhoz tartozó ${assignmentData.device_manufacturer} ${assignmentData.device_model} mozgást?`}</div>
                                            <div style={{ color: "red" }}>Ez a művelet nem visszavonható!</div>
                                        </ModalBody>
                                        <ModalFooter data-testid="delete-modal-footer">
                                            <Button className="btn btn-primary-custom" data-testid="delete-modal-yes-btn" onClick={confirmDelete}>Igen</Button>
                                            <Button type="button" className="btn btn-secondary" data-testid="delete-modal-no-btn" onClick={() => setShowDeleteModal(false)}>Nem</Button>
                                        </ModalFooter>
                                    </Modal>
                                )}
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
export default AdminAssignmentDetails