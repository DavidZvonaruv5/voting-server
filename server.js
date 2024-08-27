const express = require('express');
const { ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const { ethers } = require("ethers");

const path = require('path');
const fs = require('fs');
const { getAll } = require('./utils/getData');
const DBConnector = require('./utils/DBConnector');
//end of suggestion

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DB_NAME = 'VoterDB';
const dbConnector = new DBConnector(DB_NAME)
let CONTRACT_ADDRESS = "0x";

app.post('/verify', async (req, res) => {
  const { userId, metamaskAddress } = req.body;

  try {
    const voters = await getAll(dbConnector, 'voters')

    const index = voters.findIndex((voter) => { return Object.keys(voter)[0] === userId })

    if (index === -1 || !(Object.values(voters[index])[0] === metamaskAddress)) {
      res.json({ verified: false, message: "User verification failed" });
    }

    // end of suggestion
    else {
      res.json({ verified: true, message: "User verified successfully" });
    }
  } catch (error) {
    console.error("Error during user verification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/candidates', async (req, res) => {
  try {
    const candidates = await getAll(dbConnector, 'candidates')

    if (candidates) {
      res.json(candidates);
    } else {
      res.status(404).json({ error: "Candidates not found" });
    }
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function sendTokens(contract) {
  // Connect to the Ethereum network
  const provider = new ethers.providers.JsonRpcProvider(process.env['URL']);
  const privateKey = process.env['MTW_PRIVATE_KEY'];
  const wallet = new ethers.Wallet(privateKey, provider);

  //get all voters addresses
  const voters = await getAll(dbConnector, 'voters')
  const voters_addresses = voters.map((voter) => { return Object.values(voter)[0] })

  //send voting rights to all allowed voters.

  for (let i = 0; i < voters_addresses.length; i++) {
    try {
      const tx = await contract.giveRightToVote(i);
      await tx.wait();
      console.log(`Voting rights successfully given to ${voters_addresses[i]}`);

    } catch (error) {
      console.log(`Failed to give voting rights to ${voters_addresses[i]}:`, error.reason);
    }

    // try {
    //   // send enough wei for voting
    //   const weiAmount = ethers.BigNumber.from('200000000000000');
    //   const transaction = { to: voters_addresses[i], value: weiAmount };

    //   // Send the transaction
    //   const transactionResponse = await wallet.sendTransaction(transaction);
    //   console.log(`Transaction sent to ${voters_addresses[i]}: ${transactionResponse.hash}`);

    //   // Wait for the transaction to be mined
    //   const receipt = await transactionResponse.wait();
    //   console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    // }
    // catch (err) {
    //   console.error(`Failed to send ETH to ${voters_addresses[i]}:`, err);
    // }
  }
}

async function deployContract() {
  // Set up provider and wallet
  const provider = new ethers.providers.JsonRpcProvider(process.env['URL']);
  const wallet = new ethers.Wallet(process.env['MTW_PRIVATE_KEY'], provider);

  // Contract ABI and Bytecode
  const abi = getArtifact('abi')
  const bytecode = getArtifact('bytecode')

  const ContractFactory = new ethers.ContractFactory(abi, bytecode, wallet);

  const dbName = 'VoterDB';

  const db = dbConnector.client.db(dbName);
  const collection = db.collection('voters_and_candidates');

  const id = "66b8737c3469f64e5f3e22b0";
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  const candidates = doc['candidates']
  const voters = doc['voters']

  candidates_addresses = candidates.map((candidate) => { return Object.values(candidate)[0] })
  const voters_addresses = voters.map((voter) => { return Object.values(voter)[0] })

  const total_time = 90
  const contract = await ContractFactory.deploy(voters_addresses, candidates_addresses, total_time);

  // Wait for the transaction to be mined
  await contract.deployTransaction.wait();

  console.log("Contract address:", contract.address);
  CONTRACT_ADDRESS = contract.address;

  // Verify if the contract has been deployed successfully
  const code = await provider.getCode(contract.address);

  if (code !== '0x') {
    console.log('Contract deployed successfully!');
  } else {
    console.error('Contract deployment failed!');
    throw new Error('FAILED TO DEPLOY CONTRACT')
  }

  return contract;
}


const startServer = async () => {
  let contract;
  try {
    await dbConnector.connectToDatabase();
  } catch (error) {
    console.log('Error connecting to the database:', error)
  }
  try {
    contract = await deployContract();
    console.log(contract.address)

  } catch (error) {
    console.log('Error deploying contract:', error)
  }
  try{
    await sendTokens(contract);
  } catch(error){
    console.log('Error sending tokens:', error)
  }
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer()

// get contract address
app.get('/contract_address', async (req, res) => {
  try {
    res.json(CONTRACT_ADDRESS);
  } catch (error) {
    console.error("Error retrieving contract address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

// send contract abi to client
app.get('/contract_abi', async (req, res) => {
  try {
    const abi = getArtifact('abi')
    res.send(abi)
  } catch (error) {
    console.error("Error retrieving contract address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

const getArtifact = (artifactName) => {
  try {
    const artifact_path = path.join(__dirname, 'artifacts', 'contracts', 'VotingToken.sol', 'VotingToken.json');

    // Check if the file exists
    if (!fs.existsSync(artifact_path)) {
      throw new Error(`ABI file not found at path: ${artifact_path}`);
    }

    // Read the file
    const data = fs.readFileSync(artifact_path, 'utf8');

    // Parse the file as JSON
    let votingJSON;
    try {
      votingJSON = JSON.parse(data);
    } catch (error) {
      throw new Error(`Error parsing JSON from file: ${artifact_path}`);
    }

    // Check if the 'abi' key exists in the parsed JSON
    if (!votingJSON.hasOwnProperty(artifactName)) {
      throw new Error(`ABI not found in JSON file: ${artifact_path}`);
    }

    return votingJSON[artifactName];
  } catch (error) {
    console.error(error.message);
  }
}
