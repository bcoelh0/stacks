// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract StacksAuctionHouse is Ownable {
  mapping(uint => Auction) public auctions;
  mapping(uint => address payable) public auctionWinner;
  uint public totalAuctions = 0;
  uint public createdAuctions = 0;
  address payable public treasuryAddress;
  // uint startTimeOfFirstAuction = 1677628800; // Wed Mar 01 2023 00:00:00 GMT+0000
  uint startTimeOfFirstAuction = 1676073600;  // Test start: Sat Feb 11 2023 00:00:00 GMT+0000

  struct Auction {
    uint endPrice;
    uint startTime;
    uint endTime;
    bool closed;
  }

  constructor(address payable _treasuryAddress) {
    treasuryAddress = _treasuryAddress;
    // Create the first auction
    auctions[0] = Auction({
      endPrice: 0,
      startTime: startTimeOfFirstAuction,
      endTime: (startTimeOfFirstAuction + 1 days) - 1,
      closed: false
    });
    createdAuctions++;
    // Create next 30 auctions
    createAuctions(30);
  }

  function getCurrentWinner() public view returns (address payable) {
    return auctionWinner[daysSinceStart()];
  }

  function getAuctionWinner(uint _tokenId) public view returns (address payable) {
    return auctionWinner[_tokenId];
  }

  function getCurrentAuction() public view returns (Auction memory) {
    return auctions[daysSinceStart()];
  }

  function getLastCreatedAuction() public view returns (Auction memory) {
    return auctions[createdAuctions - 1];
  }

  function getAuction(uint _tokenId) public view returns (Auction memory) {
    return auctions[_tokenId];
  }

  function bid() public payable {
    Auction memory auction = getCurrentAuction();
    uint auctionId = daysSinceStart();
    uint paidVal = msg.value;

    require(paidVal > auction.endPrice, "Bid is too low");
    uint lastBid = auction.endPrice;
    address payable lastBidder = auctionWinner[auctionId];
    // update the auction
    auctionWinner[auctionId] = payable(msg.sender);
    auctions[auctionId].endPrice = paidVal;

    // refund last bidder
    lastBidder.transfer(lastBid);

    Auction memory lastAuction = getAuction(auctionId - 1);
    if(!lastAuction.closed) {
      closeAuction(auctionId - 1);
    }
  }

  // closeAuction isn't needed, but we need to transfer funds to the treasury
  function closeAuction(uint _tokenId) private {
    Auction memory auction = auctions[_tokenId];
    // close the auction
    auctions[_tokenId].closed = true;
    // move funds to the treasury
    treasuryAddress.transfer(auction.endPrice);
  }

  // Admin functions
  function setTreasuryAddress(address payable _treasuryAddress) public onlyOwner {
    treasuryAddress = _treasuryAddress;
  }

  // run to create auctions in bulk for the next _amount days
  function createAuctions(uint _amount) public onlyOwner {
    uint finalCreatedAuctions = createdAuctions + _amount;
    for (uint i = createdAuctions; i < finalCreatedAuctions; i++) {
      createNextAuction();
    }
  }

  function createNextAuction() private {
    Auction memory lastAuction = auctions[createdAuctions - 1];
    auctions[createdAuctions] = Auction({
      endPrice: 0,
      startTime: lastAuction.endTime + 1, // 1 second after the last auction ends
      endTime: lastAuction.endTime + 1 days, // 1 day after the last auction ends
      // active: false,
      closed: false
    });
    createdAuctions++;
  }

  // daysSinceStart() same as currentAuctionId()
  function daysSinceStart() public view returns (uint) {
    return (block.timestamp - startTimeOfFirstAuction) / 1 days;
  }
}
