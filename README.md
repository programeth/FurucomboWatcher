# Furucombo Watcher
![](https://github.com/fifikobayashi/FurucomboWatcher/blob/master/bot.png) 

***Background***

[Furucombo](https://furucombo.app) is a web based DeFi tool which enable end-users to optimize their DeFi strategies, including collateral swap, flash loan arbitrage and self liquidation.

In the context of a successful arbitrage play (both [flash-loan](https://aave.com/flash-loans) powered or otherwise), the transaction appears on the Furucombo Proxy contract as an inbound transaction.

An example of a successful arbitrage transaction via the Furucombo Proxy can be seen [here](https://etherscan.io/tx/0xff77ae534cb94043e537ea358dcf005558a2a57638ec851031217be77b915109).

***Functional Overview***

This NodeJS bot is intended to:

1. Continuously monitor the Furucombo proxy contract v0.4.1 for successful transactions via the proxy contract.
2. For each successfull transaction, assess whether it was a profitable arbitrage or simply a net neutral yield farming, liquidation or collateral swap operation.
3. For each confirmed arbitrage transaction, extract the transaction hash and use it to reverse engineer the set of DeFi legos used for the arbitrage. 
4. For each reverse engineered arbitrage set, call the 1inch DEX aggregator to search through a wide range of DEXs and check if the best price still present a profitable arbitrage trade. If it is still profitable, then either notify bot owner via a Telegram bot, or simply execute the trade by calling the 1inch aggregator's swap function and grant its smart contract access to the funds. If the play is no longer profitable, store this 'known success' arbitrage play into an array.
5. Periodically parse through the array of 'known successes' arbitrage plays via the 1inch DEX aggregator to see if any of them have become profitable, taking into consideration gas, liquidity, slippage and the bot owner's risk/reward ratio preferences.

Note: The script can just as easily be amended to focus on pending transactions however I am not looking to implement this as I don't intend to facilitate front-running operations.



***Getting Started***
1. Clone this repo
~~~
git clone https://github.com/fifikobayashi/FurucomboWatcher
cd FurucomboWatcher
~~~
2. Install the Web3 Ethereum JavaScript API
~~~
npm install web3
~~~
3. Update this line in FurucomboWatcher.js with your own Infura ID. If you don't have one head to https://infura.io and create a new project.
~~~
const infuraID = 'YOUR INFURA PROJECT ID';
~~~
4. Check the mainnet addresses are still valid. As at 2020-09-05 they are:
~~~
Furucombo Proxy contract v0.4.1: 0x57805e5a227937BAc2B0FdaCaA30413ddac6B8E1
1Split Aggregator contract: 0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E
~~~
5. Activate the Furucombo Monitor
~~~
node FurucomboWatcher.js
~~~

![Screenshot of output](https://github.com/fifikobayashi/FurucomboWatcher/blob/master/node%20output.png)


