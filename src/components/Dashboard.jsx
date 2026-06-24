import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import preghiereData from '../list.json';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const traduzioni = {
  it: { utente: "Utente", preferiti: "Preferiti", entra: "Entra", esci: "Esci", cerca: "Cerca preghiera...", torna: "← Torna alla lista" },
  en: { utente: "User", preferiti: "Favorites", entra: "Login", esci: "Logout", cerca: "Search prayer...", torna: "← Back to list" },
  ru: { utente: "Пользователь", preferiti: "Избранное", entra: "Войти", esci: "Выйти", cerca: "Поиск молитвы...", torna: "← Назад" },
  uk: { utente: "Користувач", preferiti: "Обране", entra: "Увійти", esci: "Вийти", cerca: "Пошук молитви...", torna: "← Повернутися" }
};

const Dashboard = () => {
  const { lang, setLang } = useLanguage();
  const t = traduzioni[lang] || traduzioni.it;
  const [formData, setFormData] = useState({ nome: '', dataNascita: '' });
  const [preferitiIds, setPreferitiIds] = useState([]);
  const [preghieraSelezionata, setPreghieraSelezionata] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const user = auth.currentUser;
  const isFormValid = formData.nome.trim() !== '' && formData.dataNascita !== '';

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          const snap = await getDoc(doc(db, "utenti", user.uid));
          if (snap.exists()) {
            const data = snap.data();
            setFormData({ nome: data.nome || '', dataNascita: data.dataNascita || '' });
            setPreferitiIds(data.preferiti || []);

            if (data.lingua) setLang(data.lingua);
          }
        } catch (e) { console.error(e); }
      };
      loadData();
    }
  }, [user, setLang]);

  const cambiaLingua = async (nuovaLingua) => {
    setLang(nuovaLingua);
    if (user) {
      try {
        await updateDoc(doc(db, "utenti", user.uid), { lingua: nuovaLingua });
      } catch (e) { console.error("Errore aggiornamento lingua:", e); }
    }
  };

  const salvaUtente = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "utenti", user.uid), { ...formData, lingua: lang, preferiti: preferitiIds }, { merge: true });
      alert("Profilo aggiornato!");
    } catch (e) { console.error(e); }
  };

  const toggleFavorite = async (id, e) => {
    e.stopPropagation();
    if (!user) return;
    const userRef = doc(db, "utenti", user.uid);
    try {
      if (preferitiIds.includes(id)) {
        await updateDoc(userRef, { preferiti: arrayRemove(id) });
        setPreferitiIds(prev => prev.filter(item => item !== id));
      } else {
        await updateDoc(userRef, { preferiti: arrayUnion(id) });
        setPreferitiIds(prev => [...prev, id]);
      }
    } catch (e) { console.error(e); }
  };

  const eseguiLogout = async () => {
    try { await signOut(auth); } catch (e) { console.error(e); }
  };

  const listaPreferiti = preghiereData.filter(p => preferitiIds.includes(p.id));

  return (
    <div className="h-screen w-full bg-natura flex p-6 gap-6 font-sans text-emerald-950 overflow-hidden">
      <div className="w-1/4 flex flex-col gap-6">
        <div className="glass rounded-3xl p-6 flex flex-col gap-3 shadow-lg">
          <h2 className="text-center font-bold text-xl tracking-widest uppercase">{t.utente}</h2>
          <input className="bg-white/40 p-2 rounded-lg outline-none text-sm" placeholder="Nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
          <input type="date" className="bg-white/40 p-2 rounded-lg outline-none text-sm" value={formData.dataNascita} onChange={(e) => setFormData({...formData, dataNascita: e.target.value})} />
          <div className="flex justify-between gap-2 mt-2">
            {user ? (
              <button onClick={eseguiLogout} className="bg-emerald-900/10 hover:bg-emerald-900/20 px-4 py-1 rounded-lg text-xs font-bold uppercase transition text-emerald-950 border border-emerald-900/10">{t.esci}</button>
            ) : (
              <button disabled={!isFormValid} onClick={salvaUtente} className={`px-4 py-1 rounded-lg text-xs font-bold uppercase transition ${isFormValid ? 'bg-emerald-800/20 hover:bg-emerald-800/40' : 'bg-gray-300 opacity-50 cursor-not-allowed'}`}>{t.entra}</button>
            )}
            <select className="bg-emerald-800/20 p-1 rounded-lg text-xs outline-none uppercase cursor-pointer" value={lang} onChange={(e) => cambiaLingua(e.target.value)}>
              <option value="it">ITA</option><option value="en">ENG</option><option value="ru">РУС</option><option value="uk">UKR</option>
            </select>
          </div>
        </div>

        <div className="flex-1 glass rounded-3xl p-6 overflow-y-auto shadow-lg">
          <h3 className="font-bold uppercase mb-4 tracking-widest">{t.preferiti}</h3>
          <div className="flex flex-col gap-3">
            {listaPreferiti.map(p => (
              <div key={p.id} className="bg-white/30 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-white/50">
                <span className="text-xs font-bold truncate pr-2 flex items-center" onClick={() => setPreghieraSelezionata(p)}>
                  <span className="text-yellow-500 mr-2">★</span> {p.name[lang]}
                </span>
                <button onClick={(e) => toggleFavorite(p.id, e)} className="text-emerald-900/40 hover:text-red-500">✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[70%] flex flex-col gap-3 overflow-y-auto pr-2 items-center justify-start">
        {!preghieraSelezionata && (
          <input type="text" placeholder={t.cerca} className="w-[85%] mt-10 p-4 rounded-2xl glass outline-none placeholder-emerald-900/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        )}

        {preghieraSelezionata ? (
          <div className="glass w-[85%] mt-10 p-12 rounded-3xl shadow-2xl flex flex-col items-center text-center">
            <button onClick={() => setPreghieraSelezionata(null)} className="mb-8 px-6 py-2 bg-emerald-900/10 rounded-full text-sm font-bold hover:bg-emerald-900/20 transition self-start">{t.torna}</button>
            <h2 className="text-4xl font-extrabold mb-10 text-emerald-950">{preghieraSelezionata.name[lang]}</h2>
            <p className="text-xl leading-loose font-medium text-emerald-950 max-w-2xl border-t border-emerald-900/20 pt-10">{preghieraSelezionata.content[lang]}</p>
          </div>
        ) : (
          <div className="w-[85%] mt-6 flex flex-col gap-4">
            {preghiereData.filter(p => p.name[lang].toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div key={p.id} onClick={() => setPreghieraSelezionata(p)} className="glass w-full rounded-2xl p-6 flex justify-between items-center shadow-md hover:bg-emerald-100/40 transition cursor-pointer">
                <div className="flex items-center gap-4"><span className="text-2xl opacity-60">🙏</span><h3 className="font-bold text-lg uppercase tracking-tighter">{p.name[lang]}</h3></div>
                <button onClick={(e) => toggleFavorite(p.id, e)} className={`text-2xl transition-all ${preferitiIds.includes(p.id) ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 'text-emerald-900/30'}`}>★</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;