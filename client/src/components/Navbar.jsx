import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard',   label: 'HOME' },
    { to: '/courses',     label: 'COURSES' },
    { to: '/assignments', label: 'QUESTS' },
    { to: '/sessions',    label: 'SESSIONS' },
    { to: '/tags',        label: 'TAGS' },
    { to: '/search',      label: 'SEARCH' },
  ];

  return (
    <div className="navbar bg-primary text-primary-content px-4">
      {/* Left — hamburger + brand */}
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden border-0 shadow-none" style={{ boxShadow: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 bg-base-100 text-base-content w-52">
            {navLinks.map(l => (
              <li key={l.to}><Link to={l.to} className="font-game text-lg">{l.label}</Link></li>
            ))}
            {user?.role === 'admin' && (
              <li><Link to="/admin" className="font-game text-lg text-error">★ ADMIN</Link></li>
            )}
          </ul>
        </div>
        <Link to="/dashboard" className="font-game text-2xl tracking-wider">
          ⚡ FlowStud
        </Link>
      </div>

      {/* Center — desktop links */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {navLinks.map(l => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="font-game text-lg text-primary-content hover:bg-primary-content hover:text-primary"
              >
                {l.label}
              </Link>
            </li>
          ))}
          {user?.role === 'admin' && (
            <li>
              <Link to="/admin" className="font-game text-lg text-accent hover:bg-primary-content hover:text-primary">
                ★ ADMIN
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Right — player dropdown */}
      <div className="navbar-end">
        {user ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost border-0" style={{ boxShadow: 'none', border: 'none' }}>
              <span className="font-game text-lg">▶ {user.name?.split(' ')[0].toUpperCase()}</span>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 bg-base-100 text-base-content w-44">
              <li className="menu-title font-game text-sm text-base-content/50 py-1">PLAYER MENU</li>
              <li><Link to="/profile" className="font-game text-lg">PROFILE</Link></li>
              <li><button onClick={handleLogout} className="font-game text-lg text-error">QUIT GAME</button></li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-accent btn-sm font-game text-base">INSERT COIN</Link>
        )}
      </div>
    </div>
  );
}
