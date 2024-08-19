const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const { ethers } = require("ethers");

//start of suggestion
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
const COLLECTION_NAME = 'voters_and_candidates';
const dbConnector = new DBConnector(DB_NAME,COLLECTION_NAME)

app.post('/verify', async (req, res) => {
  const { userId, metamaskAddress } = req.body;

  try {
    const voters = await getAll(dbConnector,'voters')

    const index = voters.findIndex((voter) => { return Object.keys(voter)[0] === userId })

    if (index === -1 || !(Object.values(voters[index])[0] === metamaskAddress )) {
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
    const candidates = await getAll(dbConnector,'candidates')

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

async function sendTokens() {
  // Connect to the Ethereum network
  const provider = new ethers.providers.JsonRpcProvider(process.env['URL']);
  const privateKey = process.env['MTW_PRIVATE_KEY'];
  const wallet = new ethers.Wallet(privateKey, provider);

  const contractAddress = process.env['CONTRACT_ADDRESS'];
  const abi = getABI();  
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  console.log(contract)
  //get all voters addresses
  const voters = await getAll(dbConnector,'voters')
  const voters_addresses = voters.map((voter) => {return Object.values(voter)[0]}) 
  
  //send voting rights to all allowed voters.
  for(let i=0;i<voters_addresses.length;i++){
    try {
     const tx =  await contract.giveRightToVote(i);
     console.log(tx);
     await tx.wait();
      console.log(`Voting rights successfully given to ${voters_addresses[i]}`);
    } catch (error) {
      console.log(`Failed to give voting rights to ${voters_addresses[i]}:`, error.reason);
    }
  }
}

async function sendWETH_forGas() {
  
}


const startServer = async () =>{
  await dbConnector.connectToDatabase();
  await sendTokens();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer()


// async function retrieveAllDocuments() {
//   const db = dbConnector.client.db(DB_NAME);
//   const collection = db.collection(COLLECTION_NAME);

//   try {
//     const documents = await collection.find({}).toArray();
//     console.log("All documents in collection:", JSON.stringify(documents, null, 2));
//     return documents;
//   } catch (error) {
//     console.error("Error retrieving documents:", error);
//     return null;
//   }
// }

// app.post('/verify-id', async (req, res) => {
//   const { userId } = req.body;
//   console.log("Received userId:", userId);

//   if (!userId) {
//     return res.status(400).json({ verified: false, message: "User ID is required" });
//   }

//   try {
//     const documents = await retrieveAllDocuments();

//     if (!documents || documents.length === 0) {
//       console.log("No documents found in the collection");
//       return res.json({ verified: false, message: "No data available" });
//     }

//     console.log("Number of documents in collection:", documents.length);

//     let voterFound = null;
//     for (const doc of documents) {
//       if (doc.voters && Array.isArray(doc.voters)) {
//         voterFound = doc.voters.find(voter => userId in voter);
//         if (voterFound) break;
//       }
//     }

//     if (voterFound) {
//       console.log("Voter found:", voterFound);
//       res.json({
//         verified: true,
//         message: "ID verified successfully",
//         address: voterFound[userId]
//       });
//     } else {
//       console.log("Voter not found");
//       res.json({ verified: false, message: "ID not found" });
//     }
//   } catch (error) {
//     console.error("Error during ID verification:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });


// app.get('/all-documents', async (req, res) => {
//   try {
//     const documents = await retrieveAllDocuments();
//     res.json(documents);
//   } catch (error) {
//     console.error("Error retrieving all documents:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });



//start of suggestion
// get contract address
app.get('/contract_address', async (req, res) => {
  try {
    res.json(process.env.CONTRACT_ADDRESS);
  } catch (error) {
    console.error("Error retrieving contract address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})
//end of suggestion


//start of suggestion

//get contract abi
const getABI = () => {
  try {
    const contract_abi_path = path.join(__dirname, 'artifacts', 'contracts', 'VotingToken.sol', 'VotingToken.json');

    // Check if the file exists
    if (!fs.existsSync(contract_abi_path)) {
      throw new Error(`ABI file not found at path: ${contract_abi_path}`);
    }

    // Read the file
    const data = fs.readFileSync(contract_abi_path, 'utf8');

    // Parse the file as JSON
    let votingJSON;
    try {
      votingJSON = JSON.parse(data);
    } catch (error) {
      throw new Error(`Error parsing JSON from file: ${contract_abi_path}`);
    }

    // Check if the 'abi' key exists in the parsed JSON
    if (!votingJSON.hasOwnProperty('abi')) {
      throw new Error(`ABI not found in JSON file: ${contract_abi_path}`);
    }

    return votingJSON['abi'];
  } catch (error) {
    console.error(error.message);
  }
}

// send contract abi to client
app.get('/contract_abi', async (req, res) => {
  try {
    const abi = getABI()
    res.send(abi)
  } catch (error) {
    console.error("Error retrieving contract address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

//end of suggestion
