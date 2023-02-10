// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WhitelistData is Ownable {
  struct Account {
    uint tokenId;
    bool exists;
  }

  mapping(address => Account) public accounts;

  function bulkAddWhitelistAccounts(address[] memory _accounts) public onlyOwner {
    for(uint i = 0; i < _accounts.length; i++) {
      accounts[_accounts[i]] = Account(i, true);
    }
  }

  function addWhitelistAccount(address _account, uint _tokenId) public onlyOwner {
    accounts[_account] = Account(_tokenId, true);
  }

  function getWhitelistAccount(address _account) public view returns (Account memory) {
    return accounts[_account];
  }
}
