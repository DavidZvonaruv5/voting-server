require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const MTW_PRIVATE_KEY = process.env['MTW_PRIVATE_KEY'];
const URL = process.env['URL']
module.exports = {
  solidity: "0.8.24",
  networks: {
    mtw: {
      url: URL,
      accounts: [MTW_PRIVATE_KEY]
    }
  },
};