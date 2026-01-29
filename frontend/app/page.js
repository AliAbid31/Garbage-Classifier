"use client";
import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("fr"); 

  const content = {
    en: {
      title: "♻️ AI Eco-Sort",
      preview_text: "Image Preview",
      upload_btn: "📂 Choose an image...",
      analyzing_btn: "♻️ Analyzing...",
      predict_btn: "🔍 Identify Waste",
      result_title: "Analysis Result",
      confidence: "Confidence",
      labels: {
        cardboard: "📦 CardBoard",
        glass: "🍷 Glass",
        metal: "🔧 Metal",
        paper: "📄 Paper",
        plastic: "🥤 Plastic",
        trash: "🗑️ Other Trash"
      }
    },
    fr: {
      title: "♻️ IA Eco-Tri",
      preview_text: "Aperçu de l'image",
      upload_btn: "📂 Choisir une image...",
      analyzing_btn: "♻️ Analyse en cours...",
      predict_btn: "🔍 Identifier le déchet",
      result_title: "Résultat de l'analyse",
      confidence: "Confiance",
      labels: {
        cardboard: "📦 Carton",
        glass: "🍷 Verre",
        metal: "🔧 Métal",
        paper: "📄 Papier",
        plastic: "🥤 Plastique",
        trash: "🗑️ Déchets divers"
      }
    }
  };

  const t = content[language];

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile));
      setResult(null);
    }
    e.target.value = null;
  };

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert(language === "en" ? "Connection Error!" : "Erreur de connexion !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="floating-shapes">
        <span className="shape">🥤</span>
        <span className="shape">📦</span>
        <span className="shape">📄</span>
        <span className="shape">🍷</span>
        <span className="shape">🥫</span>
      </div>

      <div className="glass-card" style={{ position: 'relative' }}>
        
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            padding: "5px 10px",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.2)",
            color: "#333",
            fontSize: "0.8rem",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <option value="fr">🇫🇷 FR</option>
          <option value="en">🇬🇧 EN</option>
        </select>

        <h1 className="title">{t.title}</h1>
        
        <div className="image-preview">
          {image ? (
            <img src={image} alt="Preview" />
          ) : (
            <div style={{textAlign: 'center'}}>
              <p style={{fontSize: '3rem', marginBottom: '10px'}}>📸</p>
              <p>{t.preview_text}</p>
            </div>
          )}
        </div>

        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }} 
        />

        <label htmlFor="file-upload" className="btn-upload">
           {t.upload_btn}
        </label>

        {file && (
          <p style={{ textAlign: "center", marginBottom: "15px", fontSize: "0.9rem", color: "#059669", fontWeight: "600" }}>
            ✅ {file.name}
          </p>
        )}

        <button
          onClick={handlePredict}
          disabled={!file || loading}
          className="btn-analyze"
        >
          {loading ? t.analyzing_btn : t.predict_btn}
        </button>

        {result && (
          <div className="result-box">
            <p style={{ textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px", color: "#666" }}>
              {t.result_title}
            </p>
            
            <p className="result-class">
              {t.labels[result.class] || result.class}
            </p>

            <div style={{width: '100%', background: '#e5e7eb', height: '10px', borderRadius: '5px', marginTop: '10px', overflow: 'hidden'}}>
               <div style={{
                 width: `${result.confidence}%`, 
                 background: '#10b981', 
                 height: '100%', 
                 transition: 'width 1s ease'
               }}></div>
            </div>
            <p style={{marginTop: '5px', fontSize: '0.9rem'}}>
              {t.confidence} : <strong>{result.confidence}%</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
