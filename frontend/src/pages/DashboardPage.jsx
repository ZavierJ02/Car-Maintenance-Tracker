import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../api/client";
import Alert from "../components/Alert";
import StatCard from "../components/StatCard";
import Topbar from "../components/Topbar";
import VehicleForm from "../components/VehicleForm";

function DashboardPage() {
  const [vehicles, setVehicles] = useState([]);

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [nickname, setNickname] = useState("");
  const [currentMileage, setCurrentMileage] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  }, [navigate]);

  const fetchVehicles = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(responseData?.detail || "Unable to load vehicles.");
      }

      setVehicles(Array.isArray(responseData) ? responseData : []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load vehicles.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    fetchVehicles();
  }, [fetchVehicles, handleUnauthorized]);

  const handleAddVehicle = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      handleUnauthorized();
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          make: make.trim(),
          model: model.trim(),
          year: Number(year),
          nickname: nickname.trim() || null,
          current_mileage: Number(currentMileage),
        }),
      });

      const responseData = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(responseData?.detail || "Unable to add vehicle.");
      }

      setSuccessMessage("Vehicle added successfully.");

      setMake("");
      setModel("");
      setYear("");
      setNickname("");
      setCurrentMileage("");

      await fetchVehicles();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to add vehicle.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalVehicles = vehicles.length;

  const totalMileage = useMemo(() => {
    return vehicles.reduce((sum, vehicle) => {
      const mileage = Number(vehicle.current_mileage ?? 0);

      return sum + (Number.isFinite(mileage) ? mileage : 0);
    }, 0);
  }, [vehicles]);

  const newestVehicle = useMemo(() => {
    if (vehicles.length === 0) {
      return null;
    }

    return [...vehicles].sort((a, b) => {
      return Number(b.id) - Number(a.id);
    })[0];
  }, [vehicles]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  };

  return (
    <main className="app-shell">
      <Topbar>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleLogout}
        >
          Log out
        </button>
      </Topbar>

      <section className="page-wrap">
        <header className="page-header">
          <div>
            <p className="page-header__eyebrow">Overview</p>

            <h1>Your garage dashboard</h1>

            <p className="page-header__copy">
              Keep track of vehicles, mileage, and maintenance records in one
              place with a clean, production-style workflow.
            </p>
          </div>

          <div className="page-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => document.getElementById("make")?.focus()}
            >
              Add new vehicle
            </button>
          </div>
        </header>

        <section className="stats-grid">
          <StatCard
            label="Total vehicles"
            value={totalVehicles}
            meta="Vehicles currently in your garage"
          />

          <StatCard
            label="Combined mileage"
            value={totalMileage.toLocaleString()}
            meta="Miles tracked across all vehicles"
          />

          <StatCard
            label="Latest vehicle"
            value={
              newestVehicle
                ? `${newestVehicle.year} ${newestVehicle.make}`
                : "No vehicles yet"
            }
            valueStyle={{
              fontSize: "1.2rem",
              lineHeight: 1.2,
            }}
            meta={
              newestVehicle
                ? newestVehicle.model
                : "Add your first vehicle to begin"
            }
          />
        </section>

        <section className="content-grid">
          <article className="card">
            <div className="card__header">
              <h2 className="card__title">Add a vehicle</h2>

              <p className="card__copy">
                Enter the core details for a vehicle you want to track.
              </p>
            </div>

            <div className="card__body">
              <VehicleForm
                make={make}
                model={model}
                year={year}
                nickname={nickname}
                currentMileage={currentMileage}
                onMakeChange={setMake}
                onModelChange={setModel}
                onYearChange={setYear}
                onNicknameChange={setNickname}
                onCurrentMileageChange={setCurrentMileage}
                onSubmit={handleAddVehicle}
                isSubmitting={isSubmitting}
                submitLabel="Add vehicle"
                submittingLabel="Saving vehicle..."
              />

              <Alert type="success">{successMessage}</Alert>
              <Alert type="error">{errorMessage}</Alert>
            </div>
          </article>

          <article className="card">
            <div className="card__header">
              <h2 className="card__title">Your vehicles</h2>

              <p className="card__copy">
                Open any vehicle to manage service records and reminders.
              </p>
            </div>

            <div className="card__body">
              {isLoading && (
                <p className="dashboard-state">Loading vehicles...</p>
              )}

              {!isLoading && vehicles.length === 0 && (
                <p className="dashboard-state">
                  No vehicles yet. Add your first one to get started.
                </p>
              )}

              {!isLoading && vehicles.length > 0 && (
                <ul className="vehicle-list">
                  {vehicles.map((vehicle) => (
                    <li className="vehicle-item" key={vehicle.id}>
                      <button
                        type="button"
                        className="vehicle-select"
                        onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      >
                        <div className="vehicle-select__top">
                          <div>
                            <strong>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </strong>

                            <p>
                              {vehicle.nickname ? `${vehicle.nickname} · ` : ""}
                              {Number(
                                vehicle.current_mileage ?? 0,
                              ).toLocaleString()}{" "}
                              miles
                            </p>
                          </div>

                          <span className="vehicle-tag">View details</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

export default DashboardPage;
