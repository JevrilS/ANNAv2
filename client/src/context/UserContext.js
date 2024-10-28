import { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  const handleLogout = (navigate) => {
    console.log('Logout clicked from context!'); // Check if this is triggered  
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    navigate('/admin/login'); // Redirect after logout using the passed navigate function
  };

  return (
    <UserContext.Provider value={{ isAuthenticated, setIsAuthenticated, isSidebarActive, setIsSidebarActive, handleLogout }}>
      {children}
    </UserContext.Provider>
  );
};
