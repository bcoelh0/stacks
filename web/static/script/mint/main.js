Main = {
  StacksContractTestnet: '0xc2000543D116057d1A456Ea8ae1BC33fB240f938',
  AuctionContractTestnet: '0xB125DF80Ead3A5F78Ac4a1Db6Cf440538F69e483',
  loading: false,
  contracts: {},
  toEth: (n) => {
    return n / 1e18
  },
  toWei: (n) => {
    return n * 1e18
  },
  walletFormat: (address) => {
    return address.substring(0, 6) + '...' + address.substring(address.length - 4, address.length)
  },
  load: async () => {
    $walletBtn = $('#wallet')
    Main.toggleLoadingScreen(true)
    let available = await Main.loadWeb3()
    if(!available) {
      $('#no-mm').show()
    }

    $walletBtn.on('click', async () => {
      await Main.loadWeb3()
    })
    await Main.setupMetamaskEvents()
    await Main.setupClickButtons()

    await Main.toggleLoadingScreen(false)
    console.log('Mint - loading done!')
  },
  toggleLoadingScreen: async (load) => {
    if(load) {
      $('.loading').show()
      $('.content').hide()
    }
    else {
      $('.loading').hide()
      $('.content').show()
    }
  },
  setupMetamaskEvents: async () => {
    if(typeof(ethereum) === 'undefined') { return }

    ethereum.on('accountsChanged', () => {
      window.location.reload()
    });

    ethereum.on('chainChanged', () => {
      window.location.reload()
    });
  },
  loadContract: async () => {
    let stacksAddress, auctionAddress, StacksAuctionHouse, Stacks
    let { chainId } = await Main.provider.getNetwork()

    if (chainId == 1337 || chainId == 5777) {
      chainId = 5777
      StacksAuctionHouse = await $.getJSON('contracts/StacksAuctionHouse.json')
      Stacks = await $.getJSON('contracts/Stacks.json')
      auctionAddress = StacksAuctionHouse['networks'][chainId.toString()]['address']
      stacksAddress = Stacks['networks'][chainId.toString()]['address']
    }
    else if(chainId == 80001) {
      StacksAuctionHouse = await $.getJSON('abis/StacksAuctionHouse.json')
      Stacks = await $.getJSON('abis/Stacks.json')
      auctionAddress = Main.AuctionContractTestnet
      stacksAddress = Main.StacksContractTestnet
    }

    try {
      // Init contracts
      Main.auction = new ethers.Contract(auctionAddress, StacksAuctionHouse["abi"], Main.signer)
      Main.stacks = new ethers.Contract(stacksAddress, Stacks["abi"], Main.signer)
    }
    catch {
      console.log('error loading contracts')
    }
    return true
  },
  loadWeb3: async () => {
    if(typeof(ethereum) === 'undefined') { return false }

    let accounts
    try {
      // A Web3Provider wraps a standard Web3 provider, which is
      // what MetaMask injects as window.ethereum into each page
      Main.provider = new ethers.providers.Web3Provider(window.ethereum)
      // MetaMask requires requesting permission to connect users accounts
      accounts = await Main.provider.send("eth_requestAccounts", [])

      // The provider also allows signing transactions to
      // send ether and pay to change state within the blockchain.
      // For this, we need the account signer...
      Main.signer = Main.provider.getSigner()
    }
    catch {}

    if(typeof(accounts) === 'undefined') { return false }

    if(accounts.length > 0) {
      Main.account = accounts[0]
      $walletBtn.html(Main.walletFormat(Main.account))
      $('#place-bid').removeClass('disabled')

      let available = await Main.loadContract()
      if(!available) { return }

      await Main.fetchAccountData()
    }
    else {
      return false
    }

    return true
  },
  accounts: async () => {
    const acc = await web3.eth.getAccounts()
    return acc
  },
  fetchAccountData: async () => {
    let auctionsWon = await Main.auction.getUserAuctionsWon(Main.account)

    if(auctionsWon.length == 0) {
      $('#loading').hide()
      $('#no-nfts').show()
    }
    else {
      let $select = $('#mint-select')
      for(let i = 0; i < auctionsWon.length; i++) {
        let auctionId = auctionsWon[i]
        let token = await Main.stacks.tokenMetaDataRecord(auctionId)
        if(!token.minted) {
          $select.append(`<option value="${auctionId}">Token ID: ${auctionId}</option>`)
        }
      }
      $('#loading').hide()
      $('#mint').removeAttr('disabled')
      $('#mint').removeClass('disabled')
      $('#mint-form').show()
    }
  },
  setupClickButtons: async () => {
    $('#mint').on('click', async (e) => {
      e.preventDefault()
      let tokenId = $('#mint-select').val()

      Main.buttonLoadingHelper(e, 'minting...', async () => {
        let tx = await Main.stacks.mint(tokenId)
        Main.handleTransaction(tx.hash, 'Minting Stacks Investment Card...')
        await tx.wait()
      })
    })
  },
  // helper functions
  buttonLoadingHelper: async (event, loadingText, callback) => {
    $btn = $(event.target)
    $btn.attr('disabled', 'disabled')
    $btn.html(loadingText)
    try {
      await callback()
      window.location.reload()
    } catch(e) {
      alert('Something went wrong. Please make sure you have enough funds.')
      window.location.reload()
    }
  },
  handleTransaction: async (txHash, message) => {
    alert(message)
  }
}

$(() => {
  $(window).on('load', () => {
    Main.load()
  })
})
