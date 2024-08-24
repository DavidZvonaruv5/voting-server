const { ethers } = require("ethers");
require('dotenv').config();

async function checkConnection() {
    console.log(process.env['URL'])
    const provider = new ethers.providers.JsonRpcProvider(process.env['URL']);
    const blockNumber = await provider.getBlockNumber();
    console.log("Connected to the network. Current block number:", blockNumber);
}

checkConnection()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Failed to connect to the network:", error);
        process.exit(1);
    });