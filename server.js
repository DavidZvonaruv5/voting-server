const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

//start of suggestion
const path = require('path');
const fs = require('fs');
//end of suggestion

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// strat of suggestion
const PASSWORD = process.env.PASSWORD
const USER = process.env.USER

const uri = `mongodb+srv://${USER}:${PASSWORD}@cluster0.yyza8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
//end of suggestion

const client = new MongoClient(uri);
const DB_NAME = 'VoterDB';
const COLLECTION_NAME = 'voters_and_candidates';
const db = client.db(DB_NAME);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

app.post('/verify', async (req, res) => {
  const { userId, metamaskAddress } = req.body;

  try {
    const db = client.db('VoterDB');
    const collection = db.collection('voters_and_candidates');


    // start of suggestion
    
    const id = "66b8737c3469f64e5f3e22b0";
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    const voters = doc['voters']

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
    const db = client.db('VoterDB');
    const collection = db.collection('voters_and_candidates');
    const id = "66b8737c3469f64e5f3e22b0";
    const document = await collection.findOne({ _id: new ObjectId(id) });

    if (document && document.candidates) {
      res.json(document.candidates);
    } else {
      res.status(404).json({ error: "Candidates not found" });
    }
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

async function retrieveAllDocuments() {
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);

  try {
    const documents = await collection.find({}).toArray();
    console.log("All documents in collection:", JSON.stringify(documents, null, 2));
    return documents;
  } catch (error) {
    console.error("Error retrieving documents:", error);
    return null;
  }
}

app.post('/verify-id', async (req, res) => {
  const { userId } = req.body;
  console.log("Received userId:", userId);

  if (!userId) {
    return res.status(400).json({ verified: false, message: "User ID is required" });
  }

  try {
    const documents = await retrieveAllDocuments();

    if (!documents || documents.length === 0) {
      console.log("No documents found in the collection");
      return res.json({ verified: false, message: "No data available" });
    }

    console.log("Number of documents in collection:", documents.length);

    let voterFound = null;
    for (const doc of documents) {
      if (doc.voters && Array.isArray(doc.voters)) {
        voterFound = doc.voters.find(voter => userId in voter);
        if (voterFound) break;
      }
    }

    if (voterFound) {
      console.log("Voter found:", voterFound);
      res.json({
        verified: true,
        message: "ID verified successfully",
        address: voterFound[userId]
      });
    } else {
      console.log("Voter not found");
      res.json({ verified: false, message: "ID not found" });
    }
  } catch (error) {
    console.error("Error during ID verification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/all-documents', async (req, res) => {
  try {
    const documents = await retrieveAllDocuments();
    res.json(documents);
  } catch (error) {
    console.error("Error retrieving all documents:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



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
