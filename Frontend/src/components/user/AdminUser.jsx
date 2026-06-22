import { useEffect, useState } from "react"
import { BsArrowDown, BsArrowUp, BsFileEarmarkText, BsList, BsPlusCircle, BsSortDownAlt } from "react-icons/bs"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import useAuth from "../../auth/useAuth";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import AdminNewUser from "./AdminNewUser";
import Pagination from "../pagination/Pagination";
import ListControls from "../pagination/ListControl";





const AdminUser = () => {

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [data, setData] = useState({});
  const [showNew, setShowNew] = useState(false);


  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("count")) || 10;
  const orderBy = searchParams.get("orderBy") || "id";
  const orderDir = searchParams.get("orderDir") || "asc";
  const search = searchParams.get("search") || "";





  const loadUsers = async () => {
    try {
      const res = await fetch(
        `${baseUrl}/User/page-to-page?page=${currentPage}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}&search=${encodeURIComponent(search)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      setUsers(data.actualUsers);
      setData(data);
    } catch (err) {
      console.error(err);
      toast.error("Hiba történt a felhasználók betöltésekor");
    }
  }


  useEffect(() => {


    const loadUsers = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/User/page-to-page?page=${currentPage}&count=${pageSize}&orderBy=${orderBy}&orderDir=${orderDir}&search=${encodeURIComponent(search)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 401) {
          navigate('/');
        }
        const data = await res.json();
        setUsers(data.actualUsers);
        setData(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadUsers();
  }, [token, logout, currentPage, pageSize, orderBy, orderDir, search]);

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


  return (
    <>
      <h5 data-testid="quick-actions-title">Gyors művelet(ek)</h5>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button onClick={() => { setShowNew(true); }} className="btn btn-info app-btn" title="Új felhasználó" data-testid="new-user-btn"><BsPlusCircle className="me-2" />Új felhasználó</Button>
        <AdminNewUser
          isOpen={showNew}
          onClose={() => setShowNew(false)}
          onSuccess={loadUsers}
        />
      </div>
      <h5 data-testid="total-users-label">Felhasználók - összes felhasználó: {data.allAmountOfUsers}</h5>
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
              <th data-testid="th-id" scope="col" onClick={() => sort("id")} style={{ cursor: "pointer" }}>
                ID {orderIcon("id")}
              </th>
              <th data-testid="th-username" scope="col" onClick={() => sort("username")} style={{ cursor: "pointer" }}>
                Felhasználónév {orderIcon("username")}
              </th>
              <th data-testid="th-email" scope="col" onClick={() => sort("email")} style={{ cursor: "pointer" }}>
                Email {orderIcon("email")}
              </th>
              <th data-testid="th-lastname" scope="col" onClick={() => sort("lastName")} style={{ cursor: "pointer" }}>
                Vezetéknév {orderIcon("lastName")}
              </th>
              <th data-testid="th-firstname" scope="col" onClick={() => sort("firstName")} style={{ cursor: "pointer" }}>
                Keresztnév {orderIcon("firstName")}
              </th>
              <th data-testid="th-role" scope="col" onClick={() => sort("role")} style={{ cursor: "pointer" }}>
                Role {orderIcon("role")}
              </th>
              <th data-testid="th-createdat" scope="col" onClick={() => sort("createdAt")} style={{ cursor: "pointer" }}>
                Létrehozva {orderIcon("createdAt")}
              </th>
              <th data-testid="th-updatedat" scope="col" onClick={() => sort("updatedAt")} style={{ cursor: "pointer" }}>
                Szerkesztve {orderIcon("updatedAt")}
              </th>
              <th data-testid="th-details" scope="col">Részletek</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center">Nincs megjeleníthető adat</td>
              </tr>
            ) : (
              users.map((item) => (
                <tr
                  key={item.id}
                  style={{ cursor: "pointer" }}
                >
                  <td>{item.id}</td>
                  <td>{item.username}</td>
                  <td>{item.email}</td>
                  <td>{item.lastName}</td>
                  <td>{item.firstName}</td>
                  <td>{item.role}</td>
                  <td>{item.createdAt?.split("T")[0]}</td>
                  <td>{item.updatedAt?.split("T")[0]}</td>
                  <td>
                    <Button
                      data-testid="details-btn" 
                      size="sm"
                      className="btn btn-primary-custom app-btn"
                      title="Részletek"
                      onClick={() => navigate(`/users/user/${item.id}${location.search}`)}
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
export default AdminUser