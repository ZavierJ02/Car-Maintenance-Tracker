function Alert({ type = "error", children }) {
  if (!children) return null;
  return <p className={`alert alert-${type}`}>{children}</p>;
}

export default Alert;
