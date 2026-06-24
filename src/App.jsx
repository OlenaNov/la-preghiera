import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    

    return () => unsubscribe();
  }, []);

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
        <Routes>
          {/* Se utente loggato -> Dashboard, altrimenti -> Register */}
          <Route 
            path="/" 
            element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
          />
          
          {/* Se utente NON loggato -> Register, altrimenti -> Dashboard */}
          <Route 
            path="/login" 
            element={!user ? <Register /> : <Navigate to="/" replace />} 
          />
          
          {/* Gestione rotte non trovate */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;