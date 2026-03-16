import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, User, HardDrive, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_URL = "https://api.sheetbest.com/sheets/a8fb09fc-0b1f-4ad8-850e-98d8d404d7b5"; 

function App() {
  const [candidates, setCandidates] = useState([]);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  const startTime = new Date("2026-03-16T00:00:00");
  const endTime = new Date("2026-03-20T23:59:59");
  const now = new Date();
  const isExpired = now < startTime || now > endTime;

  useEffect(() => {
    fetchData();
    if (localStorage.getItem('tgi_voted_2026')) {
      setVoted(true);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      if (Array.isArray(res.data)) {
        setCandidates(res.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id, currentVotes) => {
    if (voted) return alert("You have already voted!");
    if (isExpired) return alert("Voting is currently closed.");

    try {
      // id က String ဖြစ်နေနိုင်လို့ URL မှာ သေချာအောင် ထည့်ပေးရပါတယ်
      const response = await axios.patch(
        `${API_URL}/id/${id}`, 
        { vote_count: parseInt(currentVotes || 0) + 1 },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200 || response.status === 201) {
        localStorage.setItem('tgi_voted_2026', 'true');
        setVoted(true);
        fetchData(); 
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Update failed. Column name (id, vote_count) နဲ့ API settings ကို ပြန်စစ်ပါ။");
    }
  };

  if (loading) return (
    <div className="app-container loader-box">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ color: '#00d2ff' }}
      >
        <HardDrive size={50} />
      </motion.div>
      <motion.h2 
        animate={{ opacity: [0.3, 1, 0.3] }} 
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        LOADING SYSTEM...
      </motion.h2>
    </div>
  );

  return (
    <div className="app-container">
      <motion.header 
        initial={{ opacity: 0, y: -50 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h1 className="neon-title">TGi KING & QUEEN 2026</h1>
        <div className="meta-info">
          <p><User size={16} /> Posted by: <span className="highlight">Admin Team</span></p>
          <p><Clock size={16} /> Deadline: {endTime.toDateString()}</p>
        </div>
      </motion.header>

      <div className="voting-grid">
        <AnimatePresence mode="popLayout">
          {candidates.map((person, index) => (
            <motion.div 
              key={person.id || index} 
              className="candidate-card"
              layout
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              whileHover={{ y: -10, boxShadow: "0 0 25px rgba(0, 210, 255, 0.4)" }}
            >
              <div className="img-wrapper">
                <motion.img 
                  whileHover={{ scale: 1.1 }}
                  src={person.image_url || "https://via.placeholder.com/300x400"} 
                  className="candidate-img"
                  alt={person.name}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300x400?text=Check+Image+URL"; }}
                />
                <div className="id-badge">ID: {person.id}</div>
                {voted && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="voted-overlay"
                  >
                    <CheckCircle size={50} color="#00ff00" />
                  </motion.div>
                )}
              </div>

              <h2 className="candidate-name">{person.name}</h2>
              
              <motion.div 
                key={person.vote_count}
                initial={{ scale: 1.5, color: "#ff007f" }}
                animate={{ scale: 1, color: "#00d2ff" }}
                className="vote-display"
              >
                VOTES: {person.vote_count || 0}
              </motion.div>

              <motion.button 
                whileTap={{ scale: 0.9 }}
                whileHover={!voted ? { scale: 1.05 } : {}}
                onClick={() => handleVote(person.id, person.vote_count)}
                disabled={voted || isExpired}
                className={`vote-btn ${voted ? 'disabled' : ''}`}
              >
                {voted ? "VOTED" : isExpired ? "CLOSED" : "CAST VOTE"}
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <footer className="footer">
        <div className="footer-status">
          <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <HardDrive size={18} />
          </motion.div>
          <span>SYSTEM ONLINE</span>
        </div>
        <p>&copy; 2026 TGi STUDENT FAIR</p>
        <div className="dev-credit">Developed by Htut</div>
      </footer>
    </div>
  );
}

export default App;