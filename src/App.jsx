import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import Home from './components/Home.jsx';
import GameVsComputer from './components/GameVsComputer.jsx';
import Lobby from './components/Lobby.jsx';
import GameOnline from './components/GameOnline.jsx';
import Store from './components/Store.jsx';
import Inventory from './components/Inventory.jsx';
import Leaderboard from './components/Leaderboard.jsx';

export default function App() {
  const { user, profile, loading, signOut } = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const [view, setView] = useState('home');
  const [guestPoints, setGuestPoints] = useState(0);
  const [activeGame, setActiveGame] = useState(null);

  const isGuest = !user;

  useEffect(() => {
    if (user) setGuestMode(false);
  }, [user]);

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="spinner" />
      </div>
    );
  }

  if (!user && !guestMode) {
    return <AuthScreen onGuest={() => setGuestMode(true)} />;
  }

  const goAuth = () => {
    setGuestMode(false);
    setView('home');
  };

  const navigate = (next) => {
    setActiveGame(null);
    setView(next);
  };

  const addGuestPoints = (n) => setGuestPoints((p) => p + n);

  const enterGame = (game) => {
    setActiveGame(game);
    setView('online-game');
  };

  let content;
  if (view === 'vs-computer') {
    content = (
      <GameVsComputer isGuest={isGuest} onGuestPoints={addGuestPoints} onBack={() => navigate('home')} />
    );
  } else if (view === 'online') {
    content = <Lobby isGuest={isGuest} onSignInPrompt={goAuth} onEnterGame={enterGame} />;
  } else if (view === 'online-game' && activeGame) {
    content = <GameOnline game={activeGame} onExit={() => navigate('online')} />;
  } else if (view === 'store') {
    content = <Store isGuest={isGuest} onSignInPrompt={goAuth} />;
  } else if (view === 'inventory') {
    content = <Inventory isGuest={isGuest} onNavigate={navigate} onSignInPrompt={goAuth} />;
  } else if (view === 'leaderboard') {
    content = <Leaderboard isGuest={isGuest} onSignInPrompt={goAuth} />;
  } else {
    content = <Home isGuest={isGuest} onNavigate={navigate} />;
  }

  return (
    <div className="app">
      <Header
        profile={profile}
        isGuest={isGuest}
        guestPoints={guestPoints}
        onSignOut={isGuest ? goAuth : signOut}
      />
      {isGuest && view === 'home' && (
        <div className="guest-banner">
          <span>👋 Playing as a guest — points are not saved.</span>
          <button className="btn btn-accent btn-sm" onClick={goAuth}>
            Sign in to save
          </button>
        </div>
      )}
      <div className="view" key={view}>
        {content}
      </div>
      <BottomNav view={view} onNavigate={navigate} />
    </div>
  );
}
