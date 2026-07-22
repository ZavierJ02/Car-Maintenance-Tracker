function StatCard({ label, value, meta, valueStyle }) {
  return (
    <article className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value" style={valueStyle}>
        {value}
      </div>
      <div className="stat-card__meta">{meta}</div>
    </article>
  );
}

export default StatCard;
