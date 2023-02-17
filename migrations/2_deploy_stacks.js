var Stacks = artifacts.require("./Stacks.sol")

module.exports = async function(deployer, network, accounts) {
  let treasury = accounts[0]
  await deployer.deploy(Stacks, treasury)
};
