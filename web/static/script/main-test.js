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
    $walletBtn = $('#wallet')
    Main.toggleLoadingScreen(true)
    await Main.loadWeb3(true)


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
    const wlArtifact = await $.getJSON('contracts/whitelist-stacks.json')
    let mainnetAddressWl = '0x8cb951535452bc15763e59b9e5ef7048c8a49e20'
    const usdcArtifact = await $.getJSON('contracts/usdc.json')
    let mainnetAddressUsdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

    try {
      // Init contracts
      Main.whitelist = new ethers.Contract(mainnetAddressWl, wlArtifact["abi"], Main.signer)
      Main.usdc = new ethers.Contract(mainnetAddressUsdc, usdcArtifact["abi"], Main.signer)
      Main.connected = true
    }
    catch {
      console.log('error loading contracts')
      Main.connected = false
      alert('Please change network to Ethereum Mainnet')
    }
  },

  loadWeb3: async (firstLoad) => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    Main.provider = new ethers.providers.Web3Provider(window.ethereum)
    // MetaMask requires requesting permission to connect users accounts
    let accounts = await Main.provider.send("eth_requestAccounts", [])

    // The provider also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, we need the account signer...
    Main.signer = Main.provider.getSigner()


    if(accounts.length > 0) {
      Main.account = accounts[0]
      $walletBtn.hide()

      await Main.loadContract()
      await Main.fetchAccountData()
    }
    else {
      $walletBtn.show()
    }



  },
  accounts: async () => {
    const acc = await web3.eth.getAccounts()
    return acc
  },
  // accountConnected: async () => {
  //   let accounts = await Main.accounts()
  // },
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
        let tx = await Main.usdc.approve(Main.whitelist.address, amount)
        Main.handleTransaction(tx.hash, 'Approving USDC to be spent...')
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
        let tx = await Main.whitelist.addToWhitelist(referrer)
        Main.handleTransaction(tx.hash, 'Reserving your spot...')
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
