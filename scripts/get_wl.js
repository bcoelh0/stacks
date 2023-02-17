require('dotenv').config()
const ethers = require('ethers')

let main = async () => {
  let provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_ID}`)
  let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

  let contract = new ethers.Contract('0x8cb951535452bc15763e59b9e5ef7048c8a49e20', require('../build/contracts/WhitelistStacks.json')['abi'], wallet)
  let data = [], item
  for(i=0; i<110; i++) {
    item = await contract.whitelistArr(i)
    data.push(item)
    console.log(item, i)
  }

  console.log(data)
}

main()
