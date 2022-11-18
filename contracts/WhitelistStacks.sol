// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WhitelistStacks is Ownable {
  ERC20 public usdcAddress;
  bool openWithdrawals;

  uint [] public plans = [
    100 * 10 ** 18,
    250 * 10 ** 18,
    500 * 10 ** 18,
    1000 * 10 ** 18
  ];

  struct Account {
    address accountAddress;
    address referredBy;
  }

  mapping(address => bool) public registered;
  mapping(address => uint) public referralsLength;
  uint public whitelistLength;
  Account [] public whitelist;

  event WhitelistAdded(address indexed account);
  event ReferralFeesPaid(address indexed account);

  constructor(address _usdcAddress) {
    usdcAddress = ERC20(_usdcAddress);
  }

  // make payment and add sender address to whitelist with according plan
  function addToWhitelist(address _referredBy) public {
    require(whitelistLength < 1000, "Sorry, whitelist is full");
    require(!registered[msg.sender], "Address already registered for whitelist");
    require(_referredBy != msg.sender, "You cannot refer yourself");

    // select correct plan
    uint plan;
    if(whitelistLength < 100) {
      plan = 0;
    } else if(whitelistLength < 250) {
      plan = 1;
    } else if(whitelistLength < 500) {
      plan = 2;
    } else {
      plan = 3;
    }

    // filter out referral if not registered
    address referredBy;
    if(registered[_referredBy]) {
      referredBy = _referredBy;
    }
    else {
      referredBy = address(0);
    }

    usdcAddress.transferFrom(msg.sender, address(this), plans[plan]);
    whitelist.push(Account(msg.sender, referredBy));
    whitelistLength++;
    registered[msg.sender] = true;
    referralsLength[referredBy] = referralsLength[referredBy] + 1;
    emit WhitelistAdded(msg.sender);
  }

  function receiveReferral() public {
    require(openWithdrawals, "Fund withdrawals are closed");
    require(referralsLength[msg.sender] > 0, "No referrals found");

    uint amount = amountToPayToReferrer(msg.sender);
    referralsLength[msg.sender] = 0;
    usdcAddress.transfer(msg.sender, amount);
    emit ReferralFeesPaid(msg.sender);
  }

  function amountToPayToReferrer(address _user) public view returns(uint) {
    return referralsLength[_user] * 50 * 10 ** 18;
  }

  // Admin functions
  function setOpenWithdrawals(bool _openWithdrawals) public onlyOwner {
    openWithdrawals = _openWithdrawals;
  }

  function withdrawFunds() public onlyOwner {
    usdcAddress.transfer(msg.sender, usdcAddress.balanceOf(address(this)));
  }
}

