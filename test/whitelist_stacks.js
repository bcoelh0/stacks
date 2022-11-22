const WhitelistStacks = artifacts.require("WhitelistStacks");
const FUSDC = artifacts.require("FUSDC");

let toWei = (n) => {
  return web3.utils.toWei(n, 'ether');
}

contract("WhitelistStacks", async (accounts) => {
  let whitelistStacks, fusdc;

  before(async () => {
    fusdc = await FUSDC.new();
    whitelistStacks = await WhitelistStacks.new(fusdc.address);
    await fusdc.transfer(accounts[1], toWei('1000'), { from: accounts[0] })
  })

  describe('#addToWhitelist', async () => {
    it("use addToWhitelist to register as the first whitelist user", async () => {
      let whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '0', "Whitelist is 0");

      await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[0] });
      await whitelistStacks.addToWhitelist('0x0000000000000000000000000000000000000000', { from: accounts[0] });
      whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '1', "Whitelist has been updated");
    });

    it("use addToWhitelist to register another user with a referral", async () => {
      let whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '1', "Whitelist count is 1");

      await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[1] });
      // add acc1, referred by acc0
      await whitelistStacks.addToWhitelist(accounts[0], { from: accounts[1] });
      whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '2', "Whitelist has been updated");

      let referred = await whitelistStacks.referralsLength(accounts[0], { from: accounts[0] });
      assert.equal(referred.toString(), '1', "User has referred 1 other user");

      referred = await whitelistStacks.referralsLength(accounts[1], { from: accounts[0] });
      assert.equal(referred.toString(), '0', "Acc1 has not referred anyone");
    });

    it("account tries to register with itself as a referral", async () => {
      // shouldn't be able to
    });

    it("account tries to referral without being registered", async () => {
      // shouldn't be able to
    });

    it("account tries to register without enough money", async () => {
      // shouldn't be able to
    });

    it("100+ users register and this changes the price on the WL", async () => {
    });
  });

  describe('#receiveReferral', async () => {
    it("user cannot withdraw if openWithdrawals is false", async () => {
    });

    it("user cannot receive money if they didn't refer anyone", async () => {
    });

    it("user refers 2 users and can receive 100 USDC", async () => {
    });

    it("user refers 2 users but cant claim it twice", async () => {
    });
  });

  describe('#amountToPayToReferrer', async () => {
    it("user has 10 referrals", async () => {
    });

    it("user has 5 referrals", async () => {
    });

    it("user has 3 referrals", async () => {
    });

    it("user has 1 referral", async () => {
    });

    it("user has 0 referrals", async () => {
    });
  });
});
