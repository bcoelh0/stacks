const WhitelistStacks = artifacts.require("WhitelistStacks");
const FUSDC = artifacts.require("FUSDC");

let toWei = (n) => {
  return n * 1e6;
}

contract("WhitelistStacks", async (accounts) => {
  let whitelistStacks, fusdc;

  before(async () => {
    fusdc = await FUSDC.new();
    whitelistStacks = await WhitelistStacks.new(fusdc.address);

    for(let i = 0; i < 4; i++) {
      await fusdc.transfer(accounts[i], toWei('1000'), { from: accounts[0] });
      await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[i] });
    }
    await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[9] });
  })

  describe('#addToWhitelist', async () => {
    it("use addToWhitelist to register as the first whitelist user", async () => {
      let whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '0', "Whitelist is 0");
      await whitelistStacks.addToWhitelist('0x0000000000000000000000000000000000000000', { from: accounts[0] });
      whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '1', "Whitelist has been updated");
    });

    it("use addToWhitelist to register another user with a referral", async () => {
      let whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '1', "Whitelist count is 1");
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
      let failed = false;
      try {
        await whitelistStacks.addToWhitelist(accounts[2], { from: accounts[2] });
      }
      catch (e) {
        assert.include(e.message, 'You cannot refer yourself', "Execution should fail");
        failed = true;
      }
      assert.equal(failed, true, "Whitelist has not been updated");
      let whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '2', "Whitelist has not been updated");
    });

    it("account tries to referral without being registered", async () => {
      // it will register the user, but referral will be 0x0
      let whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '2', "Whitelist has 2 users");

      // acc9 tries to be referral for acc3
      await whitelistStacks.addToWhitelist(accounts[9], { from: accounts[3] });

      whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '3', "Whitelist has been updated");

      // referral is 0x0
      let referred = await whitelistStacks.referralsLength(accounts[9], { from: accounts[0] });
      assert.equal(referred.toString(), '0', "User has not referred anyone");

      // acc3 is not referred by anyone
      let account = await whitelistStacks.whitelist(accounts[3])
      assert.equal(account.referredBy.toString(), '0x0000000000000000000000000000000000000000', "User has not been referred by anyone");
    });

    it("account tries to register without enough money", async () => {
      // shouldn't be able to
      let failed = false;
      try {
        await whitelistStacks.addToWhitelist('0x0000000000000000000000000000000000000000', { from: accounts[9] });
      }
      catch (e) {
        assert.include(e.message, 'transfer amount exceeds balance', "Execution should fail");
        failed = true;
      }
      assert.equal(failed, true, "Whitelist has not been updated");
      let whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '3', "Whitelist has not been updated");
    });

    it("100+ users register and this changes the price on the WL", async () => {
      let whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '3', "Whitelist has 3 users");

      let plan = await whitelistStacks.currentPlan();
      assert.equal(plan.toString(), '0', "Plan has been updated");

      // add 100 users
      for(let i = 4; i < 104; i++) {
        await fusdc.transfer(accounts[i], toWei('250'), { from: accounts[0] });
        await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[i] });

        await whitelistStacks.addToWhitelist('0x0000000000000000000000000000000000000000', { from: accounts[i] });
      }

      whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '103', "Whitelist has been updated");

      plan = await whitelistStacks.currentPlan();
      assert.equal(plan.toString(), '1', "Plan has been updated");
    });

    it("250+ users register and this changes the price on the WL", async () => {
      let whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '103', "Whitelist has 103 users");

      // add 150 users
      for(let i = 104; i < 254; i++) {
        await fusdc.transfer(accounts[i], toWei('500'), { from: accounts[0] });
        await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[i] });

        await whitelistStacks.addToWhitelist('0x0000000000000000000000000000000000000000', { from: accounts[i] });
      }

      whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '253', "Whitelist has been updated");

      let price = await whitelistStacks.currentPlan();
      assert.equal(price.toString(), '2', "Plan has been updated");
    });

    it("account tries to register without enough money", async () => {
      // shouldn't be able to
      await fusdc.transfer(accounts[299], toWei('499'), { from: accounts[0] });
      await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[299] });

      let failed = false;
      try {
        await whitelistStacks.addToWhitelist('0x0000000000000000000000000000000000000000', { from: accounts[299] });
      }
      catch (e) {
        assert.include(e.message, 'transfer amount exceeds balance', "Execution should fail");
        failed = true;
      }
      assert.equal(failed, true, "Whitelist has not been updated");
      let whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '253', "Whitelist has not been updated");
    });

    it("account can register with enough money", async () => {
      // shouldn't be able to
      // transfer 1 USDC so account has 500 now
      await fusdc.transfer(accounts[299], toWei('1'), { from: accounts[0] });

      await whitelistStacks.addToWhitelist('0x0000000000000000000000000000000000000000', { from: accounts[299] });
      let whitelistLength = await whitelistStacks.whitelistLength();
      assert.equal(whitelistLength.toString(), '254', "Whitelist has been updated");
    });
  });

  describe('#receiveReferral', async () => {
    it("user cannot withdraw if openWithdrawals is false", async () => {
      let failed = false;
      try {
        await whitelistStacks.receiveReferral({ from: accounts[0] });
      }
      catch (e) {
        assert.include(e.message, 'Fund withdrawals are closed', "Execution should fail");
        failed = true;
      }
      assert.equal(failed, true, "Execution should fail");
    });

    it("user cannot receive money if they didn't refer anyone", async () => {
      await whitelistStacks.setOpenWithdrawals(true, { from: accounts[0] });

      let failed = false;
      try {
        await whitelistStacks.receiveReferral({ from: accounts[299] });
      }
      catch (e) {
        assert.include(e.message, 'No referrals found', "Execution should fail");
        failed = true;
      }
      assert.equal(failed, true, "Execution should fail");
    });

    it("user refers 2 users and can receive 100 USDC", async () => {
      // referrer already added to list (acc299)
      // add 2 users
      await fusdc.transfer(accounts[298], toWei('500'), { from: accounts[0] });
      await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[298] });
      await whitelistStacks.addToWhitelist(accounts[299], { from: accounts[298] });

      await fusdc.transfer(accounts[297], toWei('500'), { from: accounts[0] });
      await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[297] });
      await whitelistStacks.addToWhitelist(accounts[299], { from: accounts[297] });

      let beforeBalance = await fusdc.balanceOf(accounts[299]);

      await whitelistStacks.receiveReferral({ from: accounts[299] });

      let afterBalance = await fusdc.balanceOf(accounts[299]);
      assert.equal((afterBalance- beforeBalance).toString(), toWei('100'), "User has received 100 USDC");
    });

    it("user refers 2 users but cant claim it twice", async () => {
      let beforeBalance = await fusdc.balanceOf(accounts[299]);
      let failed = false;
      try {
        await whitelistStacks.receiveReferral({ from: accounts[299] });
      }
      catch (e) {
        assert.include(e.message, 'No referrals found', "Execution should fail");
        failed = true;
      }
      assert.equal(failed, true, "Execution should fail");

      let afterBalance = await fusdc.balanceOf(accounts[299]);
      assert.equal((afterBalance- beforeBalance).toString(), toWei('0'), "User has not received 100 USDC");
    });
  });

  describe('#amountToPayToReferrer', async () => {
    before(async () => {
      await whitelistStacks.setOpenWithdrawals(false, { from: accounts[0] });

      // add 10 users
      // accounts[100] is the referrer
      for(let i = 260; i < 270; i++) {
        await fusdc.transfer(accounts[i], toWei('500'), { from: accounts[0] });
        await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[i] });
        await whitelistStacks.addToWhitelist(accounts[100], { from: accounts[i] });
      }

      // add 5 users
      // accounts[101] is the referrer
      for(let i = 270; i < 275; i++) {
        await fusdc.transfer(accounts[i], toWei('500'), { from: accounts[0] });
        await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[i] });
        await whitelistStacks.addToWhitelist(accounts[101], { from: accounts[i] });
      }

      // add 3 users
      // accounts[102] is the referrer
      for(let i = 275; i < 278; i++) {
        await fusdc.transfer(accounts[i], toWei('500'), { from: accounts[0] });
        await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[i] });
        await whitelistStacks.addToWhitelist(accounts[102], { from: accounts[i] });
      }

      // add 1 user
      // accounts[103] is the referrer
      await fusdc.transfer(accounts[278], toWei('500'), { from: accounts[0] });
      await fusdc.approve(whitelistStacks.address, toWei('10000'), { from: accounts[278] });
      await whitelistStacks.addToWhitelist(accounts[103], { from: accounts[278] });
    });

    it("user has 10 referrals", async () => {
      let amount = await whitelistStacks.amountToPayToReferrer(accounts[100]);
      assert.equal(amount.toString(), toWei('500'), "User has 10 referrals and should receive 500 USDC");
    });

    it("user has 5 referrals", async () => {
      let amount = await whitelistStacks.amountToPayToReferrer(accounts[101]);
      assert.equal(amount.toString(), toWei('250'), "User has 5 referrals and should receive 250 USDC");
    });

    it("user has 3 referrals", async () => {
      let amount = await whitelistStacks.amountToPayToReferrer(accounts[102]);
      assert.equal(amount.toString(), toWei('150'), "User has 3 referrals and should receive 150 USDC");
    });

    it("user has 1 referral", async () => {
      let amount = await whitelistStacks.amountToPayToReferrer(accounts[103]);
      assert.equal(amount.toString(), toWei('50'), "User has 1 referral and should receive 50 USDC");
    });

    it("user has 0 referrals", async () => {
      let amount = await whitelistStacks.amountToPayToReferrer(accounts[104]);
      assert.equal(amount.toString(), toWei('0'), "User has 0 referrals and should receive 0 USDC");
    });
  });

  // only owner tests
  describe('#setOpenWithdrawals', async () => {
    it("only owner can set open withdrawals", async () => {
      let failed = false;
      try {
        await whitelistStacks.setOpenWithdrawals(true, { from: accounts[1] });
      }
      catch (e) {
        assert.include(e.message, 'Ownable: caller is not the owner', "Execution should fail");
        failed = true;
      }
      assert.equal(failed, true, "Execution should fail");
    });

    it("only owner can set closed withdrawals", async () => {
      await whitelistStacks.setOpenWithdrawals(true, { from: accounts[0] });
    });
  });

  describe('#withdrawFunds', async () => {
    it("non-owner can't withdraw funds", async () => {
      let failed = false;
      try {
        await whitelistStacks.withdrawFunds('0x0000000000000000000000000000000000000000', toWei('10'), { from: accounts[1] });
      }
      catch (e) {
        assert.include(e.message, 'Ownable: caller is not the owner', "Execution should fail");
        failed = true;
      }
      assert.equal(failed, true, "Execution should fail");
    });

    it("owner can withdraw funds", async () => {
      let beforeBalance = await fusdc.balanceOf(accounts[0]);
      let contractBalance = await fusdc.balanceOf(whitelistStacks.address);
      await whitelistStacks.withdrawFunds(accounts[0], contractBalance.toString(), { from: accounts[0] });
      let afterBalance = await fusdc.balanceOf(accounts[0]);

      assert.equal((afterBalance - beforeBalance).toString(), contractBalance.toString(), "Owner has received contract USDC");
    });
  });


});
