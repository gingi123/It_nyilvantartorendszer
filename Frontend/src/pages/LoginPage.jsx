import "./LoginPage.css";
import logo from "../assets/ienlogo.png";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import { Alert } from "reactstrap";

import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  FormFeedback,
} from "reactstrap";

import { Formik } from "formik";
import { toast } from "react-toastify";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  // Validáció
  const validate = (values) => {
    const errors = {};

    if (!values.username) {
      errors.username = "A felhasználónév megadása kötelező";
    } else if (values.username.length < 3) {
      errors.username = "Minimum 3 karakter";
    }

    if (!values.password) {
      errors.password = "A jelszó megadása kötelező";
    } else if (values.password.length < 3) {
      errors.password = "Minimum 3 karakter";
    }

    return errors;
  };

  return (
    <Container tag="main" fluid className="login-container">
      <Row className="login-row g-0">
        {/* Bal oldal */}
        <Col
          md="6"
          className="login-left d-flex align-items-center justify-content-center"
        >
          <img className="login-logo" src={logo} alt="IEN Logo" data-testid="login-logo" />
        </Col>

        {/* Jobb oldal */}
        <Col
          md="6"
          className="login-right d-flex align-items-center justify-content-center"
        >
          <div className="login-card">
            <h1 className="login-title" data-testid="login-header-text">Bejelentkezés</h1>

            <Formik
              initialValues={{ username: "", password: "" }}
              validate={validate}
              validateOnMount
              onSubmit={async (values, { setSubmitting, setStatus }) => {
                setStatus(null);
                try {
                  await login(values);
                  navigate("/dashboard", { replace: true });
                } catch (error) {
                  console.error("Login form error: ", error);
                  setStatus( error.message || "Sikertelen belépés");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
                isValid,
                status,
                dirty,
              }) => (
                <Form onSubmit={handleSubmit} noValidate>
                  {status && (
                    <Alert color="danger" className="py-2" data-testid="login-alert-text">
                      {status}
                    </Alert>
                  )}
                  {/* Email */}
                  <FormGroup>
                    <Label data-testid="login-username-label" for="username">Felhasználónév</Label>
                    <Input
                      name="username"
                      type="text"
                      value={values.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      invalid={touched.username && !!errors.username}
                      className="login-input"
                      data-testid="login-username-input"
                    />
                    {touched.username && errors.username && (
                      <FormFeedback data-testid="login-username-error">{errors.username}</FormFeedback>
                    )}
                  </FormGroup>

                  {/* Password */}
                  <FormGroup>
                    <Label data-testid="login-password-label" for="password">Jelszó</Label>
                    <Input
                      name="password"
                      type="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      invalid={touched.password && !!errors.password}
                      className="login-input"
                      data-testid="login-password-input"
                    />
                    {touched.password && errors.password && (
                      <FormFeedback data-testid="login-password-error">{errors.password}</FormFeedback>
                    )}
                  </FormGroup>
                  <div className="text-center mt-4">
                    <Button
                      type="submit"
                      color="primary"
                      className="btn btn-primary-custom app-btn"
                      data-testid="login-login-button"
                      disabled={isSubmitting || !isValid || !dirty}
                    >
                      {isSubmitting ? "Belépés..." : "Belépés"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </Col>
      </Row>
    </Container>
  );
}