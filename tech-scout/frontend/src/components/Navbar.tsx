import { useAuth } from "../context/AuthContext";

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🛰️</span>
        <span>Tech Scout</span>
      </div>

      <div className="navbar-user">
        <span className={`role-badge role-${user.role.toLowerCase()}`}>
          {user.role}
        </span>
        <span className="navbar-avatar" aria-hidden="true">
          {initials(user.email)}
        </span>
        <span className="navbar-email">{user.email}</span>
        <button type="button" className="btn btn-ghost" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
