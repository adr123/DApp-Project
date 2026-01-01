// src/App.jsx
import "./App.css";
import { useState, useEffect , useRef} from "react";
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
import { workspace } from "./generators/solidity.js";

function AnimatedRoutes({workSpaceSaveState}) {
  // We need this so each route can have a unique key, allowing transitions.
  const location = useLocation();
  
  console.log("AnimatedRoutes remounted", workSpaceSaveState.current)
  return (
    <TransitionGroup>
      <CSSTransition key={location.pathname} classNames="slide" timeout={300}>
        <Routes location={location}>
          <Route path="/" element={<EditorPage saveSlot={workSpaceSaveState} />} />
          <Route path="/monitor" element={<MonitoringPage />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const workSpaceSaveState = useRef(0);
  useEffect(() => {
    //setShowPopup(true);
    if (!localStorage.getItem("visited")) {
      setShowPopup(true);
      localStorage.setItem("visited", "true");
    }
  }, []);
  useEffect(() => {
    console.log('save change')
  }, [workSpaceSaveState.current])
  
  const closePopup = () => setShowPopup(false);
  console.log("App remounted")
  
  return (
    <Router>
      {showPopup && <Popup onClose={closePopup} />}
      {/* Put the “ribbon” above the routes so it persists across pages */}
      <Ribbon />
      <AnimatedRoutes workSpaceSaveState={workSpaceSaveState} />
    </Router>
  );
}

export default App;
