function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2>Clientify</h2>
      </div>

      <div className="navbar-right">
        <button className="navbar-icon">🔔</button>

        <div className="profile">
          <div className="profile-avatar">PV</div>

          <div className="profile-info">
            <span className="profile-name">Priya</span>
            <span className="profile-role">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;