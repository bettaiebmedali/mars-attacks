import type { RequestStatus } from "../types";

const LABELS: Record<RequestStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function StatusPill({ status }: { status: RequestStatus }) {
  return (
    <span className={`status-pill status-${status.toLowerCase()}`}>
      <span className="status-dot" />
      {LABELS[status]}
    </span>
  );
}
