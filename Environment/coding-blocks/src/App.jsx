// src/App.jsx
import "./App.css";
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import EditorPage from "./pages/EditorPage";
import MonitoringPage from "./pages/MonitoringPage";
import Popup from "./components/PopUp.jsx";
import Ribbon from "./components/Ribbon.jsx";

function AnimatedRoutes() {
  // We need this so each route can have a unique key, allowing transitions.
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition key={location.pathname} classNames="slide" timeout={300}>
        <Routes location={location}>
          <Route path="/" element={<EditorPage />} />
          <Route path="/monitor" element={<MonitoringPage />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

function App() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    //setShowPopup(true);
    if (!localStorage.getItem("visited")) {
      setShowPopup(true);
      localStorage.setItem("visited", "true");
    }
  }, []);

  const closePopup = () => setShowPopup(false);

  return (
    <Router>
      {showPopup && <Popup onClose={closePopup} />}
      {/* Put the “ribbon” above the routes so it persists across pages */}
      <Ribbon />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
