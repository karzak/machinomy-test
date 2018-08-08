// Set env var so I get all the goodies
process.env.DEBUG = '*'
process.env.DEBUG_COLORS = 'true'
process.env.PROVIDER = "https://kovan.infura.io/bXIbx0x6ofEuDANTSeKI"
process.env.MNEMONIC = 'toward explain key rough web lend movie critic flee circle clock gas'

const Machinomy = require('machinomy').default
const BigNumber = require('bignumber.js')
const Web3 = require('web3')
const HDWalletProvider = require('@machinomy/hdwallet-provider').default
const trash = require('trash')
const path = require('path')

const oldPayment = require('./old_payment.json')

async function run () {
  // Clean the persisted db
  await trash([path.resolve('./data')])

  // Create receiver
  const receiverProvider = new HDWalletProvider(
    process.env.MNEMONIC,
    process.env.PROVIDER,
    2
  )
  const receiverAccount = await receiverProvider.getAddress(1)
  console.log(receiverAccount)
  const receiverWeb3 = new Web3(receiverProvider)
  const receiverMachinomy = new Machinomy(
    receiverAccount,
    receiverWeb3, {
      databaseUrl: 'nedb://data/machinomy_receiver',
      minimumChannelAmount: new BigNumber(1).shift(4)
    }
  )
  // Give the receiver the smaller, older payment
  await receiverMachinomy.acceptPayment({
    payment: oldPayment
  })

  await receiverMachinomy.close(oldPayment.channelId)
}

run().catch(err => {
  console.error(err)
})
