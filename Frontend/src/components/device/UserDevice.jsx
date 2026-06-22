import { useEffect, useState } from "react";
import useAuth from "../../auth/useAuth"
import { useNavigate, useSearchParams } from "react-router-dom";
import { BsArrowDown, BsArrowUp, BsList, BsSortDownAlt } from "react-icons/bs";
import ListControls from "../pagination/ListControl";
import Pagination from "../pagination/Pagination";
import { toast } from "react-toastify";
import { Button } from "reactstrap";

const UserDevice = () => {

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { logout, token } = useAuth();
  const [deviceData, setDeviceData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("count")) || 10;
  const orderBy = searchParams.get("orderBy") || "id";
  const orderDir = searchParams.get("orderDir") || "asc";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const deviceResponse = await fetch(
          `${baseUrl}/Device/my?pageNum=${currentPage}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}&search=${encodeURIComponent(search)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!deviceResponse.ok) {
          if (deviceResponse.status === 401) {
            logout();
            return;
          }
          throw new Error("Hiba a kérésben");
        }
        const deviceJson = await deviceResponse.json();
        setDeviceData(deviceJson.device);
        setTotalPages(deviceJson.totalPages);
      }
      catch (error) {
        console.error("UserDevice fetch error: ", error);
        setDeviceData([]);
        setTotalPages(1);
        toast.error("Hiba történt az adatok betöltésekor");
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchData();
    }
  }, [token, currentPage, pageSize, orderBy, orderDir, search, logout, baseUrl]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const pageChange = (page) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", page);
      newParams.set("count", pageSize);
      newParams.set("orderBy", orderBy);
      newParams.set("orderDir", orderDir);

      if (search.trim()) {
        newParams.set("search", search);
      } else {
        newParams.delete("search");
      }

      return newParams;
    });
  };

  const pageSizeChange = (newSize) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", 1);
      newParams.set("count", newSize);
      newParams.set("orderBy", orderBy);
      newParams.set("orderDir", orderDir);

      if (search.trim()) {
        newParams.set("search", search);
      } else {
        newParams.delete("search");
      }

      return newParams;
    });
  };

  const searchChange = (value) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", 1);
      newParams.set("count", pageSize);
      newParams.set("orderBy", orderBy);
      newParams.set("orderDir", orderDir);

      if (value.trim()) {
        newParams.set("search", value);
      } else {
        newParams.delete("search");
      }

      return newParams;
    });
  };

  const orderIcon = (column) => {
    if (orderBy !== column) return <BsSortDownAlt />;
    return orderDir === "asc" ? <BsArrowUp /> : <BsArrowDown />;
  };

  const sort = (column) => {
    const newDir = orderBy === column && orderDir === "asc" ? "desc" : "asc";

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", 1);
      newParams.set("count", pageSize);
      newParams.set("orderBy", column);
      newParams.set("orderDir", newDir);

      if (search.trim()) {
        newParams.set("search", search);
      } else {
        newParams.delete("search");
      }

      return newParams;
    });
  };

  return (
    <>
      <h5 data-testid="device-title">Eszközeim</h5>
      <div className="table-responsive">
        <ListControls
          pageSize={pageSize}
          onPageSizeChange={pageSizeChange}
          search={search}
          onSearchChange={searchChange}
        />
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th data-testid="th-id" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("id")}>ID {orderIcon("id")}</th>
              <th data-testid="th-manufacturer" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("manufacturer")}>Gyártó {orderIcon("manufacturer")}</th>
              <th data-testid="th-model" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("model")}>Modell {orderIcon("model")}</th>
              <th data-testid="th-type" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("device_type")}>Típus {orderIcon("device_type")}</th>
              <th data-testid="th-serial" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("device_serial")}>Sorozatszám {orderIcon("device_serial")}</th>
              <th data-testid="th-inventor-number" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("inventory_number")}>Leltári szám {orderIcon("inventory_number")}</th>
              <th data-testid="th-date" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("assignment_date")}>Kiadva {orderIcon("assignment_date")}</th>
              <th data-testid="th-details" scope="col">Részletek</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (<tr>
              <td colSpan={8} className="text-center">Betöltés...</td>
            </tr>) : deviceData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">Nincs megjeleníthető adat</td>
              </tr>
            ) : (
              deviceData.map((item) => {
                const detailsUrl = `/devices/user/${item.device.id}?page=${currentPage}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
                return (
                  <tr key={item.device.id}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{item.device.id}</td>
                    <td>{item.device.manufacturer}</td>
                    <td>{item.device.model}</td>
                    <td>{item.device.name}</td>
                    <td>{item.device.serialNumber}</td>
                    <td>{item.device.inventoryNumber}</td>
                    <td>{new Date(item.device.assigned_At).toLocaleString("hu-HU")}</td>
                    <td><Button
                      data-testid="details-btn" 
                      size="sm"
                      className="btn btn-primary-custom app-btn"
                      onClick={() => navigate(detailsUrl)}
                      title="Részletek">
                      <BsList /></Button></td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={pageChange}
        />
      </div>
    </>
  )
}
export default UserDevice