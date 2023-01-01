// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract Stacks is ERC721, ERC2981, Ownable {
  bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

  uint public constant PERCENT_DIVIDER = 10000;
  uint public SALE_FEE = 1000;

  mapping(uint => address) public tokenMinter;
  mapping(uint => tokenMetaData) public tokenMetaDataRecord;

  address public auctionHouse;
  bool public mintOpen;
  uint public maxSupply = 5000; // Immutable
  uint public softCap = 4009;
  uint public teamMinted = 0;

  struct tokenMetaData {
    bool minted;
    uint tokenId;
    uint timestamp;
  }

  constructor() ERC721("Stacks", "STACKS") {}

  function mint(uint tokenId) public {
    require(mintOpen, "Minting is not open");
    require(tokenId < maxSupply, "Token ID is too high");
    require(tokenMinter[tokenId] == msg.sender, "You are not allowed to mint this token");
    require(!tokenMetaDataRecord[tokenId].minted, "Token has already been minted");

    _safeMint(msg.sender, tokenId);
    tokenMetaDataRecord[tokenId].minted = true;
  }

  // Set who can mint the token with tokenId
  function addAvailableForMint(uint tokenId, address auctionWinner) public {
    require(msg.sender == auctionHouse, "You are not the auction house");
    tokenMinter[tokenId] = auctionWinner;
  }

  // Runs before the auction so the auction house can set the metadata
  function prepTokenMetadata(uint tokenId) public {
    require(msg.sender == auctionHouse, "You are not the auction house");
    tokenMetaDataRecord[tokenId] = tokenMetaData({
      minted: false,
      tokenId: tokenId,
      timestamp: block.timestamp
    });
  }

  // Admin functions
  function setAuctionHouse(address _auctionHouse) public onlyOwner {
    auctionHouse = _auctionHouse;
  }

  function toggleMint(bool open) public onlyOwner {
    mintOpen = open;
  }

  // Mint token to offer new team members
  function teamMint(uint tokenId, address teamMember) public onlyOwner {
    // tokenId for team must be between 4009 and 5000
    require(tokenId > softCap, "Token ID too low");
    require(tokenId < maxSupply, "Token ID is too high");
    // addAvailableForMint
    tokenMinter[tokenId] = teamMember;
    // prepTokenMetadata
    tokenMetaDataRecord[tokenId] = tokenMetaData({
      minted: true,
      tokenId: tokenId,
      timestamp: block.timestamp
    });
    // mint
    _safeMint(msg.sender, tokenId);
    teamMinted++;
  }

  function setRegularFee(uint _SALE_FEE) public onlyOwner {
    SALE_FEE = _SALE_FEE;
  }

  function supportsInterface(bytes4 _interfaceId) public view virtual override(ERC721, ERC2981) returns (bool) {
    if (_interfaceId == _INTERFACE_ID_ERC2981) {
      return true;
    }
    return super.supportsInterface(_interfaceId);
  }

  // Overwrite BaseURI
  function _baseURI() override view internal returns (string memory) {
    return "ipfs://stacks...";
  }

  function royaltyInfo(uint256 _tokenId, uint256 _salePrice) override view public returns (address receiver, uint256 royaltyAmount){
    return (owner(), _salePrice * SALE_FEE / PERCENT_DIVIDER);
  }
}
