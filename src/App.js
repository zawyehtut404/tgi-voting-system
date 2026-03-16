import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, User, HardDrive, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_URL = "https://api.sheetbest.com/sheets/a8fb09fc-0b1f-4ad8-850e-98d8d404d7b5"; 

function App() {
  const [candidates, setCandidates] = useState([]);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ show: false, type: '', message: '' });

  const startTime = new Date("2026-03-16T00:00:00");
  const endTime = new Date("2026-03-19T23:59:59");
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
      const res = await axios.get(API_URL);
      setCandidates(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setStatus({ show: true, type, message });
    setTimeout(() => setStatus({ show: false, type: '', message: '' }), 3000);
  };

  const handleVote = async (id, currentVotes) => {
    if (voted) return showNotification('error', 'YOU HAVE ALREADY VOTED!');
    if (isExpired) return showNotification('error', 'VOTING PERIOD HAS ENDED.');

    try {
      const response = await axios.patch(`${API_URL}/id/${id}`, {
        vote_count: parseInt(currentVotes || 0) + 1
      });

      if(response.status === 200 || response.status === 201) {
        localStorage.setItem('tgi_voted_2026', 'true');
        setVoted(true);
        fetchData(); 
        showNotification('success', 'VOTE RECORDED SUCCESSFULLY!');
      }
    } catch (err) {
      showNotification('error', 'DATABASE UPDATE FAILED.');
    }
  };

  if (loading) return (
    <div className="app-container loader-box">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
        <HardDrive size={40} color="#00d2ff" />
      </motion.div>
      <motion.h2 animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        INITIALIZING SYSTEM...
      </motion.h2>
    </div>
  );

  return (
    <div className="app-container">
      {/* --- Custom Notification Overlay --- */}
      <AnimatePresence>
        {status.show && (
          <motion.div 
            className="status-overlay"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <div className={`status-card ${status.type}`}>
              {status.type === 'success' ? <CheckCircle size={50} /> : <XCircle size={50} />}
              <h3>{status.message}</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="neon-title">TGi KING & QUEEN 2026</h1>
        <div className="meta-info">
          <p><User size={16} color="#ff007f"/> Posted by: <span className="highlight">Admin Team</span></p>
          <p><Clock size={16}/> Deadline: {endTime.toDateString()}</p>
        </div>
      </motion.header>

      <div className="voting-grid">
        {candidates.map((person, index) => (
          <motion.div 
            key={person.id} 
            className="candidate-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="img-wrapper">
              <img src={person.image_url || "https://via.placeholder.com/300x400"} className="candidate-img" alt={person.name} />
              <div className="id-badge">ID: {person.id}</div>
              {voted && <div className="voted-overlay"><CheckCircle size={40} color="#00ff00" /></div>}
            </div>

            <h2 className="candidate-name">{person.name}</h2>
            <p className="vote-display">{person.vote_count || 0} VOTES</p>

            <button 
              onClick={() => handleVote(person.id, person.vote_count)}
              disabled={voted || isExpired}
              className={`vote-btn ${voted ? 'disabled' : ''}`}
            >
              {voted ? "COMPLETED" : isExpired ? "CLOSED" : "CAST VOTE"}
            </button>
          </motion.div>
        ))}
      </div>

      <footer className="footer">
        <div className="footer-status">
          <HardDrive size={18}/>
          <span>DATA SECURED</span>
        </div>
        <p>&copy; 2026 TGi STUDENT FAIR</p>
        <div className="dev-credit">Developed by Htut</div>
      </footer>
    </div>
  );
}

export default App;