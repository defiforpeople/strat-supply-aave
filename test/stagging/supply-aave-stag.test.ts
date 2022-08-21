import { IERC20, IPool, SupplyAave } from "../../typechain-types";
import { expect, use } from "chai";
import "@nomiclabs/hardhat-ethers";
import { ethers, network } from "hardhat";
import { waffleChai } from "@ethereum-waffle/chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import deposit from "../../scripts/deposit";
import withdraw from "../../scripts/withdraw";
import { getWeth } from "../../utils/get-weth";
const logger = require("pino")();
use(waffleChai);

const { SUPPLY_AAVE_ADDRESS, TOKEN_ADDRESS, AAVE_POOL_ADDRESS } = process.env;

if (network.name === ("localhost" || "hardhat")) {
  logger.info("Bye");
  describe.skip;
} else {
  logger.info("Stagging test!");
  describe.only("SupplyAave", () => {
    let signer: SignerWithAddress;
    let supplyAave: SupplyAave;
    let token: IERC20;
    let tokenSignerBalanceStart: BigNumber;
    let zero: BigNumber;
    let pool: IPool;

    beforeEach(async () => {
      // prepare (signers) ownerWallet and userWallet (10 ETH each)
      [signer] = await ethers.getSigners();

      // // define AavePool mock contract
      // get and deploy StrategyRecursiveFarming contract
      supplyAave = (await ethers.getContractAt(
        "SupplyAave",
        SUPPLY_AAVE_ADDRESS!
      )) as SupplyAave;

      // get token
      token = (await ethers.getContractAt("IERC20", TOKEN_ADDRESS!)) as IERC20;

      tokenSignerBalanceStart = await token.balanceOf(signer.address);
      logger.info(`tokenSignerBalanceStart: ${tokenSignerBalanceStart}`);
      zero = BigNumber.from(0);

      // get pool
      pool = (await ethers.getContractAt("IPool", AAVE_POOL_ADDRESS!)) as IPool;
      const addrProvider = await pool.ADDRESSES_PROVIDER();
      logger.info(addrProvider);
      if (!addrProvider) {
        throw new Error("Incorrect Aave pool address");
      }
      logger.info(`Pool addresses provider: ${addrProvider}`);

      // if there is not balance, get some wrapped native token
      if (tokenSignerBalanceStart.lte(zero)) {
        const tokenAmm = BigNumber.from(2);
        logger.info(`getting wmatic...`);
        await getWeth(signer.address, tokenAmm);
        logger.info(
          `Wmatic minted! the Wmatic balance now is: ${await token.balanceOf(
            signer.address
          )}`
        );
      }

      const signerBalance = await ethers.provider.getBalance(signer.address);
      logger.info(`signer gas balance at the beggining: ${signerBalance}`);
    });

    describe("deposit and withdraw", () => {
      it("should deposit and withdraw correctly", async () => {
        logger.info(`tokenSignerBalanceStart ${tokenSignerBalanceStart}`);
        const amount = tokenSignerBalanceStart.div(4);
        logger.info(`amount to deposit: ${amount}`);

        // deposit
        logger.info("Deposit func");
        const depTx = await deposit(amount, token.address, signer.address);

        logger.info(
          `User balance after depositing: ${await token.balanceOf(
            signer.address
          )}`
        );

        // withdraw
        logger.info("Withdraw func");
        const withdrTx = await withdraw(amount, token.address, signer.address);

        // get token balances of signer and strategy contract
        const tokenSignerBalanceAfter = await token.balanceOf(signer.address);
        const tokenStratBalance = await token.balanceOf(supplyAave.address);

        logger.info(`tokenSignerBalanceAfter ${tokenSignerBalanceAfter}`);
        logger.info(`tokenStratBalance ${tokenStratBalance}`);

        // assertions
        expect(tokenStratBalance).to.be.equal(zero);
        expect(tokenSignerBalanceAfter).to.be.equal(tokenSignerBalanceStart);
        expect(depTx).to.emit(supplyAave, "Deposit");
        expect(withdrTx).to.emit(supplyAave, "Withdraw");
      });
    });
  });
}
