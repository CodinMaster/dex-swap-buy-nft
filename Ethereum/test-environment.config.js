require('dotenv').config()

module.exports = {
  accounts: {
    amount: 20, // Number of unlocked accounts
    ether: 1e6,
  },
  
  node: { // Options passed directly to Ganache client
    fork: process.env.NODE_URL,
  },
};