import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, FolderPlus, LogIn, LogOut, MoreHorizontal, Upload, UserRound } from 'lucide-react';
import api from '../lib/axios';
import { showErrorToast } from '../lib/errorToast';
import useStorageStore from '../store/useStorageStore';

function DirectoryHeader({ onCreateFolderClick, onUploadFilesClick, fileInputRef, handleFileSelect, disabled = false }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { setAvailableSpace } = useStorageStore();

  useEffect(() => {
    api.get('/user').then(({ data }) => {
      setUser(data);
      setAvailableSpace(data.maxStorageInBytes - data.usedStorageInBytes);
    }).catch((error) => {
      if (error.response?.status !== 401) showErrorToast(error, 'Failed to fetch user info');
      setUser(null);
    });
  }, [setAvailableSpace]);

  useEffect(() => {
    const close = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) setShowUserMenu(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const logout = async (all = false) => {
    try {
      await api.post(all ? '/user/logout-all' : '/user/logout');
      setUser(null);
      navigate('/login');
    } catch (error) { showErrorToast(error, 'Failed to log out'); }
  };

  const used = user?.usedStorageInBytes ?? 0;
  const total = user?.maxStorageInBytes ?? 1;
  const percent = Math.min((used / total) * 100, 100);

  return (
    <header className="drive-topbar">
      <div className="drive-brand-wrap">
        <Link to="/" className="drive-brand" aria-label="S Drive home">
          <span className="drive-brand-mark"><Cloud size={19} strokeWidth={2.2} /></span>
          <span>s<span className="drive-brand-accent">drive</span></span>
        </Link>
        <span className="topbar-divider" />
        <span className="topbar-caption">Personal cloud</span>
      </div>
      <div className="drive-actions">
        <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileSelect} />
        <button className="drive-icon-button" onClick={onCreateFolderClick} disabled={disabled} title="New folder" aria-label="New folder"><FolderPlus size={18} /></button>
        <button className="drive-upload-button" onClick={onUploadFilesClick} disabled={disabled}><Upload size={16} /> <span>Upload files</span></button>
        <div className="profile-anchor" ref={menuRef}>
          <button className="profile-button" onClick={() => setShowUserMenu((value) => !value)} aria-label="Account menu">
            {user?.profile ? <img src={user.profile} alt="" /> : <UserRound size={18} />}
          </button>
          {showUserMenu && <div className="profile-menu">
            {user ? <>
              <div className="profile-menu-user"><strong>{user.name}</strong><span>{user.email}</span></div>
              <div className="storage-meter"><div><span>Storage</span><span>{(used / 1024 ** 3).toFixed(1)} / {(total / 1024 ** 3).toFixed(0)} GB</span></div><div className="storage-track"><span style={{ width: `${percent}%` }} /></div></div>
              <button onClick={() => logout(false)}><LogOut size={15} /> Sign out</button>
              <button className="danger-menu-action" onClick={() => logout(true)}><MoreHorizontal size={16} /> Sign out everywhere</button>
            </> : <button onClick={() => navigate('/login')}><LogIn size={16} /> Sign in</button>}
          </div>}
        </div>
      </div>
    </header>
  );
}

export default DirectoryHeader;
