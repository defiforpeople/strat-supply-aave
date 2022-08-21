import { expect, use } from "chai";
import "@nomiclabs/hardhat-ethers";
import { ethers, network } from "hardhat";
import { waffleChai } from "@ethereum-waffle/chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SupplyAave,
  IERC20,
  SupplyAave__factory,
  IPool,
} from "../../typechain-types";
import deposit from "../../scripts/deposit";
import withdraw from "../../scripts/withdraw";
const logger = require("pino")();
use(waffleChai);

const AAVE_POOL_ADDRESS = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";
const WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
const WHALE = "0xa2e50fbBE2D73cd9E2c6e2c97E8Beac17B22C957";
const GAS_LIMIT = BigNumber.from("2074000");

if (network.name !== ("hardhat" || "localhost")) {
  describe.skip;
} else {
  logger.info("SupplyAave Unit test!");
  describe.only("SupplyAave", () => {
    let owner: SignerWithAddress;
    let wmatic: IERC20;
    let wmaticAmount: BigNumber;
    let supplyAave: SupplyAave;
    let wmaticOwnerStartBalance: BigNumber;
    let zero: BigNumber;
    let gas: { gasLimit: BigNumber };

    beforeEach(async () => {
      logger.info(0);
      zero = BigNumber.from(0);
      gas = { gasLimit: GAS_LIMIT };

      logger.info(1);
      // get owner
      [owner] = await ethers.getSigners();

      // assert pool is correct
      const pool = (await ethers.getContractAt(
        "IPool",
        AAVE_POOL_ADDRESS
      )) as IPool;
      logger.info(`pool addr provider: ${await pool.ADDRESSES_PROVIDER()}`);

      logger.info(2);
      // deploy SupplyAave
      const supplyAaveFact = (await ethers.getContractFactory(
        "SupplyAave"
      )) as SupplyAave__factory;
      logger.info(3);
      supplyAave = (await supplyAaveFact.deploy(
        AAVE_POOL_ADDRESS
      )) as SupplyAave;
      await supplyAave.deployed();
      logger.info(`supplyAave address: ${supplyAave.address}`);

      // add a pool to supplyAave (wmatic/USDC 0.01%)
      wmatic = (await ethers.getContractAt("IERC20", WMATIC)) as IERC20;

      // get owner gas balance
      const ownerBalanceBefore = await ethers.provider.getBalance(
        owner.address
      );
      logger.info(`ownerBalanceBefore: ${ownerBalanceBefore}`);

      // get whale and make it our
      const whale = await ethers.getImpersonatedSigner(WHALE);
      const whalewmaticBalance = await wmatic.balanceOf(whale.address);
      logger.info(`whalewmaticBalance: ${whalewmaticBalance}`);
      expect(whalewmaticBalance).to.be.gt(zero);

      // set amounts to transfer and assert whale has enough
      wmaticAmount = whalewmaticBalance.div(20);

      // send enough gas to the whale for then transferring the tokens amounts
      await owner.sendTransaction({
        to: whale.address,
        value: ownerBalanceBefore.div(2),
        gasLimit: GAS_LIMIT,
      });

      // transfer the tokens amounts from the whale to our address
      await wmatic.connect(whale).transfer(owner.address, wmaticAmount);

      // set gas object
      gas = { gasLimit: GAS_LIMIT };

      // add zero variable
      zero = BigNumber.from(0);

      wmaticOwnerStartBalance = await wmatic.balanceOf(owner.address);
      logger.info(
        `owner wmatic balance when starting: ${wmaticOwnerStartBalance}`
      );
    });

    describe("deposit and withdraw", () => {
      it("should deposit, withdraw and emit their events correctly", async () => {
        const amount = wmaticOwnerStartBalance.div(4);
        logger.info(`amount to deposit: ${amount}`);

        // deposit
        logger.info("Deposit func");
        const depTx = await deposit(amount, wmatic.address, owner.address);

        logger.info(
          `User balance after depositing: ${await wmatic.balanceOf(
            owner.address
          )}`
        );

        // withdraw
        logger.info("Withdraw func");
        const withdrTx = await withdraw(amount, wmatic.address, owner.address);

        // get wmatic balances of owner and strategy contract
        const wmaticOwnerBalanceAfter = await wmatic.balanceOf(owner.address);
        const wmaticStratBalance = await wmatic.balanceOf(supplyAave.address);

        logger.info(`wmaticOwnerBalanceAfter ${wmaticOwnerBalanceAfter}`);
        logger.info(`wmaticStratBalance ${wmaticStratBalance}`);

        // assertions
        expect(wmaticStratBalance).to.be.equal(zero);
        expect(wmaticOwnerBalanceAfter).to.be.equal(wmaticOwnerStartBalance);
        expect(depTx).to.emit(supplyAave, "Deposit");
        expect(withdrTx).to.emit(supplyAave, "Withdraw");
      });
    });
  });
}
