const WhitelistStacks = artifacts.require("WhitelistStacks");
const FUSDC = artifacts.require("FUSDC");

let toWei = (n) => {
  return web3.utils.toWei(n, 'ether');
}

contract("WhitelistStacks", function (accounts) {
  before(async function () {

    // c
  });

  it("should assert true", async function () {
    await WhitelistStacks.deployed();
    return assert.isTrue(true);
  });

  // use addToWhitelist to register as the first whitelist user
  it("use addToWhitelist to register as the first whitelist user", async function () {
    const whitelistStacks = await WhitelistStacks.deployed();
    const fusdc = await FUSDC.deployed();

    let whitelistLength = await whitelistStacks.whitelistLength();
    assert.equal(whitelistLength.toString(), '0', "Whitelist is 0");

    await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[0] });
    await whitelistStacks.addToWhitelist('0x0000000000000000000000000000000000000000', { from: accounts[0] });
    whitelistLength = await whitelistStacks.whitelistLength();
    assert.equal(whitelistLength.toString(), '1', "Whitelist has been updated");
  });
});
