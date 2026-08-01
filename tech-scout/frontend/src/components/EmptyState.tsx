export function EmptyState({
  icon = "\u{1F4ED}",
  title,
  message,
}: {
  icon?: string;
  title: string;
  message?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <p className="empty-state-title">{title}</p>
      {message && <p className="empty-state-message">{message}</p>}
    </div>
  );
}
