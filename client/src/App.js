import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AccountDetails from './components/pages/AccountDetails';
import Results from './components/pages/Results';
import { useEffect, useState, useRef } from 'react';
import { ChatbotContext } from './context/ChatbotContext';
import { UserContext } from './context/UserContext';
import AdminLogin from './components/pages/GuidanceLogin';
import LandingPage from './components/pages/LandingPage';
import Admin from './components/pages/Admin';
import Dashboard from './components/pages/Dashboard';
import Feedback from './components/pages/Feedback';
import Conversation from './components/pages/Conversation';
import ConversationDetails from './components/pages/ConversationDetails';
import PageNotFound from './components/pages/PageNotFound';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [isAgreeTermsConditions, setIsAgreeTermsConditions] = useState(false);
  const [showBot, setShowbot] = useState(true);
  const inputRef = useRef(null);
  const [disabledInput, setDisabledInput] = useState(false);
  const [isVisibleInput, setIsVisibleInput] = useState(true);
  const [botChatLoading, setBotChatLoading] = useState(false);
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [isRecommendationProvided, setIsRecommendationProvided] = useState({ riasec: '', strand: '' });
  const [basis, setBasis] = useState('');

  const refreshAccessToken = async () => {
    try {
      const response = await fetch('/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: localStorage.getItem('refreshToken') }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access);
        return data.access;
      } else {
        console.error('Refresh token invalid or expired:', data);
        return null;
      }
    } catch (err) {
      console.error('Error refreshing access token:', err);
      return null;
    }
  };

  const verify = async () => {
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('Token:', token);

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await fetch('/auth/is-verify', { headers: { token } });
      const data = await response.json();

      if (data === true) {
        setIsAuthenticated(true); // Token is valid
        setLoading(false);
      } else if (data === false && refreshToken) {
        // Token is invalid, try refreshing it
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          setIsAuthenticated(true); // Refresh successful
        } else {
          setIsAuthenticated(false); // Refresh failed
        }
        setLoading(false);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    verify(); // Check authentication status on mount
  }, []);

  // This value is provided to all components using ChatbotContext
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

  // This value is provided to all components using UserContext
  const UserContextValue = {
    isAuthenticated,
    setIsAuthenticated,
    isSidebarActive,
    setIsSidebarActive,
  };

  if (loading) {
    // Show a loading screen while verifying
    return <div>Loading...</div>;
  }

  return (
    <ChatbotContext.Provider value={ChatbotContextValue}>
      <UserContext.Provider value={UserContextValue}>
        <Router>
          <Routes>
            {/* Set LandingPage as the default */}
            <Route path='/' element={<LandingPage />} />

            {/* Admin protected route */}
            <Route path='/admin/*' element={isAuthenticated ? <Admin /> : <Navigate replace to='/admin/login' />}>
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='feedback' element={<Feedback />} />
              <Route path='conversation' element={<Conversation />} />
              <Route path='conversation/:conversationId' element={<ConversationDetails />} />
            </Route>

            {/* Redirect to dashboard if authenticated, otherwise show login */}
            <Route path='/admin/login' element={!isAuthenticated ? <AdminLogin /> : <Navigate replace to='/admin/dashboard' />} />
            <Route path='/admin/dashboard' element={<Dashboard />} />

            {/* Other routes */}
            <Route path='/account' element={<AccountDetails />} />
            <Route path='/result' element={<Results />} />

            {/* Catch-all route for undefined paths */}
            <Route path='*' element={<PageNotFound />} />
          </Routes>
        </Router>
        <ToastContainer theme='light' transition={Flip} autoClose={2000} />
      </UserContext.Provider>
    </ChatbotContext.Provider>
  );
}

export default App;
