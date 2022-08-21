import "@nomiclabs/hardhat-ethers";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
// eslint-disable-next-line camelcase
import { IWETH, IWETH__factory } from "../typechain-types";
const logger = require("pino")();
const { WRAPPED_NATIVE_TOKEN_ADDRESS } = process.env;

const GAS_LIMIT = 2074040;

export async function getWeth(userAddr: string, amount: BigNumber) {
  // get user
  const user = await ethers.getSigner(userAddr);

  // define instance of erc20 token
  const token = (await ethers.getContractAt(
    IWETH__factory.abi,
    WRAPPED_NATIVE_TOKEN_ADDRESS!
  )) as IWETH;

  const tx = await token.connect(user).deposit({
    value: amount,
    gasLimit: GAS_LIMIT,
  });
  await tx.wait();

  const balance = await token.balanceOf(userAddr);
  logger.info(`WETH user balance: ${balance}`);
}
