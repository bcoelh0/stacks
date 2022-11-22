// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FUSDC is ERC20 {
  constructor() ERC20('Fake USDC', 'FUSDC') {
    _mint(msg.sender, 10000000 * 10 ** 18);
  }
}
