import { Search, Bell, UserCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="top-header">
      <div className="header-title">
        <h2>MUELDARO Agro & Farm Management System</h2>
        <p>Manage your farm operations from one place.</p>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search farm records..."
          />
        </div>

        <button className="header-icon-button">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <button className="profile-button">
          <UserCircle size={34} />

          <div className="profile-info">
            <strong>Farm Administrator</strong>
            <span>Owner</span>
          </div>
        </button>
      </div>
    </header>
  );
}