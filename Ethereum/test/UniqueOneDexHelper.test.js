const { accounts, contract } = require("@openzeppelin/test-environment");
const { expect } = require("chai");
const {
  expectRevert,
  BN,
  ether,
  constants,
  balance,
} = require("@openzeppelin/test-helpers");
const axios = require("axios");

const DexHelper = contract.fromArtifact("UniqueOneDexHelper");

const ERC721SaleAddr = "0x06dB0695AD7A72b025a83a500C7E728d4a35297e";
const NFTDetails = {
  token: "0x0F864e29b01a72247b6795cc6054AFeb53Ef35EF",
  tokenId: "297",
  price: ether("0.1"),
  sellerFee: "0",
  buyerFeeValue: ether("0.001"),
  signature: {
    v: "27",
    r: "0xc05e21fdc786454e98eba9d4e13088e2efa5e7ff193585db1d8fde7e16c33cc2",
    s: "0x35f58f8237edbf380027f1d783692e0eedc2449eb9fca601a3dcd73668063ca2",
  },
};

const IERC20 = contract.fromArtifact("IERC20");
const IERC721 = contract.fromArtifact("IERC721");
const UniV2Swap = contract.fromArtifact("Exchange");

const API_0x = "https://api.0x.org/swap/v1/quote";
const getSwapQuote = async (sellToken, buyToken) => {
  const params = {
    sellToken,
    buyToken,
    sellAmount: ether("500").toString(),
  };
  const response = await axios.get(API_0x, { params });
  const quote = await response.data;
  const sourceName = quote.sources.find((s) => +s.proportion > 0)
    ? quote.sources.find((s) => +s.proportion > 0).name
    : "Wrapping/UnWrapping";

  const price = parseFloat(quote.sellTokenToEthRate).toFixed(4);
  console.log(
    `Swapping using ${sourceName} at price of 1 ETH = ${price} ${params.sellToken}`
  );

  return quote;
};

describe("UniqueOneDexHelper", () => {
  const admin = accounts[0];
  const user = accounts[1];

  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

  before(async () => {
    // main contract
    this.dexHelper = await DexHelper.new(ERC721SaleAddr, { from: admin });

    // for tests
    this.UniV2Swap = await UniV2Swap.new({ from: admin });

    this.nft = await IERC721.at(NFTDetails.token);
    this.dai = await IERC20.at(DAI);

    // get DAI tokens
    await this.UniV2Swap.swapFromV2(constants.ZERO_ADDRESS, DAI, ether("10"), {
      from: user,
      value: ether("10"),
    });
  });

  it("should allow user to Buy NFT using DAI", async () => {
    const tokenBal = await this.dai.balanceOf(user);
    // approve the contract to spend user's tokens
    await this.dai.approve(this.dexHelper.address, tokenBal, {
      from: user,
    });

    // get 0x swap quote
    const { sellAmount, to, data } = await getSwapQuote(
      "DAI",
      "ETH",
      NFTDetails.price.add(NFTDetails.buyerFeeValue)
    );

    // buy NFT with DAI
    tx = await this.dexHelper.buyNFT(
      DAI,
      sellAmount,
      to,
      data,
      NFTDetails.token,
      NFTDetails.tokenId,
      NFTDetails.price,
      NFTDetails.sellerFee,
      NFTDetails.buyerFeeValue,
      [NFTDetails.signature.v, NFTDetails.signature.r, NFTDetails.signature.s],
      {
        from: user,
      }
    );

    const newOwner = await this.nft.ownerOf(NFTDetails.tokenId);
    expect(newOwner).to.be.eq(user);
  });
});
