Main = {
  loading: false,
  contracts: {},
  toEth: (n) => {
    return web3.utils.fromWei(n, 'ether')
  },
  toWei: (n) => {
    return web3.utils.toWei(n, 'ether')
  },
  load: async () => {
    Main.toggleLoadingScreen(true)
    await Main.loadWeb3(true)

    $walletBtn = $('#wallet')
    $walletBtn.on('click', async () => {
      await Main.loadWeb3(false)
    })
    await Main.setupMetamaskEvents()
    await Main.setupClickBuySpot()

    await Main.toggleLoadingScreen(false)
    console.log('loading done!')
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

    ethereum.on('accountsChanged', async () => {
      Main.toggleLoadingScreen(true)
      window.location.reload()
    });

    ethereum.on('chainChanged', async () => {
      Main.toggleLoadingScreen(true)
      window.location.reload()
    });
  },
  loadContract: async () => {
    const wl = await $.getJSON('contracts/WhitelistStacks.json')
    Main.contracts.WhitelistStacks = await TruffleContract(wl)
    Main.contracts.WhitelistStacks.setProvider(Main.web3Provider)

    const usdc = await $.getJSON('contracts/Fusdc.json')
    Main.contracts.Usdc = TruffleContract(usdc)
    Main.contracts.Usdc.setProvider(Main.web3Provider)

    try {
      Main.whitelist = await Main.contracts.WhitelistStacks.deployed()
      Main.usdc = await Main.contracts.Usdc.deployed()
    }
    catch {
      console.log('error loading contracts')
      alert('Please change network to Ethereum network')
    }
  },
  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async (firstLoad) => {
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.enable();
        Main.web3Provider = web3.currentProvider
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
      Main.web3Provider = web3.currentProvider
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    if(typeof web3 !== 'undefined'){ Main.accountConnected() }
  },
  accounts: async () => {
    const acc = await web3.eth.getAccounts()
    return acc
  },
  accountConnected: async () => {
    let accounts = await Main.accounts()
    if(accounts.length > 0) {
      Main.account = accounts[0]
      let acc = accounts[0]
      $walletBtn.html(acc.slice(0, 5) + '...' + acc.slice(acc.length - 4, acc.length))

      await Main.loadContract()
      await Main.fetchAccountData()
    }
  },
  fetchAccountData: async () => {
    let usdcBalance = await Main.usdc.balanceOf(Main.account)
    $('#usdc-balance').html(Main.toEth(usdcBalance.toString()))

    let allowanceUsdc = await Main.usdc.allowance(Main.account, Main.whitelist.address)
    let whitelisted = await Main.whitelist.registered(Main.account)

    if(whitelisted) {
      $('#whitelisted').show()
    }
    else {
      if(allowanceUsdc > 0) {
        $('#register-block').show()
      }
      else {
        $('#approve-usdc').show()
      }
    }

  },
  setupClickBuySpot: async () => {
    $('#approve-usdc').on('click', async (e) => {
      let amount = Main.toWei('1001')
      Main.buttonLoadingHelper(e, 'approving...', async () => {
        await Main.usdc.approve(Main.whitelist.address, amount, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Approving USDC to be spent...')
        })
      })
    })

    $('#pay-usdc').on('click', async (e) => {
      console.log(referrerHash)
      if(referrerHash) {
        referrer = referrerHash
      }
      else {
        referrer = '0x0000000000000000000000000000000000000000'
      }
      Main.buttonLoadingHelper(e, 'reserving...', async () => {
        await Main.whitelist.addToWhitelist(referrer, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Reserving your spot...')
        })
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
    } catch {
      window.location.reload()
    }
  },
  handleTransaction: async (txHash, message) => {
    alert(message)

    // $('#create-node').modal('hide')
    // $modal = $('#tx-alert')
    // $modal.find('#tx-link').attr('href', 'https://polygonscan.com/tx/' + txHash)
    // $modal.find('#tx-message').html(message)
    // $modal.modal('show')
  }
}

$(() => {
  $(window).on('load', () => {
    Main.load()
  })
})
