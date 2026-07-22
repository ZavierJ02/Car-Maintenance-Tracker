function Topbar({ children }) {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <div className="brand">
          <div className="brand__mark">CM</div>
          <div className="brand__copy">
            <span className="brand__title">Car Maintenance Tracker</span>
            <span className="brand__subtitle">Vehicle service dashboard</span>
          </div>
        </div>

        <div className="topbar__actions">{children}</div>
      </div>
    </header>
  );
}

export default Topbar;
