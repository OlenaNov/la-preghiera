import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const traduzioniAuth = {
  it: { benvenuto: "Benvenuto", nome: "Nome", placeholderNome: "ES. MARIO ROSSI", data: "Data di Nascita", lingua: "Lingua", entra: "Entra" },
  en: { benvenuto: "Welcome", nome: "Name", placeholderNome: "E.G. JOHN DOE", data: "Date of Birth", lingua: "Language", entra: "Enter" },
  ru: { benvenuto: "Добро пожаловать", nome: "Имя", placeholderNome: "НАПР. ИВАН ИВАНОВ", data: "Дата рождения", lingua: "Язык", entra: "Войти" },
  uk: { benvenuto: "Ласкаво просимо", nome: "Ім'я", placeholderNome: "НАПР. ІВАН ІВАНЕНКО", data: "Дата народження", lingua: "Мова", entra: "Увійти" }
};

const Register = () => {
  const { lang, setLang } = useLanguage();
  const t = traduzioniAuth[lang] || traduzioniAuth.it;
  const [formData, setFormData] = useState({ nome: '', dataNascita: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.dataNascita) return;

    try {

      const res = await signInAnonymously(auth);
      
      await setDoc(doc(db, "utenti", res.user.uid), {
        nome: formData.nome.toUpperCase(),
        dataNascita: formData.dataNascita,
        lingua: lang,
        preferiti: []
      });
      
      navigate('/');
    } catch (e) {
      console.error(e);
      alert("Errore: " + e.message);
    }
  };

  return (
    <div className="h-screen w-full bg-natura flex items-center justify-center p-6 font-sans text-emerald-950">
      <div className="glass rounded-[40px] p-10 w-full max-w-md shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-500">
        
        <div className="text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">{t.benvenuto}</h1>
          <div className="h-1 w-20 bg-emerald-900/20 mx-auto rounded-full"></div>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase ml-2 opacity-60">{t.nome}</label>
            <input 
              type="text"
              style={{ textTransform: 'uppercase' }}
              className="bg-white/40 p-4 rounded-2xl outline-none placeholder-emerald-900/40 font-medium transition focus:bg-white/60" 
              placeholder={t.placeholderNome}
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})} 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase ml-2 opacity-60">{t.data}</label>
            <input 
              type="date" 
              className="bg-white/40 p-4 rounded-2xl outline-none font-medium transition focus:bg-white/60" 
              value={formData.dataNascita}
              onChange={(e) => setFormData({...formData, dataNascita: e.target.value})} 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase ml-2 opacity-60">{t.lingua}</label>
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
            {t.entra}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;