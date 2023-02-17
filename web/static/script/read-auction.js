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
    console.log('Read - loading done!')
  },
  loadContract: async () => {
    let auctionAddress, StacksAuctionHouse
    let { chainId } = await ReadAuction.provider.getNetwork()

    if (chainId == 1337) {
      chainId = 5777
      StacksAuctionHouse = await $.getJSON('contracts/StacksAuctionHouse.json')
      auctionAddress = StacksAuctionHouse['networks'][chainId.toString()]['address']
    }
    else if(chainId == 80001) {
      StacksAuctionHouse = await $.getJSON('abis/StacksAuctionHouse.json')
      auctionAddress = StacksAuctionHouse['testnetAddress']
    }
    else {
      StacksAuctionHouse = await $.getJSON('abis/StacksAuctionHouse.json')
      auctionAddress = '<address>'
    }

    try {
      // Init contracts
      ReadAuction.auction = new ethers.Contract(auctionAddress, StacksAuctionHouse["abi"], ReadAuction.provider)
    }
    catch {
      console.log('Read: error loading contracts')
    }
  },
  loadWeb3: async () => {
    // let url = 'http://127.0.0.1:8545'
    let url = 'https://matic-mumbai.chainstacklabs.com'
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

    if(currentWinner.toString() == '0x0000000000000000000000000000000000000000'){
      $('#auction-bidder').html('No bids yet')
    }
    else {
      $('#auction-bidder').html(currentWinner.toString())
    }

    let startDate = new Date(currentAuctionStartTime * 1000)
    let endDate = new Date(currentAuctionEndTime * 1000)

    $('#auction-date').html(startDate.getDate() + ' ' + monthNames[startDate.getMonth()])
    $('#auction-price').html(Math.round(parseFloat(currentAuctionPrice) * 10000000) / 10000000)
    $('#auction-end-date').html(endDate.getDate() + ' ' + monthNames[endDate.getMonth()] + ' @ 23:59:59 GMT')
    $('#countdown').attr('data-date', currentAuctionEndTime)
    let nextBid
    if(currentAuctionPrice == 0) {
      nextBid = 0.01
    }
    else {
      nextBid = parseFloat(currentAuctionPrice) + 0.001
    }
    $('#bid-amount').attr('placeholder', nextBid + ' ETH or more')

    return true
  }
}

$(() => {
  $(window).on('load', async () => {
    await ReadAuction.load()

    let contDown = document.getElementById("countdown");
    let countFrom = parseInt(contDown.dataset.date) * 1000;
    let date = new Date(countFrom);
    countUpFromTime(date, contDown);
  })
})
