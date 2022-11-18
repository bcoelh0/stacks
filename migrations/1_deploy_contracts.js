var WhitelistStacks = artifacts.require("./WhitelistStacks.sol");
var Fusdc = artifacts.require("./fusdc.sol");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Fusdc);
  let fusdc = await Fusdc.deployed();
  await deployer.deploy(WhitelistStacks, fusdc.address);
};
