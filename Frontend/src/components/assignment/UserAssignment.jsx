import { useEffect, useState } from "react";
import useAuth from "../../auth/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BsArrowDown,
  BsArrowUp,
  BsList,
  BsSortDownAlt
} from "react-icons/bs";
import Pagination from "../pagination/Pagination";
import ListControls from "../pagination/ListControl";
import { toast } from "react-toastify";
import { Button } from "reactstrap";

const UserAssignment = () => {

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { logout, token } = useAuth();
  const [assignmentData, setAssignmentData] = useState([]);
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
        const assignmentResponse = await fetch(
          `${baseUrl}/Assignment/my?pageNum=${currentPage}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}&search=${encodeURIComponent(search)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!assignmentResponse.ok) {
          if (assignmentResponse.status === 401) {
            logout();
            return;
          }
          throw new Error("Hiba a kérésben");
        }

        const assignmentJson = await assignmentResponse.json();
        setTotalPages(assignmentJson.totalPages);
        setAssignmentData(assignmentJson.myAssignments);
      } catch (error) {
        console.error("UserAssignment fetch error: ", error);
        setAssignmentData([]);
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
      newParams.delete("prevPage");

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
      newParams.set("page", "1");
      newParams.set("count", newSize);
      newParams.set("orderBy", orderBy);
      newParams.set("orderDir", orderDir);
      newParams.delete("prevPage")

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

      const currentSearch = prev.get("search") || "";
      const currentPageValue = prev.get("page") || "1";
      const prevPageValue = prev.get("prevPage");

      newParams.set("count", pageSize);
      newParams.set("orderBy", orderBy);
      newParams.set("orderDir", orderDir);

      if (value.trim()) {
        if (!currentSearch.trim()) {
          newParams.set("prevPage", currentPageValue);
        }

        newParams.set("search", value);
        newParams.set("page", "1");
      } else {
        newParams.delete("search");
        if (prevPageValue) {
          newParams.set("page", prevPageValue);
          newParams.delete("prevPage");
        }
        else {
          newParams.set("page", "1");
        }
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
      newParams.set("page", "1");
      newParams.set("count", pageSize);
      newParams.set("orderBy", column);
      newParams.set("orderDir", newDir);
      newParams.delete("prevPage")

      if (search.trim()) {
        newParams.set("search", search);
      } else {
        newParams.delete("search");
      }

      return newParams;
    });
  };

  return (
    <div>
      <h5 data-testid="assignment-title">Eszköz mozgásaim</h5>
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
              <th data-testid="th-id" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("id")}>
                ID {orderIcon("id")}
              </th>
              <th data-testid="th-name" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("user")}>
                Név {orderIcon("user")}
              </th>
              <th data-testid="th-serial" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("device_serial")}>
                Sorozatszám {orderIcon("device_serial")}
              </th>
              <th data-testid="th-type" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("device_type")}>
                Típus {orderIcon("device_type")}
              </th>
              <th data-testid="th-direction" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("assignment_type")}>
                Irány {orderIcon("assignment_type")}
              </th>
              <th data-testid="th-date" scope="col" style={{ cursor: "pointer" }} onClick={() => sort("assignment_date")}>
                Dátum {orderIcon("assignment_date")}
              </th>
              <th data-testid="th-details" scope="col">Részletek</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center">Betöltés...</td>
              </tr>
            ) : assignmentData.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">Nincs megjeleníthető adat</td>
              </tr>
            ) : (
              assignmentData.map((item) => {
                const detailsUrl = `/assignments/user/${item.id}?page=${currentPage}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
                return (
                  <tr key={item.id}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{item.id}</td>
                    <td>{item.user}</td>
                    <td>{item.device_serial}</td>
                    <td>{item.device_type}</td>
                    <td>
                      {item.assignment_type === "Assignment"
                        ? "Kiadás"
                        : item.assignment_type === "Return"
                          ? "Visszavétel"
                          : item.assignment_type}
                    </td>
                    <td>{new Date(item.assignment_date).toLocaleString("hu-HU")}</td>
                    <td>
                      <Button
                        data-testid="assignment-details-btn"
                        size="sm"
                        className="btn btn-primary-custom app-btn"
                        to={detailsUrl}
                        onClick={() => navigate(detailsUrl)}
                        title="Részletek">
                        <BsList />
                      </Button>
                    </td>
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
    </div>
  );
};

export default UserAssignment;