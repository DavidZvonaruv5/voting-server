const {ObjectId } = require('mongodb');
const DBConnector = require('../utils/DBConnector.js')

const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '../.env');
console.log(envFilePath)
// Function to update or add an environment variable in the .env file

function updateEnvFile(key, value) {
    // Read existing .env file content
    let envContent = '';
    if (fs.existsSync(envFilePath)) {
        envContent = fs.readFileSync(envFilePath, 'utf8');
    }

    // Update or add the environment variable
    const regex = new RegExp(`^${key} = .*$`, 'm');
    if (regex.test(envContent)) {
        // Replace existing key-value pair
        envContent = envContent.replace(regex, `${key} = ${value}`);
    } else {
        // Add new key-value pair
        envContent += `\n${key} = ${value}`;
    }

    // Write updated content back to .env file
    fs.writeFileSync(envFilePath, envContent.trim(), 'utf8');
    console.log(`Updated .env file: ${key}=${value}`);
}


async function main() {
    // strat of suggestion
    const dbName = 'VoterDB';

    const dbConnector = new DBConnector(dbName)
    await dbConnector.connectToDatabase();
    
    const db = dbConnector.client.db(dbName);
    const collection = db.collection('voters_and_candidates');

    const id = "66b8737c3469f64e5f3e22b0";
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    const candidates = doc['candidates']
    const voters = doc['voters']

    candidates_addresses = candidates.map((candidate) => {return Object.values(candidate)[0]})
    const voters_addresses = voters.map((voter) => {return Object.values(voter)[0]})

    // eslint-disable-next-line no-undef
    const Voting = await ethers.getContractFactory("VotingToken");
    
    const total_time = 90
    // Start deployment, returning a promise that resolves to a contract object
    const Voting_ = await Voting.deploy(voters_addresses,candidates_addresses,total_time);

    console.log("Contract address:", Voting_.address);
    updateEnvFile('CONTRACT_ADDRESS', Voting_.address);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

