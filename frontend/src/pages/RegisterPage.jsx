import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../api/client";
import AuthShell from "../components/AuthShell";
import FormField from "../components/FormField";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseData?.detail || "Registration failed. Please try again.",
        );
      }

      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully. You can now log in.",
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to register right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      copy="Start tracking service history, mileage, and maintenance schedules with a cleaner dashboard workflow."
      errorMessage={errorMessage}
      footerText="Already have an account?"
      footerLinkTo="/login"
      footerLinkLabel="Log in"
    >
      <form
        className="form-stack"
        onSubmit={handleSubmit}
        style={{ marginTop: "24px" }}
      >
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          required
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          placeholder="Create a password"
          required
        />

        <button
          className="btn btn-primary btn-full"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>
    </AuthShell>
  );
}

export default RegisterPage;
