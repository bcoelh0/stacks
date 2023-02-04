// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract Stacks is ERC721, ERC2981, Ownable {
  bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

  uint public constant PERCENT_DIVIDER = 10000;
  uint public SALE_FEE = 1000; // 10%

  mapping(uint => address) public tokenMinter;
  mapping(uint => TokenMetaData) public tokenMetaDataRecord;

  address public auctionHouse;
  bool public mintOpen;
  uint public maxSupply = 5000; // Immutable
  uint public softCap = 4009;
  uint public teamMinted = 0;

  struct TokenMetaData {
    bool minted;
    uint timestamp;
  }

  constructor() ERC721("Stacks Alpha Card", "STACKS") {}

  function mint(uint _tokenId) public {
    require(mintOpen, "Minting is not open");
    require(_tokenId <= maxSupply, "Token ID is too high");
    require(tokenMinter[_tokenId] == msg.sender, "You are not allowed to mint this token");
    require(!tokenMetaDataRecord[_tokenId].minted, "Token has already been minted");

    _safeMint(msg.sender, _tokenId);
    tokenMetaDataRecord[_tokenId] = TokenMetaData(true, block.timestamp);
  }

  // Set who can mint the token with tokenId
  function addAvailableForMint(uint _tokenId, address _auctionWinner) internal {
    tokenMinter[_tokenId] = _auctionWinner;
  }

  // Admin functions
  function setAuctionHouse(address _auctionHouse) public onlyOwner {
    auctionHouse = _auctionHouse;
  }

  function toggleMint(bool _open) public onlyOwner {
    mintOpen = _open;
  }

  // Mint token for team members
  function teamMint(address _teamMember) public onlyOwner {
    // _tokenId for team is between 4010 and 5000
    uint _tokenId = softCap + teamMinted + 1;
    require(_tokenId <= maxSupply, "Token ID is too high");

    // make it so team can only mint 300 tokens per year
    // 2023: 4010 - 4309
    if(_tokenId >= 4310) {
      // 2024: 4310 - 4609
      require(block.timestamp > 1704067199, "Team can only mint 300 tokens in 2023"); // 31/12/2023
    }
    if(_tokenId >= 4610) {
      // 2025: 4610 - 4909
      require(block.timestamp > 1735689599, "Team can only mint 300 tokens in 2024"); // 31/12/2024
    }
    if(_tokenId >= 4910) {
      // 2026: 4910 - 5000
      require(block.timestamp > 1767225599, "Team can only mint the remaining tokens in 2025"); // 31/12/2025
    }

    // set minter
    addAvailableForMint(_tokenId, _teamMember);
    // set mint timestamp
    tokenMetaDataRecord[_tokenId] = TokenMetaData(true, block.timestamp);
    // mint token
    _safeMint(msg.sender, _tokenId);
    teamMinted++;
  }

  function setRegularFee(uint _SALE_FEE) public onlyOwner {
    require(_SALE_FEE <= 3300, "Fee must be less or equal to 33%");
    SALE_FEE = _SALE_FEE;
  }

  function supportsInterface(bytes4 _interfaceId) public view virtual override(ERC721, ERC2981) returns (bool) {
    if (_interfaceId == _INTERFACE_ID_ERC2981) { return true; }
    return super.supportsInterface(_interfaceId);
  }

  function royaltyInfo(uint256, uint256 _salePrice) override view public returns (address receiver, uint256 royaltyAmount){
    return (owner(), _salePrice * SALE_FEE / PERCENT_DIVIDER);
  }

  // Overwrite tokenURI
  // ignore tokenId as all the tokens have the same image
  function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
    _requireMinted(_tokenId);
    return string(abi.encodePacked(_baseURI()));
  }

  // Overwrite _baseURI
  function _baseURI() override pure internal returns (string memory) {
    return "ipfs://QmX7RzdCUHzPng8mssTpXABWTxVFVQwNX124tmpQUQiF9p/stacks";
  }
}
