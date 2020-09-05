const Web3 = require('web3');

// initialise nodeJS bot
const infuraID = 'YOUR INFURA PROJECT ID';
web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/' + infuraID));
const furucomboProxyContract = '0x57805e5a227937BAc2B0FdaCaA30413ddac6B8E1'.toLowerCase();

// initialise parameters for 1inch dex aggregator
const BigNumber = require('bignumber.js');
const tokenDecimals = 18;
const oneSplitABI = require('./abis/onesplit.json');
const onesplitAddress = "0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E"; // 1plit contract address on Main net
const onesplitContract = new web3.eth.Contract(oneSplitABI, onesplitAddress); // instantiates the 1split contract
const oneSplitDexes = [
  "Uniswap",
  "Kyber",
  "Bancor",
  "Oasis",
  "Curve Compound",
  "Curve USDT",
  "Curve Y",
  "Curve Binance",
  "Curve Synthetix",
  "Uniswap Compound",
  "Uniswap CHAI",
  "Uniswap Aave",
  "Mooniswap",
  "Uniswap V2",
  "Uniswap V2 ETH",
  "Uniswap V2 DAI",
  "Uniswap V2 USDC",
  "Curve Pax",
  "Curve renBTC",
  "Curve tBTC",
  "Dforce XSwap",
  "Shell",
  "mStable mUSD"
];

// primary controller
class FuruWatcher {

    // continuously monitors Furucombo proxy transactions
    async monitorFuru() {

        // retrieve latest block
        let block = await web3.eth.getBlock('latest');
        let number = block.number;
        console.log('Scanning block ' + number);

        if (block != null && block.transactions != null) {

            // for each TX in the current block
            for (let txHash of block.transactions) {
                let tx = await web3.eth.getTransaction(txHash);

                // ** Step 1: Analyze the TX if it relates to the furucombo proxy contract
                if (furucomboProxyContract == tx.to.toLowerCase()) {
                    // TODO: add another condition to filter on successfull furucombo status TXs only
                    // what the fuck - 'web3.eth.getTransactionReceipt(txHash).status' returns undefined for all TX, fix later
                      console.log('Successful Furucombo Tx found on block: ' + number);
                      console.log({address: tx.from, value: web3.utils.fromWei(tx.value, 'ether')});
                      console.log('Tx Hash: ' + txHash);

                      /** Step 2: reverse engineer the DeFi lego set used based on tx hash
                        - call decombo(txHash), returns a combo object
                        - if the combo tx has a successful status AND profitable arb then store in array
                      **/

                      /** Step 3: calls 1inch aggregator contract functions
                        - getQuotes(fromToken, toToken, amount, callback)
                        - add net profit calculation logic factoring in:
                              gas, liquidity, slippage and r/r ratios that I'm comfortable with
                        - approveToken(tokenInstance, receiver, amount, callback)
                      **/

                      /** Step 4: execute the series of swaps or notify bot owner via telegram bot
                        - call executeTrades() or notifyViaTelegram()
                      **/
                }
            }
        }
    }

    // obtain the expected rate for the trade
    async getQuote(fromToken, toToken, amount, callback) {
        let quote = null;
        try {
            quote = await onesplitContract.methods.getExpectedReturn(fromToken, toToken, amount, 100, 0).call();
        } catch (error) {
            console.log('Unable to get the quote', error)
        }
        console.log("DEXes:");
        for (let index = 0; index < quote.distribution.length; index++) {
            console.log(oneSplitDexes[index] + ": " + quote.distribution[index] + "%");
        }
        callback(quote);
    }

    // Approve the spending of the token
    async approveToken(tokenInstance, receiver, amount, callback) {
       tokenInstance.methods.approve(receiver, amount).send({ from: fromAddress }, async function(error, txHash) {
      if (error) {
          console.log("Unable to approve ERC20 token", error);
          return;
      }
      console.log("ERC20 token approved to " + receiver);
      const status = await waitTransaction(txHash);
      if (!status) {
           console.log("Approval transaction failed.");
           return;
      }
      callback();
      })
   }

   // execute the series of token swaps
   async executeTrades() {
     // TODO
     // onesplitContract.methods.swap(fromToken, toToken, amountWithDecimals, quote.returnAmount, quote.distribution, 0).send({ from: fromAddress, gas: 8000000 }, async function(error, txHash)
   }

   // reverse engineers the DeFi lego set used based on the Tx Hash
   async decombo(txHash) {
       // magic
   }

}


// create new FuruWatcher instance
let txWatcher = new FuruWatcher();
setInterval(() => {
    txWatcher.monitorFuru();
}, 15 * 1000);
