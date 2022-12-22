// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Stacks is ERC721, Ownable {
  // Todo:
  // - have a 33.3% tax if sold below X value for the treasury
  // - have a 10% tax for the treasury
  // add metadata

  mapping(uint => address) public tokenOwnershipRecord;
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
    string metadataURI;
  }

  constructor() ERC721("Stacks", "STACKS") {}

  function mint(uint tokenId) public {
    require(mintOpen, "Minting is not open");
    require(tokenId < maxSupply, "Token ID is too high");
    require(tokenOwnershipRecord[tokenId] == msg.sender, "You are not allowed to mint this token");
    require(!tokenMetaDataRecord[tokenId].minted, "Token has already been minted");

    _safeMint(msg.sender, tokenId);
    tokenMetaDataRecord[tokenId].minted = true;
  }

  // Set who can mint the token with tokenId
  function addAvailableForMint(uint tokenId, address auctionWinner) public {
    require(msg.sender == auctionHouse, "You are not the auction house");
    tokenOwnershipRecord[tokenId] = auctionWinner;
  }

  // Runs before the auction so the auction house can set the metadata
  function prepTokenMetadata(uint tokenId, string memory metadataURI) public {
    require(msg.sender == auctionHouse, "You are not the auction house");
    tokenMetaDataRecord[tokenId] = tokenMetaData({
      minted: false,
      tokenId: tokenId,
      timestamp: block.timestamp,
      metadataURI: metadataURI
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
  function teamMint(uint tokenId, string memory metadataURI, address teamMember) public onlyOwner {
    // tokenId for team must be between 4009 and 5000
    require(tokenId > softCap, "Token ID too low");
    require(tokenId < maxSupply, "Token ID is too high");
    // addAvailableForMint
    tokenOwnershipRecord[tokenId] = teamMember;
    // prepTokenMetadata
    tokenMetaDataRecord[tokenId] = tokenMetaData({
      minted: true,
      tokenId: tokenId,
      timestamp: block.timestamp,
      metadataURI: metadataURI
    });
    // mint
    _safeMint(msg.sender, tokenId);
    teamMinted++;
  }
}
