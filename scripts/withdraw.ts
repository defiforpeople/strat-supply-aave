import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SupplyAave, SupplyAave__factory } from "../typechain-types";
const logger = require("pino")();

const { SUPPLY_AAVE_ADDRESS } = process.env;
const GAS_LIMIT = BigNumber.from("2074000");

export default async function withdraw(
  lpAmount: BigNumber,
  tokenAddr: string,
  userAddr: string
) {
  const gas = { gasLimit: GAS_LIMIT };

  const user = await ethers.getSigner(userAddr);

  const supplyContract = (await ethers.getContractAt(
    SupplyAave__factory.abi,
    SUPPLY_AAVE_ADDRESS!
  )) as SupplyAave;

  logger.info("Withdrawing...");
  const withdrawTx = await supplyContract
    .connect(user)
    .withdraw(tokenAddr, lpAmount, gas);
  await withdrawTx.wait();
  logger.info("Withdrawed!");
}
