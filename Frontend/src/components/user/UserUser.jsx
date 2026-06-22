import { useEffect, useState } from "react";
import useAuth from "../../auth/useAuth";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { ErrorMessage, Field, Formik, Form } from "formik";
import { toast } from "react-toastify";

const UserUser = () => {

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [profileData, setProfileData] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { logout, token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${baseUrl}/User/me`, {
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
        setProfileData(json);
      } catch (error) {
        console.error("User fetch error: ", error);
        toast.error("Hiba történt az adatok betöltésekor");
      }
    };
    if (token) {
      fetchData();
    }
  }, [token, logout, baseUrl]);

  return (
    <>
      <div className="page" data-testid="profile-page">
        <div className="row justify-content-center">

          <div className="col-md-6 col-lg-5">

            <div className="content-card shadow-sm">
              <div className="card-body">

                <h5 className="mb-4 text-center" data-testid="profile-data">Felhasználói adatok</h5>

                <div className="row mb-2">
                  <div className="col-12 col-sm-4 fw-bold" data-testid="profile-name">Név</div>
                  <div className="col-12 col-sm-8">
                    {profileData?.lastname} {profileData?.firstname}
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-12 col-sm-4 fw-bold" data-testid="profile-username">Felhasználónév</div>
                  <div className="col-12 col-sm-8">{profileData?.username}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-12 col-sm-4 fw-bold" data-testid="profile-email">Email</div>
                  <div className="col-12 col-sm-8">{profileData?.email}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-12 col-sm-4 fw-bold" data-testid="profile-role">Szerepkör</div>
                  <div className="col-12 col-sm-8">{profileData?.role === "user" ? "Felhasználó" : "Admin"}</div>
                </div>

                <div className="row">
                  <div className="col-12 col-sm-4 fw-bold" data-testid="profile-createdat">Létrehozva</div>
                  <div className="col-12 col-sm-8">
                    {profileData?.createdat ? new Date(profileData.createdat).toLocaleString("hu-HU") : "-"}
                  </div>
                </div>
                <br />
                <div className="d-flex justify-content-center mt-3">
                  <Button className="btn btn-primary-custom app-btn" title="Jelszó változtatás" data-testid="profile-new-password-btn" onClick={() => setShowPasswordModal(true)}>
                    Jelszó változtatás
                  </Button>
                </div>

                {showPasswordModal && (
                  <Modal
                    data-testid="new-password-modal"
                    className="custom-modal"
                    isOpen={showPasswordModal}
                    toggle={() => setShowPasswordModal(false)}
                    scrollable
                    centered
                  >
                    <ModalHeader data-testid="new-password-modal-header" toggle={() => setShowPasswordModal(false)}>
                      <div data-testid="new-password-modal-title">Jelszó változtatás</div>
                    </ModalHeader>

                    <Formik
                      initialValues={{
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      }}
                      validate={(values) => {
                        const errors = {};

                        if (!values.currentPassword) {
                          errors.currentPassword = "Add meg a jelenlegi jelszót";
                        }

                        if (!values.newPassword) {
                          errors.newPassword = "Add meg az új jelszót";
                        } else if (values.newPassword.length < 5) {
                          errors.newPassword = "Az új jelszónak legalább 5 karakternek kell lennie";
                        }

                        if (!values.confirmPassword) {
                          errors.confirmPassword = "Erősítsd meg az új jelszót";
                        } else if (values.newPassword !== values.confirmPassword) {
                          errors.confirmPassword = "A két új jelszó nem egyezik";
                        }

                        return errors;
                      }}
                      onSubmit={async (values, { resetForm, setSubmitting, setStatus }) => {
                        try {
                          setStatus(null);

                          const token = localStorage.getItem("token");

                          const response = await fetch(`${baseUrl}/User/me/password`, {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              currentPassword: values.currentPassword,
                              newPassword: values.newPassword,
                            }),
                          });

                          const text = await response.text();

                          let data = null;
                          try {
                            data = text ? JSON.parse(text) : null;
                          } catch (parseError) {
                            console.log("JSON parse hiba:", parseError);
                          }

                          if (!response.ok) {
                            const errorMsg = data?.error || text || "Hiba történt a jelszó módosítása közben.";
                            setStatus(errorMsg);
                            return;
                          }

                          resetForm();
                          setShowPasswordModal(false);
                          toast.success(data?.message || "A jelszó módosítás megtörtént.");
                        } catch (error) {
                          console.error("SUBMIT ERROR:", error);
                          const errorMsg = "Nem sikerült kapcsolódni a szerverhez";
                          toast.error(errorMsg);
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                    >
                      {({ isSubmitting, status, values }) => (
                        <Form>
                          <ModalBody data-testid="new-password-modal-body">
                            {status && (
                              <div className="alert alert-danger" role="alert">
                                {status}
                              </div>
                            )}
                            <div className="mb-3">
                              <label htmlFor="currentPassword" className="form-label">Jelenlegi jelszó</label>
                              <Field
                                id="currentPassword"
                                className="form-control"
                                type="password"
                                name="currentPassword"
                              />
                              <ErrorMessage
                                name="currentPassword"
                                component="div"
                                className="text-danger mt-1"
                              />
                            </div>
                            <div className="mb-3">
                              <label htmlFor="newPassword" className="form-label">Új jelszó</label>
                              <Field
                                id="newPassword"
                                className="form-control"
                                type="password"
                                name="newPassword"
                              />
                              <ErrorMessage
                                name="newPassword"
                                component="div"
                                className="text-danger mt-1"
                              />
                            </div>
                            <div className="mb-3">
                              <label htmlFor="confirmPassword" className="form-label">Új jelszó megerősítése</label>
                              <Field
                                id="confirmPassword"
                                className="form-control"
                                type="password"
                                name="confirmPassword"
                              />
                              <ErrorMessage
                                name="confirmPassword"
                                component="div"
                                className="text-danger mt-1"
                              />
                            </div>
                          </ModalBody>

                          <ModalFooter data-testid="new-password-modal-footer">
                            <Button
                              data-testid="new-password-modal-yes-btn"
                              type="submit"
                              className="btn btn-primary-custom"
                              disabled={isSubmitting || values.newPassword === "" || values.confirmPassword === ""}
                            >
                              {isSubmitting ? "Mentés..." : "Mentés"}
                            </Button>

                            <button
                              data-testid="new-password-modal-no-btn"
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setShowPasswordModal(false)}
                              disabled={isSubmitting}
                            >
                              Mégse
                            </button>
                          </ModalFooter>
                        </Form>
                      )}
                    </Formik>
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
export default UserUser