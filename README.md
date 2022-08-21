# Strat Supply Aave

## What is it?

Is the repo with the strategy for supplying liquidity in the Aave V3 protocol.

## What it does?

With it, you can add and withdraw liquidity from Aave V3 pool with a token.

---

## Stack

Hardhat is the framework used.

Typescript is the programming language used for developing the scripts (with `ethers` library too).

Typescript and Waffle were used for tests (with `ethers` library too).

---

# How to use

I used _yarn_ as package manager, but you could you _npm_ or any other that you prefer.


### Install dependencies
Firstly, you have to install the packages. The command is:

`yarn install`

### Setup .env files

You will need to setup a `.env` file for every network that you are going to use.
For example, `.env.polygon` and `.env.mumbai` would have the same variables, but with different values each. You can find the variables in `.env.example` file.

Each `.env.<network_name>` contains the variables names that the `.sample-env` file has.


### Tests

The contract is successfully tested with unit and an integration tests that executes `deposit()` and `withdraw()` functions and assert that they emit their events successfully.

* **Unit tests**:

  `yarn hardhat test test/unit/supply-aave-unit.test.ts --network hardhat` for running all the unit test. The result is the following:
  Example of unit tests in local network (forking the polygon mainnet):

  <img width="202" alt="image" src="https://user-images.githubusercontent.com/71539596/185807019-17deada9-b01f-4768-9f8f-7ab5143117f2.png">

  (logs were dismissed in the image)


* **Integration tests**:

  `yarn hardhat test test/stagging/supply-aave-stag.test.ts --network <network_name>` for running the stagging test. The result is the following:

  Example of stagging tests in `polygon` network:

  <img width="494" alt="image" src="https://user-images.githubusercontent.com/71539596/178420325-70deaed6-d4dd-4c77-adf8-8870e02f18e3.png">

  (logs were dismissed in the image)


### Verification

The contract is already verified:

* Here you can check all the tx of the contract that I deployed on the `Polygon` network in polygonscan with this link: 

  https://polygonscan.com/address/0xe47fF9b7Ae4888492cEB892cb52ab43fcD08b2aC


* Here you can check all the tx of the contract that I deployed on the `Mumbai` testnet network in polygonscan with this link: 

  https://mumbai.polygonscan.com/address/0x125dF0B4Ab64Bf6AeD9Fdac6FbaBc4Cf441614B7

-------
