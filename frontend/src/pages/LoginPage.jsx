import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../api/client";
import AuthShell from "../components/AuthShell";
import FormField from "../components/FormField";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const successMessage =
    typeof location.state?.message === "string" ? location.state.message : "";

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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
          responseData?.detail ||
            "Login failed. Please check your credentials.",
        );
      }

      if (!responseData?.access_token) {
        throw new Error("The server did not return an access token.");
      }

      localStorage.setItem("access_token", responseData.access_token);

      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to log in right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      copy="Sign in to manage your vehicles, track maintenance history, and stay ahead of upcoming service."
      successMessage={successMessage}
      errorMessage={errorMessage}
      footerText="New here?"
      footerLinkTo="/register"
      footerLinkLabel="Create an account"
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
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          required
        />

        <button
          className="btn btn-primary btn-full"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
