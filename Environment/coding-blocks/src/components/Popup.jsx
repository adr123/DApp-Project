import './Popup.css'; // Optional for styling the popup

const Popup = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>Welcome to Smart Blocks!</h2>
        <p>This website is designed to make creation of smart contracts on decentralized blockchains easier.</p>
        <p> There are pre-loaded templates for you to explore.</p>
        <ul>
          
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Popup;
