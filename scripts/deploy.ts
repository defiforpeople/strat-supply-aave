import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { SupplyAave, SupplyAave__factory } from "../typechain-types";
const logger = require("pino")();

const { AAVE_POOL_ADDRESS } = process.env;
const GAS_LIMIT = BigNumber.from("2074000");
const gas = { gasLimit: GAS_LIMIT };

const deploy = async () => {
  const supplyAaveFactory = (await ethers.getContractFactory(
    "SupplyAave"
  )) as SupplyAave__factory;

  // deploy strategy contract
  const strategyContract = (await supplyAaveFactory.deploy(
    `${AAVE_POOL_ADDRESS}`,
    gas
  )) as SupplyAave;
  await strategyContract.deployed();

  logger.info(`SupplyAave address: ${strategyContract.address}`);
};

deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
