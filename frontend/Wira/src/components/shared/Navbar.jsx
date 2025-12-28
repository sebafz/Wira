import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logoWira from "../../assets/logoWira.png";
import { toast } from "react-toastify";

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

const NotificationButton = styled.button`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e1e5e9;
  background: white;
  color: #666;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f8f9fa;
    border-color: #fc6b0a;
    color: #fc6b0a;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  min-width: 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 50px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  width: 350px;
  max-height: 500px;
  margin-top: 8px;
  opacity: ${(props) => (props.show ? 1 : 0)};
  visibility: ${(props) => (props.show ? "visible" : "hidden")};
  transform: ${(props) => (props.show ? "translateY(0)" : "translateY(-10px)")};
  transition: all 0.2s ease;
  overflow: hidden;
`;

const NotificationHeader = styled.div`
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #333;
  font-weight: 600;
`;

const MarkAllReadButton = styled.button`
  background: none;
  border: none;
  color: #fc6b0a;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #fff5f0;
  }
`;

const NotificationList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: 12px 20px;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${(props) => (props.read ? "white" : "#f8f9ff")};

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const NotificationIcon = styled.div`
  font-size: 1.2rem;
  margin-top: 2px;
  flex-shrink: 0;
`;

const NotificationText = styled.div`
  flex: 1;
`;

const NotificationTitleText = styled.div`
  font-weight: ${(props) => (props.read ? "normal" : "600")};
  color: #333;
  font-size: 0.9rem;
  margin-bottom: 4px;
`;

const NotificationMessage = styled.div`
  color: #666;
  font-size: 0.8rem;
  line-height: 1.4;
  margin-bottom: 6px;
`;

const NotificationTime = styled.div`
  color: #999;
  font-size: 0.7rem;
`;

const EmptyNotifications = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
`;

const LoadingNotifications = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
`;

const ViewAllNotifications = styled.div`
  padding: 12px 20px;
  text-align: center;
  border-top: 1px solid #f1f3f4;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #fc6b0a;
  font-size: 0.9rem;
  font-weight: 500;

  &:hover {
    background-color: #e9ecef;
  }
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cargar notificaciones y conteo al montar el componente
  useEffect(() => {
    if (user?.usuarioID) {
      fetchNotifications();
      fetchUnreadCount();
    }
    // Conservative dependency management: Not adding fetchNotifications and fetchUnreadCount
    // to avoid potential infinite re-render loops. Functions are stable due to useCallback.
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.usuarioID) return;

    try {
      setLoadingNotifications(true);
      const response = await fetch(
        `http://localhost:5242/api/notificaciones/usuario/${user.usuarioID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setLoadingNotifications(false);
    }
  }, [user, token]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.usuarioID) return;

    try {
      const response = await fetch(
        `http://localhost:5242/api/notificaciones/usuario/${user.usuarioID}/no-leidas/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const count = await response.json();
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Error al cargar conteo de notificaciones:", error);
    }
  }, [user, token]);

  const markAsRead = async (notificationId) => {
    if (!user?.usuarioID) return;

    try {
      const response = await fetch(
        `http://localhost:5242/api/notificaciones/${notificationId}/marcar-leida/${user.usuarioID}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Actualizar el estado local
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.notificacionID === notificationId
              ? {
                  ...notification,
                  leido: true,
                  fechaLeido: new Date().toISOString(),
                }
              : notification
          )
        );

        // Actualizar el conteo
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.usuarioID) return;

    try {
      const response = await fetch(
        `http://localhost:5242/api/notificaciones/usuario/${user.usuarioID}/marcar-todas-leidas`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Actualizar el estado local
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            leido: true,
            fechaLeido: new Date().toISOString(),
          }))
        );

        // Actualizar el conteo
        setUnreadCount(0);
      }
    } catch (error) {
      console.error(
        "Error al marcar todas las notificaciones como leídas:",
        error
      );
      toast.error("Error al marcar notificaciones como leídas");
    }
  };

  const handleNotificationItemClick = (notification) => {
    if (!notification.leido) {
      markAsRead(notification.notificacionID);
    }

    // Navegar según el tipo de notificación
    if (notification.entidadTipo === "LICITACION" && notification.entidadID) {
      navigate(`/licitaciones`);
    }

    setShowNotifications(false);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Hace un momento";
    if (diffInSeconds < 3600)
      return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400)
      return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000)
      return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case "APERTURA":
        return "📢";
      case "CIERRE":
        return "⏰";
      case "ADJUDICACION":
        return "🏆";
      case "PROPUESTA":
        return "📋";
      default:
        return "🔔";
    }
  };

  const handleLogoClick = () => {
    navigate("/dashboard");
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
    }
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

        {/* Información del usuario*/}
        <UserSection ref={dropdownRef}>
          <UserInfo>
            <div className="name">{user?.nombre || "Usuario"}</div>
            <div className="role">{getUserRole()}</div>
          </UserInfo>

          <ProfileButton onClick={handleProfileClick}>
            {getUserInitials()}
          </ProfileButton>

          {/* Botón de notificaciones */}
          <div ref={notificationRef} style={{ position: "relative" }}>
            <NotificationButton onClick={handleNotificationClick}>
              🔔
              {unreadCount > 0 && (
                <NotificationBadge>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </NotificationBadge>
              )}
            </NotificationButton>

            <NotificationDropdown show={showNotifications}>
              <NotificationHeader>
                <NotificationTitle>Notificaciones</NotificationTitle>
                {unreadCount > 0 && (
                  <MarkAllReadButton onClick={markAllAsRead}>
                    Marcar todas como leídas
                  </MarkAllReadButton>
                )}
              </NotificationHeader>

              <NotificationList>
                {loadingNotifications ? (
                  <LoadingNotifications>
                    Cargando notificaciones...
                  </LoadingNotifications>
                ) : notifications.length === 0 ? (
                  <EmptyNotifications>
                    No tienes notificaciones
                  </EmptyNotifications>
                ) : (
                  <>
                    {notifications.slice(0, 10).map((notification) => (
                      <NotificationItem
                        key={notification.notificacionID}
                        read={notification.leido}
                        onClick={() =>
                          handleNotificationItemClick(notification)
                        }
                      >
                        <NotificationContent>
                          <NotificationIcon>
                            {getNotificationIcon(notification.tipo)}
                          </NotificationIcon>
                          <NotificationText>
                            <NotificationTitleText read={notification.leido}>
                              {notification.titulo}
                            </NotificationTitleText>
                            <NotificationMessage>
                              {notification.mensaje}
                            </NotificationMessage>
                            <NotificationTime>
                              {formatTimeAgo(notification.fechaCreacion)}
                            </NotificationTime>
                          </NotificationText>
                        </NotificationContent>
                      </NotificationItem>
                    ))}
                    {notifications.length > 10 && (
                      <ViewAllNotifications>
                        Ver todas las notificaciones
                      </ViewAllNotifications>
                    )}
                  </>
                )}
              </NotificationList>
            </NotificationDropdown>
          </div>

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
