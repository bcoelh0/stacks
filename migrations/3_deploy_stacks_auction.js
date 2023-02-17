var StacksAuctionHouse = artifacts.require("./StacksAuctionHouse.sol")

module.exports = async function(deployer, network, accounts) {
  let treasury = accounts[0]
  await deployer.deploy(StacksAuctionHouse, treasury)
};
