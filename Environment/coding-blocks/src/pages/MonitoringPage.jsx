import './MonitoringPage.css'

const MonitoringPage = () => {
  return (
    <div className="page-container">
      <div className="intro-container">
        <h1>Introduction to Smart Contracts</h1>
        <p id="p1">Learn the basics of how smart contracts work and how interactions happen.</p>
        <div className="intro-section">
          <h2>What is a Smart Contract?</h2>
          <p>
            A smart contract is a piece of code deployed on the blockchain that automatically executes actions based on its code and messages it recieves from others.
          </p>
        </div>
        <div className="intro-section">
          <h2>What Counts as a Message?</h2>
          <p>
            A message is alike an envelope from another Ethereum address (wallet or contract) containing ether and data on where in the contract it wants to trigger a reaction. Messages can:
          </p>
          <ul>
            <li>Call the functions you define in your contract.</li>
            <li>Send Ether to your contract to store or process.</li>
          </ul>
        </div>
        <div className="intro-section">
          <h2>Special Functions in Smart Contracts</h2>
          <ul>
            <li>
              <strong>Fallback Function:</strong> Triggered automatically when a message doesn't
              specify a function to call and contains no Ether.
            </li>
            <li>
              <strong>Receiver Function:</strong> Triggered automatically when a message doesn't
              specify a function to call but contains Ether.
            </li>
            <li>
              <strong>Constructor Function:</strong> Called once by you (The deployer) when the contract is deployed into the etherium network.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
