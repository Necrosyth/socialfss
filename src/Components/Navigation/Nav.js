import React, { useState, useEffect } from 'react';
import "../Navigation/Nav.css";
import { Link, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';

// Icons
import { AiOutlineHome, AiFillHome } from "react-icons/ai";
import { BsCompass, BsCompassFill } from "react-icons/bs";
import { IoNotificationsOutline, IoNotifications } from "react-icons/io5";
import { TbMessage } from "react-icons/tb";
import { LiaUserFriendsSolid } from "react-icons/lia";
import { FiBookmark, FiSettings } from "react-icons/fi";
import { RiUser3Line, RiUser3Fill } from "react-icons/ri";
import { BsList } from "react-icons/bs";

import Profile from "../../assets/profile.jpg";

const Nav = ({ search, setSearch, setShowMenu, profileImg }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.nav-sidebar') && !event.target.closest('.menu-toggle')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setMenuOpen(false);
    }
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav>
      {/* Left section - Logo */}
      <div className="nav-left">
        <div className="n-logo">
          <Link to="/home" className='logo' style={{textDecoration:"none"}}>
            <h1>AI<span>na</span></h1>
          </Link>
        </div>
      </div>

      {/* Middle section - Search */}
      <div className="nav-middle">
        <div className="n-form-button">
          <form className='n-form' onSubmit={(e)=>e.preventDefault()}>
            <input 
              type="text" 
              placeholder='Search AIna'
              id='n-search'
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />
            <SearchIcon className='search-icon'/>
          </form>
        </div>
      </div>

      {/* Right section - Profile */}
      <div className="nav-right">
        <div className="n-profile">
          <Link to="/profile"> 
            <img 
              src={profileImg ? profileImg : Profile} 
              className='n-img' 
              alt="Profile"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;