import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import preghiereData from '../list.json';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const Preghiera = () => {
  const { lang } = useLanguage();
  const [preferiti, setPreferiti] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchPreferiti = async () => {
      if (userId) {
        const userRef = doc(db, "utenti", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setPreferiti(userSnap.data().preferiti || []);
        }
      }
    };
    fetchPreferiti();
  }, [userId]);

  const togglePreferito = async (idPreghiera) => {
    if (!userId) return alert("Devi registrarti!");
    try {
      const userRef = doc(db, "utenti", userId);
      await updateDoc(userRef, { preferiti: arrayUnion(idPreghiera) });
      setPreferiti([...preferiti, idPreghiera]);
    } catch (e) { console.error(e); }
  };


  const filteredPrayers = preghiereData.filter(p => 
    p.name[lang].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Le tue Preghiere</h1>
      
      {/* Barra di ricerca */}
      <input 
        type="text"
        placeholder={lang === 'it' ? "Cerca preghiera..." : "Search prayer..."}
        className="w-full p-4 mb-8 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <div className="space-y-6">
        {filteredPrayers.map((p) => {
          const isPreferito = preferiti.includes(p.id);
          return (
            <div key={p.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold mb-3 text-indigo-700">{p.name[lang]}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{p.content[lang]}</p>
              <button 
                onClick={() => togglePreferito(p.id)}
                className={`mt-5 text-sm font-semibold flex items-center gap-1 transition ${isPreferito ? 'text-rose-600' : 'text-slate-400'}`}
              >
                {isPreferito ? '♥ Già nei preferiti' : '♡ Aggiungi ai preferiti'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Preghiera;