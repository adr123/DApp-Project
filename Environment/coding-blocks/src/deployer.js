import { ethers } from "ethers";
import { Solc } from "solc-browserify";

async function compileSolidity(solidityCode) {
    const compiler = new Solc();
  
    try {
      console.log("Initializing Solidity compiler...");
      const output = await compiler.compile(solidityCode);
      console.log("Compilation Output:", output);
  
      const contractKey = Object.keys(output.contracts["Compiled_Contracts"])[0];
      const contract = output.contracts["Compiled_Contracts"][contractKey];
  
      if (!contract || !contract.evm || !contract.evm.bytecode) {
        throw new Error("Bytecode not found in the compiled contract output");
      }
  
      const abi = contract.abi;
      const bytecode = contract.evm.bytecode.object;
  
      console.log("Compilation successful:", { abi, bytecode });
      return { abi, bytecode };
    } catch (error) {
      console.error("Error during Solidity compilation:", error);
      throw error;
    }
  }

// Deploy the contract to Ethereum via MetaMask
export async function deployContract() {
  const button = document.getElementById("slot");
  const solidityCode = `
    //SPDX-License-Identifier: MIT

    pragma solidity ^0.8.0;

    contract Twitter {
        constructor(){
            MAX_TWEET_LENGTH = 280;
        }

        struct tweet {
            string message;
            uint256 date;
            address author;
            uint256 likes;
            uint256 id;
        }
        uint16 MAX_TWEET_LENGTH;    
        struct User { 
            address addy;
            address username;
            uint256 age;
        }
        mapping(address => User) public users;
        mapping(address => tweet[]) public tweets;

        event NewUserRegistered(address indexed user, address username);
        event newTweetCreated(address indexed user, string message);

        modifier createAccount() {
            if(users[msg.sender].addy != msg.sender){
                users[msg.sender].addy = msg.sender;
                users[msg.sender].username = msg.sender;
                users[msg.sender].age = block.timestamp;
                emit NewUserRegistered(users[msg.sender].username, users[msg.sender].username);
            }
            _;
        }
        function getTotalLikes(address user) public view returns(uint256){
            uint256 numberOfLikes;
            require(tweets[user].length > 0, "No tweets found");
            for(uint256 i; i<tweets[user].length; i++){
                numberOfLikes += tweets[user][i].likes;
            }
            return numberOfLikes;
        }
        function likeTweet(address tAddress, uint256 id) external createAccount{
            require(tweets[tAddress][id].id == id, "Tweet does not exist");
            tweets[tAddress][id].likes += 1;
        }
        function dislikeTweet(address tAddress, uint256 id) external createAccount{
            require(tweets[tAddress][id].id == id, "Tweet does not exist");
            tweets[tAddress][id].likes --;
        }
        function createTweet(string memory _tweet) public createAccount{
            require (bytes (_tweet).length <= MAX_TWEET_LENGTH, "Your message is too long");
            emit newTweetCreated(msg.sender, _tweet);
            tweet memory aTweet = tweet({
                message: _tweet,
                author: msg.sender,
                date: block.timestamp,
                likes: 0,
                id: tweets[msg.sender].length
            });
            
            tweets[msg.sender].push(aTweet);
        }
        function changeTweetLength(uint16 newLength) public {
            MAX_TWEET_LENGTH = newLength;
        }
        function getTweet(uint _i) public view returns(tweet memory){
            return tweets[msg.sender][_i];
        }
        function getAllTweets() public view returns(tweet[] memory){
            return tweets[msg.sender];
        }
    }
  `;

  try {
    // Start the loading animation
    button.classList.add("loading");
    button.disabled = true;

    console.log("Compiling contract...");
    const { abi, bytecode } = await compileSolidity(solidityCode);
    console.log("Contract compiled successfully!", { abi, bytecode });

    if (typeof window.ethereum !== "undefined") {
      console.log("MetaMask detected, requesting accounts...");
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      console.log("Creating ContractFactory...");
      const factory = new ethers.ContractFactory(abi, bytecode, signer);

      console.log("Deploying contract...");
      const contract = await factory.deploy();

      console.log("Transaction sent. Waiting for confirmation...");
      await contract.waitForDeployment();

      const contractAddress = await contract.getAddress();
      console.log("Contract successfully deployed at:", contractAddress);
      alert(`Contract deployed at: ${contractAddress}`);
    } else {
      alert("MetaMask not detected. Please install MetaMask.");
    }
  } catch (error) {
    console.error("Error deploying contract:", error);
    alert("Deployment failed. Check the console for details.");
  } finally {
    // Stop the loading animation
    button.classList.remove("loading");
    button.disabled = false;
  }
}