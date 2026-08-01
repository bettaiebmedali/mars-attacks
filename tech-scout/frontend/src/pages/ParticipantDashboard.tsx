import { useEffect, useMemo, useState } from "react";
import { badgeRequestsApi, badgesApi } from "../api/endpoints";
import { ApiError } from "../api/client";
import { useToast } from "../context/ToastContext";
import type { Badge, EarnedBadge, MyBadgeRequest } from "../types";
import { LevelTag } from "../components/LevelTag";
import { StatusPill } from "../components/StatusPill";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { RequestBadgeModal } from "../components/RequestBadgeModal";

type Tab = "explore" | "requests" | "earned";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ParticipantDashboard() {
  const [tab, setTab] = useState<Tab>("explore");
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [requests, setRequests] = useState<MyBadgeRequest[]>([]);
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [modalBadge, setModalBadge] = useState<Badge | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { notify } = useToast();

  async function loadAll() {
    setLoading(true);
    try {
      const [badgeList, requestList, earnedList] = await Promise.all([
        badgesApi.list(),
        badgeRequestsApi.mine(),
        badgesApi.myEarned(),
      ]);
      setBadges(badgeList);
      setRequests(requestList);
      setEarned(earnedList);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not load your data";
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const earnedBadgeIds = useMemo(() => new Set(earned.map((b) => b.badge_id)), [earned]);
  const pendingBadgeIds = useMemo(
    () => new Set(requests.filter((r) => r.status === "PENDING").map((r) => r.badge_id)),
    [requests]
  );

  async function handleRequestSubmit(comment: string) {
    if (!modalBadge) return;
    setSubmitting(true);
    try {
      await badgeRequestsApi.create(modalBadge.id, comment);
      notify(`Request sent for "${modalBadge.name}"`, "success");
      setModalBadge(null);
      await loadAll();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not send request";
      notify(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Your quest board</h1>
          <p className="page-subtitle">Collect badges by proving your skills to a mentor.</p>
        </div>
        <div className="stat-row">
          <div className="stat-chip">
            <span className="stat-value">{earned.length}</span>
            <span className="stat-label">Earned</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">{pendingCount}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">{badges.length}</span>
            <span className="stat-label">Available</span>
          </div>
        </div>
      </div>

      <div className="tab-bar">
        <button className={tab === "explore" ? "active" : ""} onClick={() => setTab("explore")}>
          Explore badges
        </button>
        <button className={tab === "requests" ? "active" : ""} onClick={() => setTab("requests")}>
          My requests
          {pendingCount > 0 && <span className="tab-dot">{pendingCount}</span>}
        </button>
        <button className={tab === "earned" ? "active" : ""} onClick={() => setTab("earned")}>
          My badges
        </button>
      </div>

      {loading ? (
        <Spinner label="Loading your quest board..." />
      ) : (
        <>
          {tab === "explore" && (
            badges.length === 0 ? (
              <EmptyState icon="🗺️" title="No badges published yet" />
            ) : (
              <div className="badge-grid">
                {badges.map((badge) => {
                  const isEarned = earnedBadgeIds.has(badge.id);
                  const isPending = pendingBadgeIds.has(badge.id);
                  return (
                    <div className="badge-card" key={badge.id}>
                      <div className="badge-card-top">
                        <LevelTag level={badge.level} />
                        {isEarned && <span className="status-pill status-approved"><span className="status-dot" />Earned</span>}
                        {!isEarned && isPending && <StatusPill status="PENDING" />}
                      </div>
                      <h3>{badge.name}</h3>
                      <p className="badge-description">{badge.description ?? "No description provided."}</p>
                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        disabled={isEarned || isPending}
                        onClick={() => setModalBadge(badge)}
                      >
                        {isEarned ? "Already earned" : isPending ? "Awaiting review" : "Request this badge"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {tab === "requests" && (
            requests.length === 0 ? (
              <EmptyState icon="📨" title="No requests yet" message="Head to Explore badges to send your first one." />
            ) : (
              <div className="list-card">
                {requests.map((req) => (
                  <div className="list-row" key={req.id}>
                    <div className="list-row-main">
                      <div className="list-row-title">
                        <LevelTag level={req.badge_level} />
                        <strong>{req.badge}</strong>
                      </div>
                      {req.comment && <p className="list-row-comment">"{req.comment}"</p>}
                      <span className="list-row-date">Requested {formatDate(req.requested_at)}</span>
                    </div>
                    <StatusPill status={req.status} />
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "earned" && (
            earned.length === 0 ? (
              <EmptyState icon="🏅" title="No badges earned yet" message="Request your first badge to get started." />
            ) : (
              <div className="badge-grid">
                {earned.map((badge) => (
                  <div className="badge-card badge-card-earned" key={badge.id}>
                    <div className="badge-card-top">
                      <LevelTag level={badge.level} />
                      <span className="badge-shine" aria-hidden="true">🏅</span>
                    </div>
                    <h3>{badge.name}</h3>
                    <p className="badge-description">{badge.description ?? "No description provided."}</p>
                    <span className="list-row-date">Earned {formatDate(badge.assigned_at)}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {modalBadge && (
        <RequestBadgeModal
          badge={modalBadge}
          submitting={submitting}
          onCancel={() => setModalBadge(null)}
          onSubmit={handleRequestSubmit}
        />
      )}
    </div>
  );
}
