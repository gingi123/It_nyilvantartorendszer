import { useEffect, useState } from "react"
import { BsArrowLeft } from "react-icons/bs"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import useAuth from "../../auth/useAuth";
import { Button } from "reactstrap";
import { toast } from "react-toastify";

const UserAssignmentDetails = () => {

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [assignmentData, setAssignmentData] = useState(null);
  const { logout, token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get("page") || 1;
  const pageSize = searchParams.get("count") || 10;
  const orderBy = searchParams.get("orderBy") || "assignment_date";
  const orderDir = searchParams.get("orderDir") || "desc";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
      const res = await fetch(`${baseUrl}/Assignment/my/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401){
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

  return (
    <>
      <div className="page" data-testid="assignment-page">
        <div className="page-header">
          <h3 data-testid="assignment-page-title">Mozgás részletek</h3>
        </div>
        <div className="content-card shadow-sm" data-testid="assignment-content">
          <div><Button onClick={navigateBack} className="btn btn-primary-custom app-btn" data-testid="assignment-back-btn" title="Vissza"><BsArrowLeft /> Vissza</Button></div>
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
                    <div className="col-12 col-sm-4 fw-bold" data-testid="assignment-manufacturer">Gyártó</div>
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
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  )
}
export default UserAssignmentDetails