Main = {
  loading: false,
  contracts: {},
  plansPrice: [100, 250, 500, 1000],
  connected: false,
  toEth: (n) => {
    return n / 1e6
  },
  toWei: (n) => {
    return n * 1e6
  },
  toCurrency: (n) => {
    let val = n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    return val.substring(1, val.length)
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
      Main.connected = true
    }
    catch {
      console.log('error loading contracts')
      Main.connected = false
      alert('Please change network to Ethereum Mainnet')
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
      $walletBtn.hide()

      await Main.loadContract()
      await Main.fetchAccountData()
    }
    else {
      $walletBtn.show()
    }
  },
  fetchAccountData: async () => {
    if(Main.connected) {
      $('#main-content').show()
    }
    else {
      $('#wrong-network').show()
    }
    let usdcBalance = await Main.usdc.balanceOf(Main.account)
    $('#usdc-balance').html(
      Main.toCurrency(Main.toEth(usdcBalance.toString()))
    )

    let allowanceUsdc = await Main.usdc.allowance(Main.account, Main.whitelist.address)
    let account = await Main.whitelist.whitelist(Main.account)

    // this needs to load without metamask connected
    let currentPlan = await Main.whitelist.currentPlan({ from: Main.account })
    switch(currentPlan.toString()) {
      case '0':
        $($('.levels')[0]).find('img').show()
        $($('.levels')[0]).find('span').addClass('font-semibold')
        break
      case '1':
        $($('.levels')[0]).find('span').addClass('text-strike')
        $($('.levels')[1]).find('span').addClass('font-semibold')
        $($('.levels')[1]).find('img').show()
        break
      case '2':
        $($('.levels')[0]).find('span').addClass('text-strike')
        $($('.levels')[1]).find('span').addClass('text-strike')
        $($('.levels')[2]).find('span').addClass('font-semibold')
        $($('.levels')[2]).find('img').show()
        break
      case '3':
        $($('.levels')[0]).find('span').addClass('text-strike')
        $($('.levels')[1]).find('span').addClass('text-strike')
        $($('.levels')[2]).find('span').addClass('text-strike')
        $($('.levels')[3]).find('span').addClass('font-semibold')
        $($('.levels')[3]).find('img').show()
        break
    }

    if(account.exists) { // already registered
      $('#registered').show()
      $('#referral-post-wl').show()
      $('#referral-link').html(Main.account)
      let numReferrals = await Main.whitelist.referralsLength(Main.account)
      $('#referral-count').html(numReferrals.toString())
      $('#referral-funds').html(parseInt(numReferrals) * 50)
      $('#referral-referred-by').html(account.referredBy.toString())
    }
    else { // not registered
      let currentSpotNumber = await Main.whitelist.whitelistLength()
      let price = Main.plansPrice[currentPlan]
      $('#register-box').find('#wl-number').html(currentSpotNumber.toString())
      $('#register-box').find('#plan-price').html(price.toString())
      $('#register-box').show()
      $('#referral-pre-wl').show()

      if(allowanceUsdc > 0) {
        $('#pay-usdc').show()
      }
      else {
        $('#approve-usdc').show()
      }
    }

    let contractBalance = await Main.usdc.balanceOf(Main.whitelist.address)
    console.log('contractBalance: ' + contractBalance.toString())
    console.log('referral address: ' + referrerHash)
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
      let referrer
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
