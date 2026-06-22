import { useEffect, useState } from "react"
import useAuth from "../../auth/useAuth";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { BsArrowLeft, BsFileEarmarkPdf } from "react-icons/bs";
import { Button } from "reactstrap";
import { toast } from "react-toastify";

const DeviceDetails = () => {

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const fileBaseUrl = baseUrl.replace("/api", "");
  const [deviceData, setDeviceData] = useState(null);
  const { logout, token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get("page") || 1;
  const pageSize = searchParams.get("count") || 10;
  const orderBy = searchParams.get("orderBy") || "id";
  const orderDir = searchParams.get("orderDir") || "asc";
  const search = searchParams.get("search") || "";

  useEffect(() => {
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
        console.error("DeviceDetails fetch error: ", error);
        toast.error("Nem sikerült betölteni az adatokat");
      }
    };
    if (token) {
      fetchData();
    }
  }, [token, id, logout, baseUrl]);

  const navigateBack = () => {
    navigate(`/devices?page=${page}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}${search ? `&search=${encodeURIComponent(search)}` : ""}`);
    return;
  }

  return (
    <>
      <div className="page" data-testid="device-page">
        <div className="page-header">
          <h3 data-testid="device-details-title">Eszköz részletek</h3>
        </div>
        <div className="content-card shadow-sm" data-testid="device-content">
          <div><Button onClick={navigateBack} className="btn btn-primary-custom app-btn" data-testid="back-btn"  title="Vissza"><BsArrowLeft /> Vissza</Button></div>
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
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-model">Modell</div>
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
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-inventory-number">Leltári szám</div>
                    <div className="col-12 col-sm-8">{deviceData?.inventoryNumber}</div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-status">Státusz</div>
                    <div className="col-12 col-sm-8">{deviceData?.status === "assigned" ? "kiadva" : "-"}</div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-createdat">Létrehozva</div>
                    <div className="col-12 col-sm-8">
                      {deviceData?.createdAt ? new Date(deviceData.createdAt).toLocaleString("hu-HU") : "-"}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12 col-sm-4 fw-bold" data-testid="device-file">Felhasználói</div>
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
                  <br />

                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  )
}
export default DeviceDetails