function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder,
  required = false,
  step,
}) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        className="input"
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        step={step}
      />
    </label>
  );
}

export default FormField;
