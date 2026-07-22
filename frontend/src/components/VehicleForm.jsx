import FormField from "./FormField";

function VehicleForm({
  make,
  model,
  year,
  nickname,
  currentMileage,
  onMakeChange,
  onModelChange,
  onYearChange,
  onNicknameChange,
  onCurrentMileageChange,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Add vehicle",
  submittingLabel = "Saving vehicle...",
  onCancel,
  fullWidthSubmit = true,
}) {
  return (
    <form className="form-stack" onSubmit={onSubmit}>
      <FormField
        id="make"
        label="Make"
        value={make}
        onChange={onMakeChange}
        placeholder="Toyota"
        required
      />

      <FormField
        id="model"
        label="Model"
        value={model}
        onChange={onModelChange}
        placeholder="Camry"
        required
      />

      <div className="form-row">
        <FormField
          id="year"
          label="Year"
          type="number"
          value={year}
          onChange={onYearChange}
          placeholder="2020"
          required
        />

        <FormField
          id="currentMileage"
          label={onCancel ? "Current mileage" : "Mileage"}
          type="number"
          value={currentMileage}
          onChange={onCurrentMileageChange}
          placeholder="42500"
          required
        />
      </div>

      <FormField
        id="nickname"
        label="Nickname"
        value={nickname}
        onChange={onNicknameChange}
        placeholder="Daily driver"
      />

      <div className={onCancel ? "form-actions" : undefined}>
        <button
          className={
            fullWidthSubmit ? "btn btn-primary btn-full" : "btn btn-primary"
          }
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

export default VehicleForm;
