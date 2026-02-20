import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppKitAccount } from '@reown/appkit/react';
import Layout from './components/Layout';
import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail';
import Learn from './pages/Learn';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Guide from './pages/Guide';
import VersePack from './pages/VersePack';
import { db } from './store';
import './web3'; // Initialize AppKit

import SplashScreen from './components/SplashScreen';

const App: React.FC = () => {
  const { address, isConnected } = useAppKitAccount();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let loadingFinished = false;
    const finishLoading = () => {
      if (loadingFinished) return;
      loadingFinished = true;
      setIsExiting(true);
      setTimeout(() => {
        setIsLoaded(true);
        setShowSplash(false);
      }, 500); // Match SplashScreen transition duration
    };

    const initDb = async () => {
      const startTime = Date.now();
      
      // Safety timeout: if DB takes > 10s, proceed anyway
      const safetyTimer = setTimeout(() => {
        console.warn('DB initialization timed out, proceeding to app');
        finishLoading();
      }, 10000);

      try {
        await db.init();
      } catch (err) {
        console.error('DB init error:', err);
      } finally {
        clearTimeout(safetyTimer);
      }
      
      const elapsedTime = Date.now() - startTime;
      const minTime = 2500;
      
      if (elapsedTime < minTime) {
        setTimeout(finishLoading, minTime - elapsedTime);
      } else {
        finishLoading();
      }
    };
    initDb();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      if (isConnected && address) {
        db.setActiveAddress(address);
      } else {
        db.setActiveAddress(null);
      }
    }
  }, [address, isConnected, isLoaded]);

  if (showSplash) {
    return <SplashScreen isExiting={isExiting} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<EventsList />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/verse-pack" element={<VersePack />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;