import FormField from "./FormField";

function MaintenanceRecordForm({
  serviceType,
  serviceDate,
  mileage,
  cost,
  notes,
  onServiceTypeChange,
  onServiceDateChange,
  onMileageChange,
  onCostChange,
  onNotesChange,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Add record",
  submittingLabel = "Saving...",
  onCancel,
}) {
  return (
    <form className="form-stack" onSubmit={onSubmit}>
      <FormField
        id="serviceType"
        label="Service type"
        value={serviceType}
        onChange={onServiceTypeChange}
        placeholder="Oil Change"
        required
      />

      <div className="form-row">
        <FormField
          id="serviceDate"
          label="Service date"
          type="date"
          value={serviceDate}
          onChange={onServiceDateChange}
          required
        />

        <FormField
          id="mileage"
          label="Mileage"
          type="number"
          value={mileage}
          onChange={onMileageChange}
          placeholder="42500"
          required
        />
      </div>

      <FormField
        id="cost"
        label="Cost"
        type="number"
        step="0.01"
        value={cost}
        onChange={onCostChange}
        placeholder="59.99"
      />

      <label className="field">
        <span>Notes</span>
        <textarea
          className="textarea"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Optional details about the service performed"
        />
      </label>

      <div className="form-actions">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>

        {onCancel ? (
          <button
            className="btn btn-secondary"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default MaintenanceRecordForm;
