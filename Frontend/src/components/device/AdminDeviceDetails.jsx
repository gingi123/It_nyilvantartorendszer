import { useEffect, useState } from "react";
import { BsArrowLeft, BsFileEarmarkCode, BsFileEarmarkDiff, BsFileEarmarkImage, BsFileEarmarkPdf, BsTrash3 } from "react-icons/bs"
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"
import useAuth from "../../auth/useAuth";
import { toast } from "react-toastify";

const AdminDeviceDetails = () => {

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const fileBaseUrl = baseUrl.replace("/api", "");
  const navigate = useNavigate();
  const [deviceData, setDeviceData] = useState(null);
  const [showMOD, setShowMOD] = useState(false);
  const [showFileMod, setShowFileMod] = useState(false);
  const [errors, setErrors] = useState({});
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [originalDevice, setOriginalDevice] = useState(null);
  const [deleteDeviceId, setDeleteDeviceId] = useState(null);
  const { logout, token } = useAuth();
  const location = useLocation();
  const { id } = useParams();
  const [isSavingFiles, setIsSavingFiles] = useState(false);
  const [files, setFiles] = useState({
    userGuide: null,
    invoice: null,
    warranty: null,
    picture: null,
  });

  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get("page") || 1;
  const pageSize = searchParams.get("count") || 10;
  const orderBy = searchParams.get("orderBy") || "assignment_date";
  const orderDir = searchParams.get("orderDir") || "desc";
  const search = searchParams.get("search") || "";

  const fetchData = async () => {
    try {
      const res = await fetch(`${baseUrl}/Device/${id}`, {
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
      setDeviceData(json);
    } catch (error) {
      console.error("User fetch error: ", error);
      toast.error("Hiba történt az adatok betöltésekor");
    }
  };

  const modDevice = (item) => {
    const deviceData = {
      id: item.id,
      manufacturer: item.manufacturer,
      model: item.model,
      serialNumber: item.serialNumber,
      inventoryNumber: item.inventoryNumber,
      status: item.status,
      deviceTypeid: item.deviceTypeid
    };

    setNewDevice(deviceData);
    setOriginalDevice(deviceData);
  };

  const quitmod = () => {
    setShowMOD(false);
    setOriginalDevice(null);
    setNewDevice({
      id: 0,
      manufacturer: '',
      model: '',
      serialNumber: '',
      inventoryNumber: '',
      status: '',
      deviceTypeid: 0
    });
    setErrors({});
  };

  const [newDevice, setNewDevice] = useState({
    id: 0,
    manufacturer: '',
    model: '',
    serialNumber: '',
    inventoryNumber: '',
    status: '',
    deviceTypeid: 0
  });

  const [deviceStatus, setDeviceStatus] = useState({
    'available': 'Kiadható',
    'assigned': 'Kiadva',
    'unavailable': 'Nem kiadható'

  });

  const putdevice = async () => {
    if (!validateDeiceMOD()) {
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/Device/${newDevice.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDevice)
      });
      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Hiba a felvitel során');
      }

      toast.success('Sikeres Módositás');
      await fetchData();
      quitmod();
    } catch (err) {
      toast.error('Hiba a módosítás során: ' + err.message);
    }
  };

  const isDeviceChanged = () => {
    if (!originalDevice) return false;

    return (
      newDevice.manufacturer !== originalDevice.manufacturer ||
      newDevice.model !== originalDevice.model ||
      newDevice.serialNumber !== originalDevice.serialNumber ||
      newDevice.inventoryNumber !== originalDevice.inventoryNumber ||
      newDevice.status !== originalDevice.status ||
      newDevice.deviceTypeid !== originalDevice.deviceTypeid
    );
  };

  const validateDeiceMOD = () => {
    let newErrors = {};

    if (newDevice.manufacturer === '') {
      newErrors.manufacturer = "A Gyártó megadása kötelező";
    }
    if (newDevice.model === '') {
      newErrors.model = "A model megadása kötelező";
    }
    if (newDevice.serialNumber === '') {
      newErrors.serialNumber = "A szériaszám megadása kötelező";
    }
    if (newDevice.inventoryNumber === '') {
      newErrors.inventoryNumber = "A leltáriszám megadása kötelező";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // ha nincs hiba → true
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

  const handleDelete = async (id) => {

    try {
      const res = await fetch(`${baseUrl}/Device/${id}`, {
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


      toast.success(`A(z) ${id}-es eszköz törölve lett.`);
      setDeleteDeviceId(null);
      navigate(`/devices?page=${page}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}${search ? `&search=${encodeURIComponent(search)}` : ""}`);
    } catch (err) {
      console.error(err);
      toast.error("Hiba a törlés során: " + err.message);
    }
  };

  const handleFileChange = (e) => {
    const { id, files: selectedFiles } = e.target;

    setFiles(prev => ({
      ...prev,
      [id]: selectedFiles[0] || null,
    }));
  };

  const handleRemoveSelected = (key) => {
    setFiles(prev => ({
      ...prev,
      [key]: null,
    }));

    const input = document.getElementById(key);
    if (input) input.value = "";
  };

  const hasAnyFileSelected = () =>
    !!(files.userGuide || files.invoice || files.warranty || files.picture);

  const openFileModal = () => {
    setFiles({
      userGuide: null,
      invoice: null,
      warranty: null,
      picture: null,
    });
    setShowFileMod(true);
  };

  const handleSubmit = async () => {
    if (isSavingFiles) return;

    try {
      setIsSavingFiles(true);
      const formData = new FormData();

      formData.append("deviceId", deviceData.id);

      if (files.userGuide) formData.append("userGuide", files.userGuide);
      if (files.invoice) formData.append("invoice", files.invoice);
      if (files.warranty) formData.append("warranty", files.warranty);
      if (files.picture) formData.append("picture", files.picture);

      if (!hasAnyFileSelected()) {
        toast.info("Nincs kiválasztott fájl.");
        return;
      }

      const response = await fetch(`${baseUrl}/DeviceFile/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Sikertelen mentés.");
      }

      await response.json();

      toast.success("Fájlok sikeresen mentve.");

      setFiles({
        userGuide: null,
        invoice: null,
        warranty: null,
        picture: null,
      });

      await fetchData();
      setShowFileMod(false);
    } catch (err) {
      toast.error("Hiba a mentés során: " + err.message);
    } finally {
      setIsSavingFiles(false);
    }
  };

  const handleFileRemove = async (key) => {
    try {
      if (files[key]) {
        handleRemoveSelected(key);
        return;
      }

      const savedFilePath = getSavedFilePath(key);
      if (!savedFilePath) {
        toast.info("Nincs törölhető fájl.");
        return;
      }

      const backendFileType = getBackendFileType(key);

      const response = await fetch(`${baseUrl}/DeviceFile/${deviceData.id}/${backendFileType}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Nem sikerült törölni a fájlt.");
      }

      toast.success("Fájl törölve.");
      await fetchData();
    } catch (err) {
      toast.error("Hiba a fájl törlése során: " + err.message);
    }
  };

  const getSavedFilePath = (key) => {
    switch (key) {
      case "userGuide":
        return deviceData?.userGuide || null;
      case "invoice":
        return deviceData?.invoice || null;
      case "warranty":
        return deviceData?.warranty || null;
      case "picture":
        return deviceData?.picture || null;
      default:
        return null;
    }
  };

  const getBackendFileType = (key) => {
    switch (key) {
      case "userGuide":
        return "user_guide";
      case "invoice":
        return "invoice";
      case "warranty":
        return "warranty";
      case "picture":
        return "picture";
      default:
        return "";
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
      loadDevicesTypes();
    }
  }, [token, id, logout, baseUrl]);

  return (
    <>
      <div className="page" data-testid="device-page">
        <div className="page-header">
          <h3 data-testid="device-page-title">Eszköz részletek</h3>
        </div>
        <div className="content-card shadow-sm" data-testid="device-content">
          <div><Button data-testid="back-btn" onClick={() => navigate(`/devices?page=${page}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}${search ? `&search=${encodeURIComponent(search)}` : ""}`)} className="btn btn-primary-custom app-btn" title="Vissza"><BsArrowLeft /> Vissza</Button></div>
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">

              <div className="card shadow-sm">
                <div className="card-body">

                  <h5 className="mb-4 text-center" data-testid="device-data">Eszköz adatok</h5>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-manufacturer">Gyártó</div>
                    <div className="col-12 col-sm-8">{deviceData?.manufacturer}</div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-model">Model</div>
                    <div className="col-12 col-sm-8">{deviceData?.model}</div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-type">Típus</div>
                    <div className="col-12 col-sm-8">{deviceData?.deviceType}</div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-serial">Sorozatszám</div>
                    <div className="col-12 col-sm-8">{deviceData?.serialNumber}</div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-inventorynumber">Leltári szám</div>
                    <div className="col-12 col-sm-8">{deviceData?.inventoryNumber}</div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-status">Statusz</div>
                    <div className="col-12 col-sm-8">{deviceData?.status === "assigned" ? "kiadva"
                      : deviceData?.status === "available" ? "kiadható"
                        : deviceData?.status === "unavailable" ? "nem kiadható"
                          : "-"}</div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-createdat">Létrehozva</div>
                    <div className="col-12 col-sm-8">
                      {deviceData?.createdAt ? new Date(deviceData.createdAt).toLocaleString("hu-HU") : "-"}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-userguide">Felhasználói</div>
                    <div className="col-12 col-sm-8">
                      {deviceData?.userGuide ? (
                        <a
                          href={`${fileBaseUrl}/${deviceData.userGuide.replace(/^\/+/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-decoration-none"
                        >
                          <BsFileEarmarkPdf className="me-1" />{deviceData.userGuide.split("/").pop()}
                        </a>
                      ) : ("Nincs feltöltve")}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-invoice">Számla</div>
                    <div className="col-12 col-sm-8">
                      {deviceData?.invoice ? (
                        <a
                          href={`${fileBaseUrl}/${deviceData.invoice.replace(/^\/+/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-decoration-none"
                        >
                          <BsFileEarmarkPdf className="me-1" />{deviceData.invoice.split("/").pop()}
                        </a>
                      ) : ("Nincs feltöltve")}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-warratny">Garancia</div>
                    <div className="col-12 col-sm-8">
                      {deviceData?.warranty ? (
                        <a
                          href={`${fileBaseUrl}/${deviceData.warranty.replace(/^\/+/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-decoration-none"
                        >
                          <BsFileEarmarkPdf className="me-1" />{deviceData.warranty.split("/").pop()}
                        </a>
                      ) : ("Nincs feltöltve")}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-picture">Kép</div>
                    <div className="col-12 col-sm-8">
                      {deviceData?.picture ? (
                        <a
                          href={`${fileBaseUrl}/${deviceData.picture.replace(/^\/+/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-decoration-none"
                        >
                          <BsFileEarmarkImage className="me-1" />{deviceData.picture.split("/").pop()}
                        </a>
                      ) : ("Nincs feltöltve")}
                    </div>
                  </div>
                  <br />
                  <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
                    <Button data-testid="device-edit-btn" className="btn btn-primary-custom app-btn" title="Módosítás" onClick={() => { setShowMOD(true), modDevice(deviceData) }}><BsFileEarmarkCode className="me-2" />Módosítás</Button>
                    <Button data-testid="device-delete-btn" className="btn btn-dark app-btn" title="Törlés" onClick={() => setDeleteDeviceId(deviceData.id)}><BsTrash3 className="me-2" />Törlés</Button>
                    <Button data-testid="device-files-btn" className="btn btn-primary-custom app-btn" title="Fájlok kezelése" onClick={openFileModal}><BsFileEarmarkDiff className="me-2" />Fájlok kezelése</Button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
      {/* Device MOD */}
      {showMOD && (
        <>
          <Modal
            data-testid="edit-modal"
            isOpen={showMOD}
            toggle={quitmod}
            className="custom-modal"
            centered
            scrollable
          >
            <ModalHeader data-testid="edit-modal-header" toggle={quitmod}>
              <div data-testid="edit-modal-title">Eszköz módosítása</div>
            </ModalHeader>

            <ModalBody data-testid="edit-modal-body">
              <div className="mb-3">
                <label htmlFor="manufacturer" className="form-label">Gyártó</label>
                {errors.manufacturer && (
                  <small className="text-danger d-block">{errors.manufacturer}</small>
                )}
                <Input
                  value={newDevice.manufacturer}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, manufacturer: e.target.value })
                  }
                  type="text"
                  id="manufacturer"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="model" className="form-label">Modell</label>
                {errors.model && (
                  <small className="text-danger d-block">{errors.model}</small>
                )}
                <Input
                  value={newDevice.model}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, model: e.target.value })
                  }
                  type="text"
                  id="model"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="serialnumber" className="form-label">Sorozatszám</label>
                {errors.serialNumber && (
                  <small className="text-danger d-block">{errors.serialNumber}</small>
                )}
                <Input
                  value={newDevice.serialNumber}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, serialNumber: e.target.value })
                  }
                  type="text"
                  id="serialnumber"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="inventorynumber" className="form-label">Leltári szám</label>
                {errors.inventoryNumber && (
                  <small className="text-danger d-block">{errors.inventoryNumber}</small>
                )}
                <Input
                  value={newDevice.inventoryNumber}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, inventoryNumber: e.target.value })
                  }
                  type="text"
                  id="inventorynumber"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="deviceType" className="form-label">Eszköztípus</label>
                <Input
                  type="select"
                  id="deviceType"
                  value={newDevice.deviceTypeid}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, deviceTypeid: Number(e.target.value) })
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
                <label htmlFor="status" className="form-label">Státusz</label>
                <Input
                  type="select"
                  id="status"
                  value={newDevice.status}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, status: e.target.value })
                  }
                >
                  {Object.entries(deviceStatus).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </Input>
              </div>
            </ModalBody>

            <ModalFooter data-testid="edit-modal-footer" className="justify-content-center">
              <Button
                data-testid="edit-modal-ok-btn"
                onClick={putdevice}
                type="button"
                className="btn btn-primary-custom"
                disabled={!isDeviceChanged()}
              >
                Mentés
              </Button>
              <Button
                data-testid="edit-modal-no-btn"
                onClick={quitmod} 
                type="button"
                className="btn btn-secondary">
                Mégse
              </Button>
            </ModalFooter>
          </Modal>
        </>
      )}

      {/* Device MOD */}

      {/* Device DELETE */}
      {deleteDeviceId &&
        <Modal
          data-testid="delete-modal"
          isOpen={!!deleteDeviceId}
          toggle={() => setDeleteDeviceId(null)}
          className="custom-modal"
          centered
          scrollable
        >
          <ModalHeader data-testid="delete-modal-header" toggle={() => setDeleteDeviceId(null)}>
            <div data-testid="delete-modal-title">Eszköz törlése</div>
          </ModalHeader>

          <ModalBody data-testid="delete-modal-body">
            <div>{`Biztosan törölni szeretnéd a(z) ${deviceData.manufacturer} ${deviceData.model} ${deviceData.deviceType} típusú, ${deviceData.inventoryNumber} leltári számú eszközt?`}</div>
            <div style={{ color: "red" }}>
              Ez a művelet nem visszavonható!
            </div>
          </ModalBody>

          <ModalFooter data-testid="delete-modal-footer">
            <Button
              data-testid="delete-modal-ok-btn"
              className="btn btn-primary-custom"
              onClick={() => {
                handleDelete(deleteDeviceId);
                setDeleteDeviceId(null);
              }}
            >
              Törlés
            </Button>

            <Button
              data-testid="delete-modal-no-btn"
              className="btn btn-secondary"
              onClick={() => setDeleteDeviceId(null)}
            >
              Mégse
            </Button>
          </ModalFooter>
        </Modal>
      }
      {/* Device DELETE */}

      {showFileMod && (
        <>
          <Modal
            data-testid="edit-file-modal"
            className="custom-modal"
            isOpen={showFileMod}
            toggle={() => { setShowFileMod(false) }}
            centered
            scrollable
          >
            <ModalHeader data-testid="edit-file-modal-header" toggle={() => { setShowFileMod(false) }}>
              <div data-testid="edit-file-modal-title">Fájlok kezelése</div>
            </ModalHeader>

            <ModalBody data-testid="edit-file-modal-body">
              <div className="mb-3">
                <label className="form-label" htmlFor="userGuide">Felhasználói</label>
                <div className="d-flex gap-2">
                  <Input
                    type="file"
                    className="form-control"
                    id="userGuide"
                    onChange={handleFileChange} />
                  <Button
                    type="button"
                    className="btn btn-dark app-btn"
                    title="Törlés"
                    onClick={() => handleFileRemove("userGuide")}><BsTrash3 />
                  </Button>
                </div>
                <small className="text-muted d-block mt-1">
                  {files.userGuide
                    ? `Kiválasztva: ${files.userGuide.name}`
                    : getSavedFilePath("userGuide")
                      ? `Mentett fájl: ${getSavedFilePath("userGuide").split("/").pop()}`
                      : "Nincs feltöltve"}
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="invoice">Számla</label>
                <div className="d-flex gap-2">
                  <Input
                    type="file"
                    className="form-control"
                    id="invoice"
                    onChange={handleFileChange} />
                  <Button
                    type="button"
                    className="btn btn-dark app-btn"
                    title="Törlés"
                    onClick={() => handleFileRemove("invoice")}><BsTrash3 />
                  </Button>
                </div>
                <small className="text-muted d-block mt-1">
                  {files.invoice
                    ? `Kiválasztva: ${files.invoice.name}`
                    : getSavedFilePath("invoice")
                      ? `Mentett fájl: ${getSavedFilePath("invoice").split("/").pop()}`
                      : "Nincs feltöltve"}
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="warranty">Garancia</label>
                <div className="d-flex gap-2">
                  <Input
                    type="file"
                    className="form-control"
                    id="warranty"
                    onChange={handleFileChange} />
                  <Button
                    type="button"
                    className="btn btn-dark app-btn"
                    title="Törlés"
                    onClick={() => handleFileRemove("warranty")}><BsTrash3 />
                  </Button>
                </div>
                <small className="text-muted d-block mt-1">
                  {files.warranty
                    ? `Kiválasztva: ${files.warranty.name}`
                    : getSavedFilePath("warranty")
                      ? `Mentett fájl: ${getSavedFilePath("warranty").split("/").pop()}`
                      : "Nincs feltöltve"}
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="picture">Kép</label>
                <div className="d-flex gap-2">
                  <Input
                    type="file"
                    className="form-control"
                    id="picture"
                    onChange={handleFileChange} />
                  <Button
                    type="button"
                    className="btn btn-dark app-btn"
                    title="Törlés"
                    onClick={() => handleFileRemove("picture")}
                  ><BsTrash3 />
                  </Button>
                </div>
                <small className="text-muted d-block mt-1">
                  {files.picture
                    ? `Kiválasztva: ${files.picture.name}`
                    : getSavedFilePath("picture")
                      ? `Mentett fájl: ${getSavedFilePath("picture").split("/").pop()}`
                      : "Nincs feltöltve"}
                </small>
              </div>
            </ModalBody>

            <ModalFooter data-testid="edit-file-modal-footer">
              <Button data-testid="edit-file-modal-ok-btn" className="btn btn-primary-custom" onClick={handleSubmit} disabled={isSavingFiles || !hasAnyFileSelected()}>{isSavingFiles ? "Mentés..." : "Mentés"}</Button>
              <Button data-testid="edit-file-modal-no-btn" className="btn btn-secondary" onClick={() => { setShowFileMod(false) }}>Mégsem</Button>
            </ModalFooter>

          </Modal>
        </>
      )}
    </>
  )
}
export default AdminDeviceDetails