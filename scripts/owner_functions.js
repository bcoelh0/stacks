require('dotenv').config()
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('@truffle/contract')
const owner = process.env.OWNER_WALLET

Main = {
  toEth: (n) => {
    return Web3.utils.fromWei(n, 'ether')
  },
  toWei: (n) => {
    return Web3.utils.toWei(n, 'ether')
  },
  usdcToEth: (n) => {
    return n / 1e6
  },
  usdcToWei: (n) => {
    return n * 1e6
  },
  setup: async () => {
    provider = new HDWalletProvider(
      process.env.PRIVATE_KEY,
      `https://goerli.infura.io/v3/${process.env.INFURA_ID}`
    )
    WlArtifact = require('../build/contracts/WhitelistStacks.json')
    Whitelist = TruffleContract(WlArtifact)
    Whitelist.setProvider(provider)
    return await Whitelist.deployed()
  },

  toggleContractAccess: async (access) => {
    console.log('start')
    let contract = await Main.setup()
    let gas = await contract.setContractActive.estimateGas(access, { from: owner } )
    try {
      await contract.setContractActive(access, { gas: gas, from: owner } ).once("transactionHash", async (txHash) => {
        console.log('txHash: https://etherscan.io/tx/' + txHash)
      })
    }
    catch (e) {
      console.log(e)
    }
    console.log('done')
    process.exit()
  },
  setOpenWithdrawals: async (open) => {
    console.log('start')
    let contract = await Main.setup()
    let gas = await contract.setOpenWithdrawals.estimateGas(open, { from: owner } )
    await contract.setOpenWithdrawals(open, { gas: gas, from: owner } ).once("transactionHash", async (txHash) => {
      console.log('txHash: https://etherscan.io/tx/' + txHash)
    })
    console.log('done')
    process.exit()
  },
  addToWhitelistAdmin: async (address) => {
    console.log('start')
    let contract = await Main.setup()
    let gas = await contract.addToWhitelistAdmin.estimateGas(address, { from: owner } )
    await contract.addToWhitelistAdmin(address, { gas: gas, from: owner } ).once("transactionHash", async (txHash) => {
      console.log('txHash: https://etherscan.io/tx/' + txHash)
    })
    console.log('done')
    process.exit()
  },
  removeUserFromWhitelist: async (address, decrementCount) => {
    console.log('start')
    let contract = await Main.setup()
    console.log(owner)
    let gas = await contract.removeUserFromWhitelist.estimateGas(address, decrementCount, { from: owner } )
    await contract.removeUserFromWhitelist(address, decrementCount, { gas: gas, from: owner } ).once("transactionHash", async (txHash) => {
      console.log('txHash: https://etherscan.io/tx/' + txHash)
    })
    console.log('done')
    process.exit()
  },
  withdrawFunds: async (to, amount) => {
    console.log('start')
    let contract = await Main.setup()
    let gas = await contract.withdrawFunds.estimateGas(to, amount, { from: owner } )
    await contract.withdrawFunds(to, amount, { gas: gas, from: owner } ).once("transactionHash", async (txHash) => {
      console.log('txHash: https://etherscan.io/tx/' + txHash)
    })
    console.log('done')
    process.exit()
  }
}

// // toggleContractAccess
// let access = process.argv[2].toString()
// access = (access == 'true') ? true : false
// Main.toggleContractAccess(access)

// setOpenWithdrawals
// let open = process.argv[2].toString()
// open = (open == 'true') ? true : false
// Main.setOpenWithdrawals(open)

// // addToWhitelistAdmin
// let address = process.argv[2].toString()
// Main.addToWhitelistAdmin(address)

// // withdrawFunds
// let to = process.argv[2].toString()
// let amount = process.argv[3].toString()
// amount = Main.usdcToWei(amount)
// Main.withdrawFunds(to, amount)

// // removeUserFromWhitelist
// let addressToRemove = process.argv[2].toString()
// let decrementCount
// if(process.argv[3] == undefined) {
//   decrementCount = false
// }
// else{
//   decrementCount = (process.argv[3].toString() == 'true') ? true : false
// }
// // decrementCount should be false if user to be removed was added by admin!
// // default is false as we should not decrement count if user was added regularly!
// Main.removeUserFromWhitelist(addressToRemove, decrementCount)
