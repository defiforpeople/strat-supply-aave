import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import {
  IERC20__factory,
  IERC20,
  SupplyAave,
  SupplyAave__factory,
} from "../typechain-types";
const logger = require("pino")();

const { SUPPLY_AAVE_ADDRESS, AAVE_POOL_ADDRESS } = process.env;
const GAS_LIMIT = BigNumber.from("2074000");

export default async function deposit(
  amount: BigNumber,
  tokenAddr: string,
  userAddr: string
) {
  if (!SUPPLY_AAVE_ADDRESS) {
    throw new Error("invalid ENV values");
  }

  const gas = { gasLimit: GAS_LIMIT };

  const user = await ethers.getSigner(userAddr);

  const token = (await ethers.getContractAt(
    IERC20__factory.abi,
    tokenAddr!
  )) as IERC20;

  const supplyContract = (await ethers.getContractAt(
    SupplyAave__factory.abi,
    SUPPLY_AAVE_ADDRESS
  )) as SupplyAave;

  logger.info("Approving...");
  const approveTx = await token
    .connect(user)
    .approve(SUPPLY_AAVE_ADDRESS, amount, gas);
  await approveTx.wait();
  logger.info("Approved!");

  logger.info("Depositing...");
  const supplyTx = await supplyContract
    .connect(user)
    .deposit(token.address, amount, gas);
  await supplyTx.wait();
  logger.info("Deposited!");

  return supplyTx;
}
