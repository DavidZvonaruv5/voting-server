const { ethers } = require("ethers");
const DBConnector = require("./utils/DBConnector");
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const {ObjectId } = require('mongodb');


// console.log(typeof(process.env.CONTRACT_ADDRESS))
// const getArtifact = (artifactName) => {
//     try {
//       const artifact_path = path.join(__dirname, 'artifacts', 'contracts', 'VotingToken.sol', 'VotingToken.json');
  
//       // Check if the file exists
//       if (!fs.existsSync(artifact_path)) {
//         throw new Error(`ABI file not found at path: ${artifact_path}`);
//       }
  
//       // Read the file
//       const data = fs.readFileSync(artifact_path, 'utf8');
  
//       // Parse the file as JSON
//       let votingJSON;
//       try {
//         votingJSON = JSON.parse(data);
//       } catch (error) {
//         throw new Error(`Error parsing JSON from file: ${artifact_path}`);
//       }
  
//       // Check if the 'abi' key exists in the parsed JSON
//       if (!votingJSON.hasOwnProperty(artifactName)) {
//         throw new Error(`ABI not found in JSON file: ${artifact_path}`);
//       }
  
//       return votingJSON[artifactName];
//     } catch (error) {
//       console.error(error.message);
//     }
//   }


// async function deployContract() {
//     // Set up provider and wallet
//     const provider = new ethers.providers.JsonRpcProvider(process.env['URL']);
//     const wallet = new ethers.Wallet(process.env['MTW_PRIVATE_KEY'], provider);
  
//     // Contract ABI and Bytecode (Replace with your actual ABI and Bytecode)
//     const abi = getArtifact('abi')
//     const bytecode = getArtifact('bytecode')
  
//     // Create a ContractFactory instance
//     const ContractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
  
//     // get the constructor parameters for the deployment of the contract.
//     const dbName = 'VoterDB';
    
//     const dbConnector = new DBConnector(dbName)
//     await dbConnector.connectToDatabase();
    
//     const db = dbConnector.client.db(dbName);
//     const collection = db.collection('voters_and_candidates');
  
//     const id = "66b8737c3469f64e5f3e22b0";
//     const doc = await collection.findOne({ _id: new ObjectId(id) });
//     const candidates = doc['candidates']
//     const voters = doc['voters']
  
//     candidates_addresses = candidates.map((candidate) => {return Object.values(candidate)[0]})
//     const voters_addresses = voters.map((voter) => {return Object.values(voter)[0]})
    
//     const total_time = 10
//     const contract = await ContractFactory.deploy(voters_addresses,candidates_addresses,total_time);
  
//     // Wait for the transaction to be mined
//     await contract.deployTransaction.wait();
  
//     // Log the contract address
//     console.log(`Contract deployed at address: ${contract.address}`);
  
//     // Verify if the contract has been deployed successfully
//     const code = await provider.getCode(contract.address);
  
//     if (code !== '0x') {
//       console.log('Contract deployed successfully!');
//       console.log(contract)
//     } else {
//       console.error('Contract deployment failed!');
//     }
  
//     return contract;
//   }

//   deployContract().catch((error) => {
//     console.log(error)
//   })
  