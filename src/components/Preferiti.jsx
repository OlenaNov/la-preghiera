import { useLanguage } from '../context/LanguageContext';
import preghiereData from '../list.json';
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Preferiti = () => {
  const { lang } = useLanguage();
  const [mieiPreferiti, setMieiPreferiti] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchPreferiti = async () => {
      if (userId) {
        const userSnap = await getDoc(doc(db, "utenti", userId));
        if (userSnap.exists()) {
          const ids = userSnap.data().preferiti || [];
          const filtrate = preghiereData.filter(p => ids.includes(p.id));
          setMieiPreferiti(filtrate);
        }
      }
    };
    fetchPreferiti();
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">I miei Preferiti</h1>
      {mieiPreferiti.length > 0 ? (
        mieiPreferiti.map(p => (
          <div key={p.id} className="p-6 bg-white border rounded-lg shadow mb-4">
            <h2 className="text-xl font-bold">{p.name[lang]}</h2>
            <p className="mt-2">{p.content[lang]}</p>
          </div>
        ))
      ) : (
        <p>Non hai ancora aggiunto preghiere ai preferiti.</p>
      )}
    </div>
  );
};

export default Preferiti;