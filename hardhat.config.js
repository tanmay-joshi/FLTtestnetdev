require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks:{
    skale:{
      url: `${process.env.RPC_ENDPOINT}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    }
  }
};
