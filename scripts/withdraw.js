require('dotenv').config()
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('truffle-contract')
const owner = process.env.MAINNET_OWNER_WALLET

WithdrawFunds = {
  toWei: (n) => {
    // return Web3.utils.toWei(n, 'ether')
  },
  setup: async () => {
    provider = new HDWalletProvider(process.env.MAINNET_PRIVATE_KEY, process.env.MAINNET_HOST_URI)
    WlArtifact = require('../build/contracts/WhitelistStacks.json')
    Whitelist = TruffleContract(WlArtifact)
    Whitelist.setProvider(provider)
    return await Whitelist.deployed()
  },

  main: async (to, amount) => {
    console.log('start')
    let contract = await WithdrawFunds.setup()
    let gas = await contract.withdrawFunds.estimateGas(to, amount, { from: owner } )
    await contract.withdrawFunds(to, amount, { gas: gas, gasPrice: WithdrawFunds.toWei('0.00001'), from: owner } ).once("transactionHash", async (txHash) => {
      console.log('txHash: https://etherscan.io/tx/' + txHash)
    })
    console.log('done')
    process.exit()
  }
}

let to = process.argv[2].toString()
let amount = process.argv[3].toString()
amount = WithdrawFunds.toWei(amount)

WithdrawFunds.main(to, amount)
