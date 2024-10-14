import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AccountDetails from './components/pages/AccountDetails';
import Results from './components/pages/Results'; // Import the Results page
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

function App() {
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [isAgreeTermsConditions, setIsAgreeTermsConditions] = useState(false);
   const [showBot, setShowbot] = useState(true);
   const inputRef = useRef(null);
   const [disabledInput, setDisabledInput] = useState(false);
   const [isVisibleInput, setIsVisibleInput] = useState(true);
   const [botChatLoading, setBotChatLoading] = useState(false);
   const [isSidebarActive, setIsSidebarActive] = useState(false);
   const [isRecommendationProvided, setIsRecommendationProvided] = useState({ riasec: '', strand: '' });
   const [basis, setBasis] = useState('');

   const verify = async () => {
      try {
         const response = await fetch('/auth/is-verify', { headers: { token: localStorage.getItem('token') } });
         const data = await response.json();
         data === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
      } catch (err) {
         console.error(err.message);
      }
   };

   useEffect(() => {
      verify();
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
   };

   return (
      <ChatbotContext.Provider value={ChatbotContextValue}>
         <UserContext.Provider value={UserContextValue}>
            <Router>
               <Routes>
                  <Route path='/' element={<LandingPage />} /> {/* Set LandingPage as the default */}
                  <Route path='/admin/' element={!isAuthenticated ? <Navigate replace to='/admin/login' /> : <Admin />}>
                     <Route path='dashboard' element={<Dashboard />} /> {/* This renders inside the Admin layout */}
                     <Route path='feedback' element={<Feedback />} />
                     <Route path='conversation' element={<Conversation />} />
                     <Route path='conversation/:conversationId' element={<ConversationDetails />} />
                  </Route>
                  <Route path='/admin/login' element={!isAuthenticated ? <AdminLogin /> : <Navigate replace to='/admin/dashboard' />} />
                  <Route path='/account' element={<AccountDetails />} />
                  <Route path='/result' element={<Results />} /> {/* Route for Results page */}
                  <Route path='*' element={<PageNotFound />} />
               </Routes>
            </Router>
            <ToastContainer theme='light' transition={Flip} autoClose='2000' />
         </UserContext.Provider>
      </ChatbotContext.Provider>
   );
}

export default App;
