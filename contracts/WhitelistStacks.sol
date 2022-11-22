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
  uint public maxListLength = 1000;
  Account [] public whitelist;

  event WhitelistAdded(address indexed account);
  event ReferralFeesPaid(address indexed account);

  constructor(address _usdcAddress) {
    usdcAddress = ERC20(_usdcAddress);
  }

  // make payment and add sender address to whitelist with according plan
  function addToWhitelist(address _referredBy) public {
    require(whitelistLength < maxListLength, "Sorry, whitelist is full");
    require(!registered[msg.sender], "Address already registered for whitelist");
    require(_referredBy != msg.sender, "You cannot refer yourself");

    // select currect plan
    uint plan = currentPlan();

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

  function currentPlan() public view returns(uint) {
    if(whitelistLength < 100) {
      return 0;
    } else if(whitelistLength < 250) {
      return 1;
    } else if(whitelistLength < 500) {
      return 2;
    } else {
      return 3;
    }
  }

  function withdrawlsLeft() public view returns(uint) {
    uint totalLeft = 0;
    for(uint i=0; i < whitelist.length; i++){
      if(referralsLength[whitelist[i].referredBy] > 0){
        totalLeft++;
      }
    }
    return totalLeft;
  }

  function amountToPayToReferrer(address _user) public view returns(uint) {
    return referralsLength[_user] * 50 * 10 ** 18;
  }

  // Admin functions
  function setOpenWithdrawals(bool _openWithdrawals) public onlyOwner {
    openWithdrawals = _openWithdrawals;
  }

  function withdrawFunds(address to, uint amount) public onlyOwner {
    usdcAddress.transfer(to, amount);
  }

  function setMaxListLength(uint _maxListLength) public onlyOwner {
    maxListLength = _maxListLength;
  }
}

