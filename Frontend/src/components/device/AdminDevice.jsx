import { useEffect, useState } from "react"
import { BsArrowDown, BsArrowRight, BsArrowUp, BsDashCircle, BsFileEarmarkCode, BsFileEarmarkText, BsFileEarmarkX, BsList, BsPencil, BsPlusCircle, BsSortDownAlt } from "react-icons/bs"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import useAuth from "../../auth/useAuth";
import { Button, Input } from "reactstrap";
import { toast } from "react-toastify";
import ListControls from "../pagination/ListControl";
import Pagination from "../pagination/Pagination";
import AdminNewDevice from "./AdminNewDevice";
import AdminDeviceTypeNew from "./AdminDeviceTypeNew";
import AdminDeviceTypeDelete from "./AdminDeviceTypeDelete";
import AdminDeviceTypeMod from "./AdminDeviceTypeMod";


const statusMap = {
  assigned: { text: "kiadva", color: "badge text-bg-secondary" },
  available: { text: "kiadható", color: "badge text-bg-success" },
  unavailable: { text: "nem kiadható", color: "badge text-bg-danger" }
}


const AdminDevice = () => {

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { token, logout } = useAuth();
  const [devices, setDevices] = useState([]);
  const [data, setData] = useState({});

  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("count")) || 10;
  const orderBy = searchParams.get("orderBy") || "id";
  const orderDir = searchParams.get("orderDir") || "asc";
  const search = searchParams.get("search") || "";

  const pageChange = (page) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", page);
      newParams.set("count", pageSize);
      newParams.set("orderBy", orderBy);
      newParams.set("orderDir", orderDir);

      if (search.trim()) newParams.set("search", search);
      else newParams.delete("search");

      return newParams;
    });
  };

  const pageSizeChange = (newSize) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", "1");
      newParams.set("count", newSize);
      newParams.set("orderBy", orderBy);
      newParams.set("orderDir", orderDir);

      if (search.trim()) newParams.set("search", search);
      else newParams.delete("search");

      return newParams;
    });
  };

  const searchChange = (value) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", "1");
      newParams.set("count", pageSize);
      newParams.set("orderBy", orderBy);
      newParams.set("orderDir", orderDir);

      if (value.trim()) newParams.set("search", value);
      else newParams.delete("search");

      return newParams;
    });
  };

  const sort = (column) => {
    const newDir = orderBy === column && orderDir === "asc" ? "desc" : "asc";

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", "1");
      newParams.set("count", pageSize);
      newParams.set("orderBy", column);
      newParams.set("orderDir", newDir);

      if (search.trim()) newParams.set("search", search);
      else newParams.delete("search");

      return newParams;
    });
  };

  const orderIcon = (column) => {
    if (orderBy !== column) return <BsSortDownAlt />;
    return orderDir === "asc" ? <BsArrowUp /> : <BsArrowDown />;
  };

  const [deviceStatus, setDeviceStatus] = useState({
    'available': 'Kiadható',
    'assigned': 'Kiadva',
    'unavailable': 'Nem kiadható'

  });


  const [showNEW, setShowNEW] = useState(false);
  const [showNEWDeviceType, setShowNEWDeviceType] = useState(false);
  const [showDeviceTypeDelete, setShowDeviceTypeDelete] = useState(false);
  const [showDeviceTypeMod, setShowDeviceTypeMod] = useState(false);
  const navigate = useNavigate();



  const loadDevices = async () => {
    try {
      const res = await fetch(
        `${baseUrl}/Device/page-to-page?page=${currentPage}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}&search=${encodeURIComponent(search)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      setDevices(data.actualDevices);
      setData(data);
    } catch (err) {
      console.error(err);
      toast.error("Hiba történt az eszközök betöltésekor");
    }
  };



  useEffect(() => {
    const loadDevices = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/Device/page-to-page?page=${currentPage}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}&search=${encodeURIComponent(search)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 401) {
          logout();
          return;
        }
        const data = await res.json();
        setDevices(data.actualDevices);
        setData(data);
      } catch (err) {
        console.error(err);
        toast.error("Hiba történt az eszközök betöltésekor");
      }
    };
    loadDevices();
  }, [token, logout, currentPage, pageSize, orderBy, orderDir, search]);






  return (
    <>
      <h5 data-testid="quick-actions-title">Gyors művelet(ek)</h5>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button data-testid="device-new-device-btn" onClick={() => setShowNEW(true)} className="btn btn-info app-btn" title="Új eszköz"><BsPlusCircle className="me-2" />Új eszköz</Button>
        <AdminNewDevice isOpen={showNEW} onClose={() => setShowNEW(false)} onSuccess={loadDevices} />
        <Button data-testid="device-new-devicetype-btn" onClick={() => setShowNEWDeviceType(true)} className="btn btn-info app-btn" title="Új eszköztípus" ><BsPlusCircle className="me-2" />Új eszköztípus</Button>
        <AdminDeviceTypeNew isOpen={showNEWDeviceType} onClose={() => setShowNEWDeviceType(false)} onSuccess={loadDevices} />
        <Button data-testid="device-edit-devicetype-btn" onClick={() => setShowDeviceTypeMod(true)} className="btn btn-primary-custom app-btn" title="Eszköztípus módosítás" ><BsPencil className="me-2" />Eszköztípus módosítás</Button>
        <AdminDeviceTypeMod isOpen={showDeviceTypeMod} onClose={() => setShowDeviceTypeMod(false)} onSuccess={loadDevices} />
        <Button data-testid="device-delete-devicetype-btn" onClick={() => setShowDeviceTypeDelete(true)} className="btn btn-dark app-btn" title="Eszköztípus törlés" ><BsDashCircle className="me-2" />Eszköztípus törlés</Button>
        <AdminDeviceTypeDelete isOpen={showDeviceTypeDelete} onClose={() => setShowDeviceTypeDelete(false)} onSuccess={loadDevices} />
      </div>
      <h5 data-testid="total-device-label">Eszközlista - összes eszköz: {data.allAmountOfDevice}</h5>
      <div className="table-responsive">
        <ListControls
          pageSize={pageSize}
          onPageSizeChange={pageSizeChange}
          search={search}
          onSearchChange={searchChange}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th data-testid="th-id" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("id")}>ID {orderIcon("id")}</th>
              <th data-testid="th-manufacturer" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("manufacturer")}>Gyártó {orderIcon("manufacturer")}</th>
              <th data-testid="th-model" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("model")}>Modell {orderIcon("model")}</th>
              <th data-testid="th-type" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("device_type")}>Típus {orderIcon("device_type")}</th>
              <th data-testid="th-serial" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("device_serial")}>Sorozatszám {orderIcon("device_serial")}</th>
              <th data-testid="th-inventorynumber" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("inventory_number")}>Leltári szám {orderIcon("inventory_number")}</th>
              <th data-testid="status" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("status")}>Státusz {orderIcon("status")}</th>
              <th data-testid="th-createdat" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("createdAt")}>Létrehozva {orderIcon("createdAt")}</th>
              <th data-testid="th-updatedat" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("updatedAt")}>Szerkesztve {orderIcon("updatedAt")}</th>
              <th data-testid="th-details" scope="col" style={{ cursor: "pointer" }}>Részletek</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center">Nincs megjeleníthető adat</td>
              </tr>
            ) : (

              devices.map((item) => (
                <tr key={item.id}
                  style={{ cursor: "pointer" }}
                >
                  <td>{item.id}</td>
                  <td>{item.manufacturer}</td>
                  <td>{item.model}</td>
                  <td>{item.deviceType}</td>
                  <td>{item.serialNumber}</td>
                  <td>{item.inventoryNumber}</td>
                  <td>
                    <span className={statusMap[item.status]?.color || "badge text-bg-danger"}>
                      {statusMap[item.status]?.text || item.status}
                    </span>
                  </td>
                  <td>{item.createdAt.split('T')[0]}-{item.createdAt.split('T')[1].split('+')[0]}</td>
                  <td>{item.updatedAt.split('T')[0]}-{item.updatedAt.split('T')[1].split('+')[0]}</td>
                  <td>
                    <Button
                      data-testid="device-details-btn"
                      size="sm"
                      className="btn btn-primary-custom app-btn"
                      onClick={() => navigate(`/devices/admin/${item.id}${location.search}`)}
                      title="Részletek"
                    >
                      <BsList />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={data.totalPage || 1}
          onPageChange={pageChange}
        />
      </div>
    </>
  )
}
export default AdminDevice