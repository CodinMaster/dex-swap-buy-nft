# Unique.One DEX Integration
Use 0x DEX Aggregator to allow user to buy NFTs from Unique.One marketplace using any Token of their choice.

## Setup

### React UI:
1. `npm i` to install required dependencies for react application
2. `npm run start` to preview application.

### Smart Contracts:
1. `cd Ethereum` Smart Contracts + Tests are in Ethereum directory.
2. `npm i` to install required openzeppelin dependencies.
3. Create an .env file (.env.example provided for reference), and provide Ethereum Node url so that tests can execute on forked mainnet.
4. `npm run compile` to compile all contracts.
5. `npm run just-test` to run tests on forked mainnet with real 0x quote values.

#### Tests Output:
![](https://i.imgur.com/yX3BIQK.png)

#### Explanation:
Currently, Unique.One only allows the users to buy NFTs using ETH. This solution enables them to transaction via any token of their choice.
Say if a user holds DAI, then the best rate for conversion of DAI to ETH is found via 0x's API. It looks across various pools like Uniswap, Sushiswap, Curve, Balancer and more to find the trade with least slippage.

Our `UniqueOneDexHelper` contract takes the data outputed by API as input, and acts as a middlemen.
- The user approves this Helper contract to spend their DAI.
- The Helper contract takes this DAI, Swaps it to ETH, Buys the required NFT, and sends it to the user. All in one transaction!
- There are also checks to refund any residue of ETH or Token, back to the user and only charge the required ETH for NFT.
