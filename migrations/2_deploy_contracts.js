var Stacks = artifacts.require("./Stacks.sol");
var StacksAuctionHouse = artifacts.require("./StacksAuctionHouse.sol");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Stacks);
  await deployer.deploy(StacksAuctionHouse, accounts[0]);
};
