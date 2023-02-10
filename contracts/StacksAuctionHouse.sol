// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Stacks.sol";

contract StacksAuctionHouse is Ownable, Stacks {
  mapping(uint => Auction) public auctions;
  mapping(uint => address payable) public auctionWinner;
  uint public totalAuctions = 0;
  address payable public treasuryAddress;

  struct Auction {
    uint endPrice;
    uint startTime;
    uint endTime;
    bool active;
  }

  constructor(address payable _treasuryAddress) {
    treasuryAddress = _treasuryAddress;

    uint startTime = 1677628800; // Wed Mar 01 2023 00:00:00 GMT+0000
    // Create the first auction
    auctions[0] = Auction({
      endPrice: 0,
      startTime: startTime,
      endTime: startTime + 1 days,
      active: true
    });
    // Create the second auction
    startAuction(1);
  }

  function getCurrentWinner() public view returns (address payable) {
    return auctionWinner[totalAuctions];
  }

  function getCurrentAuction() public view returns (Auction memory) {
    return auctions[totalAuctions];
  }

  function getAuction(uint _tokenId) public view returns (Auction memory) {
    return auctions[_tokenId];
  }

  function bid() public payable {
    Auction memory auction = getCurrentAuction();
    require(msg.value > auction.endPrice, "Bid is too low");
    uint lastBid = auction.endPrice;
    address payable lastBidder = auctionWinner[totalAuctions];
    // update the auction
    auctionWinner[totalAuctions] = payable(msg.sender);
    auctions[totalAuctions].endPrice = msg.value;
    // refund last bidder
    lastBidder.transfer(lastBid);
    // after-bid callback
    if (auction.endTime < block.timestamp && auction.active) {
      closeAuction(totalAuctions);
    }
  }

  function closeAuction(uint _tokenId) private {
    Auction memory auction = auctions[_tokenId];
    // close the auction and open the next one
    auction.active = false;
    auctions[_tokenId + 1].active = true;
    // create new auction ahead of the current one
    startAuction(_tokenId + 2);
    // total auctions gets incremented when the auction is finished
    totalAuctions++;
    // then winner can mint
    allowMint(_tokenId);
    // move funds to the treasury
    treasuryAddress.transfer(auction.endPrice);
  }

  function startAuction(uint _tokenId) private {
    // this must run 1 in advance of the auction.
    // [0, 1, 2 (current), 3] --> when current moves to 3, then the 4th is created
    Auction memory lastAuction = auctions[_tokenId - 1];
    auctions[_tokenId] = Auction({
      endPrice: 0,
      startTime: lastAuction.endTime + 1, // 1 second after the last auction ends
      endTime: lastAuction.endTime + 1 days, // 1 day after the last auction ends
      active: false
    });
  }

  function allowMint(uint _tokenId) private {
    // Allow the winner to mint the token on the Stacks contract
    addAvailableForMint(_tokenId, auctionWinner[_tokenId]);
  }

  // Admin functions
  function setTreasuryAddress(address payable _treasuryAddress) public onlyOwner {
    treasuryAddress = _treasuryAddress;
  }
}
