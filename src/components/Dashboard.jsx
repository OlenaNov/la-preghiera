import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import preghiereData from '../list.json';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const traduzioni = {
  it: { utente: "Utente", preferiti: "Preferiti", entra: "Entra", esci: "Esci", cerca: "Cerca preghiera...", torna: "← Torna alla lista" },
  en: { utente: "User", preferiti: "Favorites", entra: "Login", esci: "Logout", cerca: "Search prayer...", torna: "← Back to list" },
  ru: { utente: "Пользователь", preferiti: "Избранное", entra: "Войти", esci: "Выйти", cerca: "Поиск молитвы...", torna: "← Назад" },
  uk: { utente: "Користувач", preferiti: "Обране", entra: "Увійти", esci: "Вийти", cerca: "Пошук молитви...", torna: "← Повернутися" }
};

const Dashboard = () => {
  const { lang, setLang } = useLanguage();
  const t = traduzioni[lang] || traduzioni.it;
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ nome: '', dataNascita: '' });
  const [preferitiIds, setPreferitiIds] = useState([]);
  const [preghieraSelezionata, setPreghieraSelezionata] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const isFormValid = formData.nome.trim() !== '' && formData.dataNascita !== '';

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, "utenti", user.uid);
    const unsubscribeSnapshot = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setFormData({ nome: data.nome || '', dataNascita: data.dataNascita || '' });
        setPreferitiIds(data.preferiti || []);
        if (data.lingua) setLang(data.lingua);
      }
    });
    return unsubscribeSnapshot;
  }, [user, setLang]);

  const salvaUtente = async () => {
    if (!user) return;
    const utentiRef = collection(db, "utenti");
    const q = query(utentiRef, where("nome", "==", formData.nome.toUpperCase()), where("dataNascita", "==", formData.dataNascita));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docEsistente = querySnapshot.docs[0];
      const datiTrovati = docEsistente.data();
      await setDoc(doc(db, "utenti", user.uid), { ...datiTrovati, uid: user.uid }, { merge: true });
    } else {
      await setDoc(doc(db, "utenti", user.uid), { nome: formData.nome.toUpperCase(), dataNascita: formData.dataNascita, preferiti: [], lingua: lang }, { merge: true });
    }
  };

  const toggleFavorite = async (id, e) => {
    e.stopPropagation();
    if (!user) return;
    const userRef = doc(db, "utenti", user.uid);
    
    if (preferitiIds.includes(id)) {
      await updateDoc(userRef, { preferiti: arrayRemove(id) });
    } else {
      // Uso merge: true per creare il doc se non esiste
      await setDoc(userRef, { preferiti: arrayUnion(id) }, { merge: true });
    }
  };

  const eseguiLogout = async () => await signOut(auth);
  const listaPreferiti = preghiereData.filter(p => preferitiIds.includes(p.id));

  return (
    <div className="min-h-screen w-full bg-natura p-4 md:p-6 font-sans text-emerald-950">
      <div className="main-container flex flex-col md:flex-row w-full gap-4 md:gap-6">
        <aside className="sidebar flex flex-col gap-4 h-auto md:h-[calc(100vh-48px)] overflow-y-auto">
          <div className="glass rounded-3xl p-5 flex flex-col gap-3 shadow-lg">
            <h2 className="text-center font-bold text-lg uppercase tracking-widest">{t.utente}</h2>
            <input className="bg-white/40 p-3 rounded-xl outline-none text-sm w-full" placeholder="Nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
            <input type="date" className="bg-white/40 p-3 rounded-xl outline-none text-sm w-full" value={formData.dataNascita} onChange={(e) => setFormData({...formData, dataNascita: e.target.value})} />
            
            <div className="flex justify-between items-center gap-2 mt-2 w-full">
              {user ? (
                <button onClick={eseguiLogout} className="w-full bg-emerald-800/20 hover:bg-emerald-800/40 text-emerald-950 px-4 py-2 rounded-xl text-xs font-bold uppercase transition">
                  {t.esci}
                </button>
              ) : (
                <button disabled={!isFormValid} onClick={salvaUtente} className={`w-full px-4 py-2 rounded-xl text-xs font-bold uppercase transition ${isFormValid ? 'bg-emerald-800/20 hover:bg-emerald-800/40 text-emerald-950' : 'bg-gray-300 opacity-50 cursor-not-allowed'}`}>
                  {t.entra}
                </button>
              )}
              <select className="bg-emerald-800/20 p-2 rounded-xl text-xs outline-none uppercase cursor-pointer" value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="it">ITA</option><option value="en">ENG</option><option value="ru">РУС</option><option value="uk">UKR</option>
              </select>
            </div>
          </div>

          <div className="flex-1 glass rounded-3xl p-5 overflow-y-auto shadow-lg min-h-[200px]">
            <h3 className="font-bold uppercase mb-4 tracking-widest text-sm">{t.preferiti}</h3>
            <div className="flex flex-col gap-2">
              {listaPreferiti.map(p => (
                <div key={p.id} className="bg-white/30 rounded-xl p-3 flex justify-between items-center hover:bg-white/50 transition cursor-pointer" onClick={() => setPreghieraSelezionata(p)}>
                  <span className="text-xs font-bold truncate pr-2 flex items-center"><span className="text-yellow-500 mr-2">★</span> {p.name[lang]}</span>
                  <button onClick={(e) => toggleFavorite(p.id, e)} className="text-emerald-900/40 hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="content-list w-full flex flex-col items-center overflow-y-auto">
          {!preghieraSelezionata && (
            <input type="text" placeholder={t.cerca} className="w-full max-w-2xl p-4 rounded-2xl glass outline-none placeholder-emerald-900/50 mb-4" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          )}
          {preghieraSelezionata ? (
            <div className="glass w-full max-w-2xl p-6 md:p-12 rounded-3xl shadow-2xl flex flex-col items-center text-center">
              <button onClick={() => setPreghieraSelezionata(null)} className="mb-6 px-5 py-2 bg-emerald-900/10 rounded-full text-xs font-bold hover:bg-emerald-900/20 transition self-start">{t.torna}</button>
              <h2 className="text-2xl md:text-4xl font-extrabold mb-6 text-emerald-950">{preghieraSelezionata.name[lang]}</h2>
              <p className="text-base md:text-xl leading-relaxed font-medium text-emerald-950 pt-6 border-t border-emerald-900/20">{preghieraSelezionata.content[lang]}</p>
            </div>
          ) : (
            <div className="w-full max-w-2xl flex flex-col gap-3">
              {preghiereData.filter(p => p.name[lang].toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                <div key={p.id} onClick={() => setPreghieraSelezionata(p)} className="glass w-full rounded-2xl p-4 md:p-6 flex justify-between items-center shadow-md hover:bg-emerald-100/40 transition cursor-pointer">
                  <div className="flex items-center gap-3"><span className="text-xl opacity-60">🙏</span><h3 className="font-bold text-sm md:text-lg uppercase tracking-tighter">{p.name[lang]}</h3></div>
                  <button onClick={(e) => toggleFavorite(p.id, e)} className={`text-xl transition-all ${preferitiIds.includes(p.id) ? 'text-yellow-500' : 'text-emerald-900/30'}`}>★</button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;