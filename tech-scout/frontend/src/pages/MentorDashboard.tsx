import { useEffect, useMemo, useState } from "react";
import { badgeRequestsApi } from "../api/endpoints";
import { ApiError } from "../api/client";
import { useToast } from "../context/ToastContext";
import type { IncomingBadgeRequest } from "../types";
import { LevelTag } from "../components/LevelTag";
import { StatusPill } from "../components/StatusPill";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";

type Tab = "pending" | "history";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function MentorDashboard() {
  const [tab, setTab] = useState<Tab>("pending");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<IncomingBadgeRequest[]>([]);
  const [history, setHistory] = useState<IncomingBadgeRequest[]>([]);
  const [actingId, setActingId] = useState<number | null>(null);

  const { notify } = useToast();

  async function loadAll() {
    setLoading(true);
    try {
      const [pendingList, allList] = await Promise.all([
        badgeRequestsApi.pending(),
        badgeRequestsApi.all(),
      ]);
      setPending(pendingList);
      setHistory(allList.filter((r) => r.status !== "PENDING"));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not load requests";
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approvedCount = useMemo(
    () => history.filter((r) => r.status === "APPROVED").length,
    [history]
  );

  async function handleDecision(request: IncomingBadgeRequest, decision: "approve" | "reject") {
    setActingId(request.id);
    try {
      if (decision === "approve") {
        await badgeRequestsApi.approve(request.id);
        notify(`Approved "${request.badge}" for ${request.user_name}`, "success");
      } else {
        await badgeRequestsApi.reject(request.id);
        notify(`Rejected "${request.badge}" for ${request.user_name}`, "info");
      }
      await loadAll();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Action failed";
      notify(message, "error");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Mentor review queue</h1>
          <p className="page-subtitle">Approve or reject badge requests from participants.</p>
        </div>
        <div className="stat-row">
          <div className="stat-chip">
            <span className="stat-value">{pending.length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">{approvedCount}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
      </div>

      <div className="tab-bar">
        <button className={tab === "pending" ? "active" : ""} onClick={() => setTab("pending")}>
          Pending review
          {pending.length > 0 && <span className="tab-dot">{pending.length}</span>}
        </button>
        <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>
          History
        </button>
      </div>

      {loading ? (
        <Spinner label="Loading requests..." />
      ) : tab === "pending" ? (
        pending.length === 0 ? (
          <EmptyState icon="✅" title="All caught up" message="No badge requests are waiting for review." />
        ) : (
          <div className="request-grid">
            {pending.map((req) => (
              <div className="request-card" key={req.id}>
                <div className="request-card-header">
                  <span className="navbar-avatar" aria-hidden="true">
                    {initials(req.user_name)}
                  </span>
                  <div>
                    <strong>{req.user_name}</strong>
                    <div className="request-card-email">{req.user}</div>
                  </div>
                </div>

                <div className="request-card-badge">
                  <LevelTag level={req.badge_level} />
                  <strong>{req.badge}</strong>
                </div>

                {req.comment && <p className="request-card-comment">"{req.comment}"</p>}

                <span className="list-row-date">Requested {formatDate(req.requested_at)}</span>

                <div className="modal-actions request-card-actions">
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={actingId === req.id}
                    onClick={() => handleDecision(req, "reject")}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={actingId === req.id}
                    onClick={() => handleDecision(req, "approve")}
                  >
                    {actingId === req.id ? "Working..." : "Approve"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : history.length === 0 ? (
        <EmptyState icon="🗂️" title="No decisions yet" message="Approved and rejected requests will show up here." />
      ) : (
        <div className="list-card">
          {history.map((req) => (
            <div className="list-row" key={req.id}>
              <div className="list-row-main">
                <div className="list-row-title">
                  <LevelTag level={req.badge_level} />
                  <strong>{req.badge}</strong>
                  <span className="list-row-sep">·</span>
                  <span>{req.user_name}</span>
                </div>
                {req.comment && <p className="list-row-comment">"{req.comment}"</p>}
                <span className="list-row-date">Requested {formatDate(req.requested_at)}</span>
              </div>
              <StatusPill status={req.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
