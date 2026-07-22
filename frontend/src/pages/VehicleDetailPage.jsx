import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { API_BASE_URL } from "../api/client";
import Alert from "../components/Alert";
import MaintenanceRecordForm from "../components/MaintenanceRecordForm";
import Topbar from "../components/Topbar";
import VehicleForm from "../components/VehicleForm";

function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const vehicleId = Number(id);

  const isValidVehicleId = Number.isInteger(vehicleId) && vehicleId > 0;

  const [vehicle, setVehicle] = useState(null);
  const [records, setRecords] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);
  const [isUpdatingVehicle, setIsUpdatingVehicle] = useState(false);
  const [isUpdatingRecord, setIsUpdatingRecord] = useState(false);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);

  const [isEditingVehicle, setIsEditingVehicle] = useState(false);

  const [editMake, setEditMake] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editNickname, setEditNickname] = useState("");
  const [editCurrentMileage, setEditCurrentMileage] = useState("");

  const [serviceType, setServiceType] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [mileage, setMileage] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editServiceType, setEditServiceType] = useState("");
  const [editServiceDate, setEditServiceDate] = useState("");
  const [editMileage, setEditMileage] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  }, [navigate]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      handleUnauthorized();
      return null;
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }, [handleUnauthorized]);

  const formatStatus = (status) => {
    switch (status) {
      case "ok":
        return "On track";
      case "due_soon":
        return "Due soon";
      case "overdue":
        return "Overdue";
      default:
        return "Unknown";
    }
  };

  const formatMilesMessage = (item) => {
    if (item.last_service_mileage == null) {
      return "No service record yet";
    }

    const milesUntilDue = Number(item.miles_until_due ?? 0);

    if (item.status === "overdue") {
      return `${Math.abs(milesUntilDue).toLocaleString()} mi overdue`;
    }

    if (item.status === "due_soon") {
      return `${milesUntilDue.toLocaleString()} mi until due`;
    }

    return `${milesUntilDue.toLocaleString()} mi remaining`;
  };

  const getReminderBadgeClass = (status) => {
    switch (status) {
      case "overdue":
        return "badge-overdue";
      case "due_soon":
        return "badge-soon";
      default:
        return "badge-ok";
    }
  };

  const fetchVehicle = useCallback(async () => {
    if (!isValidVehicleId) {
      return;
    }

    const authHeaders = getAuthHeaders();

    if (!authHeaders) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/${encodeURIComponent(vehicleId)}`,
        {
          headers: authHeaders,
        },
      );

      const responseData = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 404) {
        throw new Error("Vehicle not found.");
      }

      if (!response.ok) {
        throw new Error(responseData?.detail || "Unable to load vehicle.");
      }

      setVehicle(responseData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load vehicle.",
      );
    }
  }, [getAuthHeaders, handleUnauthorized, isValidVehicleId, vehicleId]);

  const fetchRecords = useCallback(async () => {
    if (!isValidVehicleId) {
      return;
    }

    const authHeaders = getAuthHeaders();

    if (!authHeaders) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/${encodeURIComponent(vehicleId)}/maintenance`,
        {
          headers: authHeaders,
        },
      );

      const responseData = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.detail || "Unable to load maintenance records.",
        );
      }

      setRecords(Array.isArray(responseData) ? responseData : []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load maintenance records.",
      );
    }
  }, [getAuthHeaders, handleUnauthorized, isValidVehicleId, vehicleId]);

  const fetchReminders = useCallback(async () => {
    if (!isValidVehicleId) {
      return;
    }

    const authHeaders = getAuthHeaders();

    if (!authHeaders) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/${encodeURIComponent(vehicleId)}/service-due`,
        {
          headers: authHeaders,
        },
      );

      const responseData = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.detail || "Unable to load service reminders.",
        );
      }

      setReminders(
        Array.isArray(responseData?.items) ? responseData.items : [],
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load service reminders.",
      );
    }
  }, [getAuthHeaders, handleUnauthorized, isValidVehicleId, vehicleId]);

  const refreshVehicleData = useCallback(async () => {
    await Promise.all([fetchVehicle(), fetchRecords(), fetchReminders()]);
  }, [fetchRecords, fetchReminders, fetchVehicle]);

  useEffect(() => {
    if (!isValidVehicleId) {
      setErrorMessage("Invalid vehicle.");
      setIsLoading(false);
      return;
    }

    const loadPage = async () => {
      setIsLoading(true);
      setErrorMessage("");

      await refreshVehicleData();

      setIsLoading(false);
    };

    loadPage();
  }, [isValidVehicleId, refreshVehicleData]);

  useEffect(() => {
    if (!vehicle) {
      return;
    }

    setEditMake(vehicle.make ?? "");
    setEditModel(vehicle.model ?? "");
    setEditYear(vehicle.year ?? "");
    setEditNickname(vehicle.nickname ?? "");
    setEditCurrentMileage(vehicle.current_mileage ?? "");
  }, [vehicle]);

  const handleAddRecord = async (event) => {
    event.preventDefault();

    if (!isValidVehicleId) {
      setErrorMessage("Invalid vehicle.");
      return;
    }

    const authHeaders = getAuthHeaders();

    if (!authHeaders) {
      return;
    }

    setIsSubmittingRecord(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/${vehicleId}/maintenance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            service_type: serviceType,
            service_date: serviceDate,
            mileage: Number(mileage),
            cost: cost === "" ? null : Number(cost),
            notes: notes.trim() || null,
          }),
        },
      );

      const responseData = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.detail || "Unable to add maintenance record.",
        );
      }

      setServiceType("");
      setServiceDate("");
      setMileage("");
      setCost("");
      setNotes("");

      setSuccessMessage("Maintenance record added.");

      await refreshVehicleData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to add maintenance record.",
      );
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  const handleUpdateVehicle = async (event) => {
    event.preventDefault();

    const authHeaders = getAuthHeaders();

    if (!authHeaders) {
      return;
    }

    setIsUpdatingVehicle(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          make: editMake.trim(),
          model: editModel.trim(),
          year: Number(editYear),
          nickname: editNickname.trim() || null,
          current_mileage: Number(editCurrentMileage),
        }),
      });

      const responseData = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(responseData?.detail || "Unable to update vehicle.");
      }

      setVehicle(responseData);
      setIsEditingVehicle(false);
      setSuccessMessage("Vehicle updated successfully.");

      await fetchReminders();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update vehicle.",
      );
    } finally {
      setIsUpdatingVehicle(false);
    }
  };

  const handleDeleteVehicle = async () => {
    const authHeaders = getAuthHeaders();

    if (!authHeaders) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle and all its maintenance records?",
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingVehicle(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const responseData = await response.json().catch(() => null);

        throw new Error(responseData?.detail || "Unable to delete vehicle.");
      }

      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete vehicle.",
      );
    } finally {
      setIsDeletingVehicle(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    const authHeaders = getAuthHeaders();

    if (!authHeaders) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this maintenance record?",
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/${vehicleId}/maintenance/${recordId}`,
        {
          method: "DELETE",
          headers: authHeaders,
        },
      );

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const responseData = await response.json().catch(() => null);

        throw new Error(
          responseData?.detail || "Unable to delete maintenance record.",
        );
      }

      setSuccessMessage("Maintenance record deleted.");

      await refreshVehicleData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete maintenance record.",
      );
    }
  };

  const startEditingRecord = (record) => {
    setEditingRecordId(record.id);
    setEditServiceType(record.service_type ?? "");
    setEditServiceDate(record.service_date ?? "");
    setEditMileage(record.mileage ?? "");
    setEditCost(record.cost ?? "");
    setEditNotes(record.notes ?? "");
  };

  const cancelEditingRecord = () => {
    setEditingRecordId(null);
    setEditServiceType("");
    setEditServiceDate("");
    setEditMileage("");
    setEditCost("");
    setEditNotes("");
  };

  const handleUpdateRecord = async (event, recordId) => {
    event.preventDefault();

    const authHeaders = getAuthHeaders();

    if (!authHeaders) {
      return;
    }

    setIsUpdatingRecord(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/${vehicleId}/maintenance/${recordId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            service_type: editServiceType,
            service_date: editServiceDate,
            mileage: Number(editMileage),
            cost: editCost === "" ? null : Number(editCost),
            notes: editNotes.trim() || null,
          }),
        },
      );

      const responseData = await response.json().catch(() => null);

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.detail || "Unable to update maintenance record.",
        );
      }

      cancelEditingRecord();
      setSuccessMessage("Maintenance record updated.");

      await refreshVehicleData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update maintenance record.",
      );
    } finally {
      setIsUpdatingRecord(false);
    }
  };

  return (
    <main className="app-shell">
      <Topbar>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/")}
        >
          Garage
        </button>
      </Topbar>

      <section className="page-wrap">
        <div className="detail-toolbar">
          <div className="detail-toolbar__group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/")}
            >
              Back to garage
            </button>
          </div>

          <div className="detail-toolbar__group">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!vehicle || isUpdatingVehicle}
              onClick={() => setIsEditingVehicle((current) => !current)}
            >
              {isEditingVehicle ? "Close editor" : "Edit vehicle"}
            </button>

            <button
              type="button"
              className="btn btn-danger"
              disabled={!vehicle || isDeletingVehicle}
              onClick={handleDeleteVehicle}
            >
              {isDeletingVehicle ? "Deleting..." : "Delete vehicle"}
            </button>
          </div>
        </div>

        {vehicle && (
          <header className="hero-card">
            <p className="hero-card__eyebrow">Vehicle detail</p>

            <h1>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>

            <p className="hero-card__meta">
              {vehicle.nickname ? `${vehicle.nickname} · ` : ""}
              {Number(vehicle.current_mileage ?? 0).toLocaleString()} miles
              currently tracked
            </p>
          </header>
        )}

        {reminders.length > 0 && (
          <section className="reminder-section">
            <h2 className="section-title">Service reminders</h2>

            <div className="reminder-grid">
              {reminders.map((item) => (
                <article
                  key={item.service_type}
                  className={`reminder-card ${
                    item.status === "overdue"
                      ? "reminder-card--overdue"
                      : item.status === "due_soon"
                        ? "reminder-card--due-soon"
                        : "reminder-card--ok"
                  }`}
                >
                  <span className="reminder-card__type">
                    {item.service_type}
                  </span>

                  <span
                    className={`reminder-card__status badge ${getReminderBadgeClass(
                      item.status,
                    )}`}
                  >
                    {formatStatus(item.status)}
                  </span>

                  <span className="reminder-card__miles">
                    {formatMilesMessage(item)}
                  </span>

                  {item.last_service_mileage != null && (
                    <span className="reminder-card__last">
                      Last service:{" "}
                      {Number(item.last_service_mileage).toLocaleString()} mi
                    </span>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        <Alert type="success">{successMessage}</Alert>

        <Alert type="error">{errorMessage}</Alert>

        {isLoading ? (
          <p className="dashboard-state">Loading vehicle details...</p>
        ) : (
          <div className="detail-grid">
            <section className="card">
              <div className="card__header">
                <h2 className="card__title">
                  {isEditingVehicle ? "Edit vehicle" : "Add maintenance record"}
                </h2>

                <p className="card__copy">
                  {isEditingVehicle
                    ? "Update the vehicle information used across your tracker."
                    : "Create a new service entry to keep your maintenance history current."}
                </p>
              </div>

              <div className="card__body">
                {isEditingVehicle ? (
                  <VehicleForm
                    make={editMake}
                    model={editModel}
                    year={editYear}
                    nickname={editNickname}
                    currentMileage={editCurrentMileage}
                    onMakeChange={setEditMake}
                    onModelChange={setEditModel}
                    onYearChange={setEditYear}
                    onNicknameChange={setEditNickname}
                    onCurrentMileageChange={setEditCurrentMileage}
                    onSubmit={handleUpdateVehicle}
                    isSubmitting={isUpdatingVehicle}
                    submitLabel="Save changes"
                    submittingLabel="Saving changes..."
                    fullWidthSubmit={false}
                    onCancel={() => setIsEditingVehicle(false)}
                  />
                ) : (
                  <MaintenanceRecordForm
                    serviceType={serviceType}
                    serviceDate={serviceDate}
                    mileage={mileage}
                    cost={cost}
                    notes={notes}
                    onServiceTypeChange={setServiceType}
                    onServiceDateChange={setServiceDate}
                    onMileageChange={setMileage}
                    onCostChange={setCost}
                    onNotesChange={setNotes}
                    onSubmit={handleAddRecord}
                    isSubmitting={isSubmittingRecord}
                    submitLabel="Add record"
                    submittingLabel="Saving..."
                  />
                )}
              </div>
            </section>

            <section className="card">
              <div className="card__header">
                <h2 className="card__title">Maintenance history</h2>

                <p className="card__copy">
                  Review previous service records and keep entries up to date.
                </p>
              </div>

              <div className="card__body">
                {records.length === 0 ? (
                  <p className="dashboard-state">No maintenance records yet.</p>
                ) : (
                  <ul className="history-list">
                    {records.map((record) => (
                      <li className="history-card" key={record.id}>
                        {editingRecordId === record.id ? (
                          <MaintenanceRecordForm
                            serviceType={editServiceType}
                            serviceDate={editServiceDate}
                            mileage={editMileage}
                            cost={editCost}
                            notes={editNotes}
                            onServiceTypeChange={setEditServiceType}
                            onServiceDateChange={setEditServiceDate}
                            onMileageChange={setEditMileage}
                            onCostChange={setEditCost}
                            onNotesChange={setEditNotes}
                            onSubmit={(event) =>
                              handleUpdateRecord(event, record.id)
                            }
                            isSubmitting={isUpdatingRecord}
                            submitLabel="Save"
                            submittingLabel="Saving..."
                            onCancel={cancelEditingRecord}
                          />
                        ) : (
                          <>
                            <div className="history-card__header">
                              <strong>{record.service_type}</strong>

                              <span className="history-card__date">
                                {record.service_date}
                              </span>
                            </div>

                            <p className="history-card__meta">
                              {Number(record.mileage ?? 0).toLocaleString()}{" "}
                              miles
                              {record.cost != null &&
                                ` · $${Number(record.cost).toFixed(2)}`}
                            </p>

                            {record.notes && (
                              <p className="history-card__notes">
                                {record.notes}
                              </p>
                            )}

                            <div className="record-actions">
                              <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => startEditingRecord(record)}
                              >
                                Edit
                              </button>

                              <button
                                className="btn btn-danger"
                                type="button"
                                onClick={() => handleDeleteRecord(record.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

export default VehicleDetailPage;
