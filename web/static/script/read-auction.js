ReadAuction = {
  loading: false,
  contracts: {},
  toEth: (n) => {
    return ethers.utils.formatUnits(n.toString(), 18)
  },
  toUsdcEth: (n) => {
    return ethers.utils.formatUnits(n.toString(), 6)
  },
  toWei: (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
  },
  toCurrency: (n) => {
    let val = n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    return val.substring(1, val.length)
  },
  load: async () => {
    await ReadAuction.loadWeb3()
    console.log('loading done!')
  },
  loadContract: async () => {
    const StacksAuctionHouse = await $.getJSON('contracts/StacksAuctionHouse.json')
    const { chainId } = await ReadAuction.provider.getNetwork()

    let auctionAddress, stacksAddress
    if(chainId == 42161) {
      // mainnet
      auctionAddress = '0x5d62e083A83d561685c4fc156C8590B262e7c88a'
    }
    else if(chainId == 421613) {
      // testnet
      auctionAddress = '0x5d62e083A83d561685c4fc156C8590B262e7c88a'
    }
    else {
      auctionAddress = '0xc277371e1fAc271aFb64A59b7F834186100d2248'
      stacksAddress = '0xc5914A5a4903C2A5fe22530eA78e6fD60406Bfc5'
    }

    try {
      // Init contracts
      ReadAuction.auction = new ethers.Contract(auctionAddress, StacksAuctionHouse["abi"], ReadAuction.provider)
    }
    catch {
      console.log('error loading contracts')
    }
  },
  loadWeb3: async () => {
    let url = 'http://localhost:8545'
    // let url = 'https://goerli-rollup.arbitrum.io/rpc'
    // let url = 'https://arbitrum.public-rpc.com'
    ReadAuction.provider = new ethers.providers.JsonRpcProvider(url)

    await ReadAuction.loadContract()

    // Read contract values
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    let currentAuction = await ReadAuction.auction.getCurrentAuction()
    let currentAuctionPrice = ReadAuction.toEth(currentAuction.endPrice.toString())
    let currentAuctionStartTime = currentAuction.startTime.toNumber()
    let currentAuctionEndTime = currentAuction.endTime.toNumber()

    let currentWinner = await ReadAuction.auction.getCurrentWinner()
    console.log(currentWinner.toString())

    if(currentWinner.toString() == '0x0000000000000000000000000000000000000000'){
      $('#auction-bidder').html('No bids yet')
    }
    else {
      $('#auction-bidder').html(currentWinner.toString())
    }

    let startDate = new Date(currentAuctionStartTime * 1000)
    let endDate = new Date(currentAuctionEndTime * 1000)

    $('#auction-date').html(startDate.getDate() + ' ' + monthNames[startDate.getMonth()])
    $('#auction-price').html(currentAuctionPrice)
    $('#auction-end-date').html(endDate.getDate() + ' ' + monthNames[endDate.getMonth()] + ' @ 00:00 GMT')
    $('#countdown').attr('data-date', currentAuctionEndTime)
    let nextBid
    if(currentAuctionPrice == 0) {
      nextBid = 0.01
    }
    else {
      nextBid = currentAuctionPrice.toNumber() + 0.01
    }
    $('#bid-amount').attr('placeholder', nextBid + ' ETH or more')


    return true
  }
}

$(() => {
  $(window).on('load', () => {
    ReadAuction.load()
  })
})
