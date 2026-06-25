import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

// Import dei componenti
import Dashboard from './components/Dashboard';
import Register from './components/Register';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gestione autenticazione Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe; // Pulizia listener all'unmount
  }, []);

  // Schermata di caricamento
  if (loading) {
    return (
      <div className="h-screen w-full bg-natura flex items-center justify-center text-emerald-950 font-bold tracking-widest uppercase">
        Caricamento...
      </div>
    );
  }

  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="bg-natura min-h-screen">
          <Routes>
            {/* Rotta principale: Dashboard se loggato, altrimenti Login */}
            <Route 
              path="/" 
              element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
            />
            
            {/* Rotta Login: Register se NON loggato, altrimenti Dashboard */}
            <Route 
              path="/login" 
              element={!user ? <Register /> : <Navigate to="/" replace />} 
            />
            
            {/* Redirect per qualsiasi altra rotta errata */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;