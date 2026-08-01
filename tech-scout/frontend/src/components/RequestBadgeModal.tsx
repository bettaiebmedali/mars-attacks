import { useState } from "react";
import type { Badge } from "../types";
import { LevelTag } from "./LevelTag";

interface Props {
  badge: Badge;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (comment: string) => void;
}

export function RequestBadgeModal({ badge, submitting, onCancel, onSubmit }: Props) {
  const [comment, setComment] = useState("");

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="modal-title">Request "{badge.name}"</h3>
        <LevelTag level={badge.level} />
        {badge.description && <p className="modal-description">{badge.description}</p>}

        <label className="field-label" htmlFor="comment">
          Tell your mentor why you deserve this badge
        </label>
        <textarea
          id="comment"
          className="field-input"
          rows={4}
          placeholder="e.g. I deployed a 3-tier app with Docker Compose and wrote the CI pipeline..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onSubmit(comment)}
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send request"}
          </button>
        </div>
      </div>
    </div>
  );
}
