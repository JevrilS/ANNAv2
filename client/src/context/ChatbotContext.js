import { createContext, useState } from 'react';

// Create the context
export const ChatbotContext = createContext(null);

// Create the provider component
export const ChatbotProvider = ({ children }) => {
  // Define the state for user and setUser
  const [user, setUser] = useState(null);
  const [showbot, setShowbot] = useState(false); // Example of another state

  return (
    <ChatbotContext.Provider value={{ user, setUser, showbot, setShowbot }}>
      {children}
    </ChatbotContext.Provider>
  );
};
