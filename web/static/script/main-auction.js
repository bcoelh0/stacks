Main = {
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
    console.log('Write - loading done!')
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
    const StacksAuctionHouse = await $.getJSON('abis/StacksAuctionHouse.json')
    const Stacks = await $.getJSON('abis/Stacks.json')
    let { chainId } = await Main.provider.getNetwork()
    if (chainId == 1337) { chainId = 5777 }

    let auctionAddress = StacksAuctionHouse['networks'][chainId.toString()]['address']
    let stacksAddress = Stacks['networks'][chainId.toString()]['address']

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
    // anything to load from user?
  },
  setupClickButtons: async () => {
    $('#place-bid').on('click', async (e) => {
      e.preventDefault()
      let amount = $('#bid-amount').val()
      amount = Main.toWei(amount).toString()

      Main.buttonLoadingHelper(e, 'bidding...', async () => {
        let tx = await Main.auction.bid({ value: amount })
        Main.handleTransaction(tx.hash, 'Placing your bid...')
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
