import { useNavigate } from "react-router-dom";
import './Ribbon.css';

const Ribbon = () => {
  const navigate = useNavigate();

  return (
    <div className="ribbon">
      <div className="title-container">
        <header>Smart Blocks</header>
        <div id="walletContainer">
          <button id="slot">Upload Contract</button>
        </div>
        <div className="ribbon-buttons">
          <button id='b1' onClick={() => navigate("/")}>Editor</button>
          <button id='b2' onClick={() => navigate("/monitor")}>Intro</button>
        </div>
      </div>
    </div>
  );
};

export default Ribbon;
