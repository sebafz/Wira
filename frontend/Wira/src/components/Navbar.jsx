import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logoWira from "../assets/logoWira.png";

const NavbarContainer = styled.nav`
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavbarContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  img {
    height: 40px;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .name {
    font-weight: 600;
    color: #333;
    font-size: 0.9rem;
  }

  .role {
    font-size: 0.8rem;
    color: #666;
  }
`;

const ProfileButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e1e5e9;
  background: linear-gradient(135deg, #fc6b0a 0%, #ff8f42 100%);
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 8px 0;
  margin-top: 8px;
  opacity: ${(props) => (props.show ? 1 : 0)};
  visibility: ${(props) => (props.show ? "visible" : "hidden")};
  transform: ${(props) => (props.show ? "translateY(0)" : "translateY(-10px)")};
  transition: all 0.2s ease;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &.danger {
    color: #dc3545;
  }

  &.danger:hover {
    background-color: #ffeaa7;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e1e5e9;
  margin: 8px 0;
`;

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoClick = () => {
    navigate("/dashboard");
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleProfileView = () => {
    setShowDropdown(false);
    navigate("/profile");
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate("/login");
  };

  // Obtener las iniciales del usuario
  const getUserInitials = () => {
    if (!user?.nombre) return "U";
    return user.nombre
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Obtener el primer rol del usuario
  const getUserRole = () => {
    if (!user?.roles || user.roles.length === 0) return "Usuario";
    return user.roles[0];
  };

  return (
    <NavbarContainer>
      <NavbarContent>
        <Logo onClick={handleLogoClick}>
          <img src={logoWira} alt="Wira" />
        </Logo>

        <UserSection ref={dropdownRef}>
          <UserInfo>
            <div className="name">{user?.nombre || "Usuario"}</div>
            <div className="role">{getUserRole()}</div>
          </UserInfo>

          <ProfileButton onClick={handleProfileClick}>
            {getUserInitials()}
          </ProfileButton>

          <DropdownMenu show={showDropdown}>
            <DropdownItem onClick={handleProfileView}>
              👤 Ver perfil
            </DropdownItem>
            <Divider />
            <DropdownItem className="danger" onClick={handleLogout}>
              🚪 Cerrar sesión
            </DropdownItem>
          </DropdownMenu>
        </UserSection>
      </NavbarContent>
    </NavbarContainer>
  );
};

export default Navbar;
