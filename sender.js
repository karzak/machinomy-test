// Set env var so I get all the goodies
process.env.DEBUG = '*'
process.env.DEBUG_COLORS = 'true'
process.env.PROVIDER = "https://ropsten.infura.io/bXIbx0x6ofEuDANTSeKI"
process.env.MNEMONIC = 'toward explain key rough web lend movie critic flee circle clock gas'

const Machinomy = require('machinomy').default
const BigNumber = require('bignumber.js')
const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')
const trash = require('trash')
const path = require('path')
const fs = require('fs')

async function run () {
  // Clean the persisted db
  await trash([path.resolve('./data')])

  // Create sender
  const senderProvider = new HDWalletProvider(
    process.env.MNEMONIC,
    process.env.PROVIDER,
    0
  )
  const account = senderProvider.getAddress(0)
  console.log(account)
  const web3 = new Web3(senderProvider)
  const machinomy = new Machinomy(
    account,
    web3, {
      databaseUrl: 'nedb://data/machinomy_sender',
      minimumChannelAmount: new BigNumber(1).shift(4)
    }
  )

  // Create receiver
  const receiverProvider = new HDWalletProvider(
    process.env.MNEMONIC,
    process.env.PROVIDER,
    1
  )
  const receiverAccount = receiverProvider.getAddress(0)
  console.log(web3.isAddress(receiverAccount))
  console.log(web3.isAddress(account))

  // 1. Create a new channel to receiver
  await machinomy.open(
    receiverAccount,
    new BigNumber(1).shift(6)
  )

  // 2. Construct a payment for 200000
  const { payment: oldPayment } = await machinomy.payment({
    receiver: receiverAccount,
    price: new BigNumber(200000)
  })
  console.log(oldPayment)

  fs.writeFileSync('old_payment.json', JSON.stringify(oldPayment))
}

run().catch(err => {
  console.error(err)
})
