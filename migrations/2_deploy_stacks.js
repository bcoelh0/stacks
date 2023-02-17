const Stacks = artifacts.require("./Stacks.sol")
const WhitelistData = artifacts.require("./WhitelistData.sol")

module.exports = async function(deployer, network, accounts) {
  let treasury = accounts[0]
  let wlData = await  WhitelistData.deployed()
  await deployer.deploy(Stacks, treasury, wlData.address)
};
