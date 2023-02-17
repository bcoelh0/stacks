// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WhitelistData is Ownable {
  // Whitelist will have the last IDs not to disturb the auction contract
  uint public wlLength = 110;
  uint public startOfWl = 4009 - wlLength;
  uint public wlDataLength = 0;

  struct Account {
    uint tokenId;
    bool exists;
  }

  mapping(address => Account) public accounts;

  function bulkAddWhitelistAccounts(address[] memory _accounts) public onlyOwner {
    for(uint i = startOfWl; i < _accounts.length; i++) {
      accounts[_accounts[i]] = Account(i, true);
      wlDataLength++;
    }
  }

  function addWhitelistAccount(address _account) public onlyOwner {
    accounts[_account] = Account(wlDataLength, true);
    wlDataLength++;
  }

  function getWhitelistAccount(address _account) public view returns (Account memory) {
    return accounts[_account];
  }
}
