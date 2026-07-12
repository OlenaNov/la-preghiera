import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const Register = () => {
  const { lang, setLang } = useLanguage();
  const [formData, setFormData] = useState({ nome: '', dataNascita: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.dataNascita) return;

    try {
      const res = await signInAnonymously(auth);
      const utentiRef = collection(db, "utenti");
      const q = query(utentiRef, where("nome", "==", formData.nome.toUpperCase()), where("dataNascita", "==", formData.dataNascita));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docEsistente = querySnapshot.docs[0];
        await setDoc(doc(db, "utenti", res.user.uid), { 
          ...docEsistente.data(), 
          uid: res.user.uid 
        });
      } else {
        await setDoc(doc(db, "utenti", res.user.uid), {
          nome: formData.nome.toUpperCase(),
          dataNascita: formData.dataNascita,
          lingua: lang,
          preferiti: []
        });
      }
      navigate('/');
    } catch (e) {
      console.error(e);
      alert("Errore: " + e.message);
    }
  };

  return (
    <div className="h-screen w-full bg-natura flex items-center justify-center p-6 font-sans text-emerald-950">
      <div className="glass rounded-[40px] p-10 w-full max-w-md shadow-2xl flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Benvenuto</h1>
          <div className="h-1 w-20 bg-emerald-900/20 mx-auto rounded-full"></div>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase ml-2 opacity-60">Nome</label>
            <input 
              type="text"
              style={{ textTransform: 'uppercase' }}
              className="bg-white/40 p-4 rounded-2xl outline-none placeholder-emerald-900/40 font-medium transition focus:bg-white/60" 
              placeholder="ES. MARIO ROSSI"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})} 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase ml-2 opacity-60">Data di Nascita</label>
            <input 
              type="date" 
              className="bg-white/40 p-4 rounded-2xl outline-none font-medium transition focus:bg-white/60" 
              value={formData.dataNascita}
              onChange={(e) => setFormData({...formData, dataNascita: e.target.value})} 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase ml-2 opacity-60">Lingua</label>
            <select 
              className="bg-white/40 p-4 rounded-2xl outline-none font-bold cursor-pointer transition focus:bg-white/60 appearance-none" 
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="it">ITALIANO</option>
              <option value="en">ENGLISH</option>
              <option value="ru">РУССКИЙ</option>
              <option value="uk">УКРАЇНСЬКА</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={!formData.nome || !formData.dataNascita}
            className={`mt-4 p-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 ${
              formData.nome && formData.dataNascita 
              ? 'bg-emerald-900 text-white shadow-lg hover:scale-105 active:scale-95' 
              : 'bg-emerald-900/10 text-emerald-900/30 cursor-not-allowed'
            }`}
          >
            Entra
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;