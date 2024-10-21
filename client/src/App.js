import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useRef } from 'react';
import { ModalProvider, ModalRenderer } from 'react-modal-state';
import api from './utils/api';  // Import the API utility

// Pages and Components
import AccountDetails from './components/pages/AccountDetails';
import Results from './components/pages/Results';
import AdminLogin from './components/pages/GuidanceLogin';
import Admin from './components/pages/Admin';
import Dashboard from './components/pages/Dashboard';
import Feedback from './components/pages/Feedback';
import Conversation from './components/pages/Conversation';
import ConversationDetails from './components/pages/ConversationDetails';
import PageNotFound from './components/pages/PageNotFound';
import LandingPage from './components/pages/LandingPage';
import { ChatbotContext } from './context/ChatbotContext';
import { UserContext } from './context/UserContext';
import LoginModal from './components/pages/LoginModal';
import RegisterModal from './components/pages/RegisterModal';
import ForgotPasswordModal from './components/pages/ForgotPasswordModal';  // Import the ForgotPasswordModal

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAgreeTermsConditions, setIsAgreeTermsConditions] = useState(false);
  const [showBot, setShowbot] = useState(true);
  const inputRef = useRef(null);
  const [disabledInput, setDisabledInput] = useState(false);
  const [isVisibleInput, setIsVisibleInput] = useState(true);
  const [botChatLoading, setBotChatLoading] = useState(false);
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [isRecommendationProvided, setIsRecommendationProvided] = useState({ riasec: '', strand: '' });
  const [basis, setBasis] = useState('');

  // Logout function to clear tokens and redirect
  const handleLogout = () => {
    localStorage.removeItem('authToken');  // Fix inconsistent token names
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    window.location.href = '/admin/login'; // Redirect to login page
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await api.post('/token/refresh/', {
        refresh: refreshToken,
      });

      if (response.status === 200) {
        localStorage.setItem('authToken', response.data.access);  // Ensure consistent naming
        return response.data.access;
      } else {
        console.error('Refresh token invalid or expired:', response.data);
        handleLogout();  // Log out if refresh token is invalid
        return null;
      }
    } catch (err) {
      console.error('Error refreshing access token:', err);
      handleLogout();  // Log out on error
      return null;
    }
  };

  const verify = async () => {
    try {
      const token = localStorage.getItem('authToken');  // Fix token key
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/is-verify/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data === true) {
        setIsAuthenticated(true);
      } else if (refreshToken) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verify();  // Verify authentication status on component mount
  }, []);

  const ChatbotContextValue = {
    isAgreeTermsConditions,
    setIsAgreeTermsConditions,
    showBot,
    setShowbot,
    disabledInput,
    setDisabledInput,
    inputRef,
    isVisibleInput,
    setIsVisibleInput,
    botChatLoading,
    setBotChatLoading,
    isRecommendationProvided,
    setIsRecommendationProvided,
    basis,
    setBasis,
  };

  const UserContextValue = {
    isAuthenticated,
    setIsAuthenticated,
    isSidebarActive,
    setIsSidebarActive,
    handleLogout,  // Pass the handleLogout function
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading screen while verifying
  }

  return (
    <ChatbotContext.Provider value={ChatbotContextValue}>
      <UserContext.Provider value={UserContextValue}>
        <ModalProvider
          modals={[
            ['login', LoginModal],
            ['register', RegisterModal],
            ['forgotPassword', ForgotPasswordModal],  // Register ForgotPassword modal here
          ]}
        >
          <Router>
            <AppRoutes isAuthenticated={isAuthenticated} />
          </Router>
          <ToastContainer theme="light" transition={Flip} autoClose={2000} />
          <ModalRenderer Component={LoginModal} />
          <ModalRenderer Component={RegisterModal} />
          <ModalRenderer Component={ForgotPasswordModal} />  {/* Add ForgotPasswordModal renderer */}
        </ModalProvider>
      </UserContext.Provider>
    </ChatbotContext.Provider>
  );
}

function AppRoutes({ isAuthenticated }) {
  return (
    <Routes>
      {/* Set LandingPage as the default */}
      <Route path='/' element={<LandingPage />} />

      {/* Admin protected route */}
      <Route
        path="/admin/*"
        element={isAuthenticated ? <Admin /> : <Navigate replace to="/admin/login" />}
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="conversation" element={<Conversation />} />
        <Route path="conversation/:conversationId" element={<ConversationDetails />} />
      </Route>

      {/* Redirect to dashboard if authenticated, otherwise show login */}
      <Route path="/admin/login" element={!isAuthenticated ? <AdminLogin /> : <Navigate replace to="/admin/dashboard" />} />

      {/* Other routes */}
      <Route path="/account" element={<AccountDetails />} />
      <Route path="/result" element={<Results />} />

      {/* Catch-all route for undefined paths */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;
