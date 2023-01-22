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

  constructor() ERC721("Stacks", "STACKS") {}

  function mint(uint _tokenId) public {
    require(mintOpen, "Minting is not open");
    require(_tokenId <= maxSupply, "Token ID is too high");
    require(tokenMinter[_tokenId] == msg.sender, "You are not allowed to mint this token");
    require(!tokenMetaDataRecord[_tokenId].minted, "Token has already been minted");

    _safeMint(msg.sender, _tokenId);
    // tokenMetaDataRecord[_tokenId].minted = true;
    tokenMetaDataRecord[_tokenId] = TokenMetaData(true, block.timestamp);
  }

  // Set who can mint the token with tokenId
  function addAvailableForMint(uint _tokenId, address _auctionWinner) public {
    require(msg.sender == auctionHouse, "You are not the auction house");
    tokenMinter[_tokenId] = _auctionWinner;
  }

  // Runs before the auction so the auction house can set the metadata
  // function prepTokenMetadata(uint tokenId) public {
  //   require(msg.sender == auctionHouse, "You are not the auction house");
  //   tokenMetaDataRecord[tokenId] = TokenMetaData(false, block.timestamp);
  // }

  // Admin functions
  function setAuctionHouse(address _auctionHouse) public onlyOwner {
    auctionHouse = _auctionHouse;
  }

  function toggleMint(bool _open) public onlyOwner {
    mintOpen = _open;
  }

  // Mint token to offer new team members
  function teamMint(uint _tokenId, address _teamMember) public onlyOwner {
    // _tokenId for team must be between 4010 and 5000
    require(_tokenId > softCap, "Token ID too low");
    require(_tokenId <= maxSupply, "Token ID is too high");
    // addAvailableForMint
    tokenMinter[_tokenId] = _teamMember;
    // prepTokenMetadata
    tokenMetaDataRecord[_tokenId] = TokenMetaData(true, block.timestamp);
    // mint
    _safeMint(msg.sender, _tokenId);
    teamMinted++;
  }

  function setRegularFee(uint _SALE_FEE) public onlyOwner {
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
    return "ipfs://QmY2aPCZQNvsZUQvUS2g6cCSmdLXuhrHnRUEcoLfwy9HW4";
  }
}
