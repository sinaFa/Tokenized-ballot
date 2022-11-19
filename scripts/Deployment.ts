import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import {MyERC20Votes__factory} from "../typechain-types"
dotenv.config();

const TEST_MINT_VALUE = ethers.utils.parseEther("10");
async function main() {
  require('dotenv').config()
  //const provider =  new ethers.providers.InfuraProvider("goerli",  process.env.INFURA_API_KEY);
  //const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "");
  //const signer = wallet.connect(provider);
  const accounts = await ethers.getSigners()
  // minter will take address[0], voter address[1] and so on
  const [minter, voter, other] = accounts;

  const contractFactory = new MyERC20Votes__factory(minter);// or use signer
  const contract = await contractFactory.deploy();
  await contract.deployed();

  console.log(`Tokenized vote Contract deployed at address ${contract.address} \n`);

  // The balance of a wallet for tokens is obtained by balanceOf. The Eth balance is obtained by getBalance()
  let voterTokenBalance = contract.balanceOf(voter.address);
  console.log(`The voter starts with ${voterTokenBalance} decimals of balance.`);
  const mintTx = await contract.mint(voter.address,TEST_MINT_VALUE);
  await mintTx.wait();
  voterTokenBalance = contract.balanceOf(voter.address);
  console.log(`After the mint, The voter has  ${voterTokenBalance} decimals of balance.`);
  

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// To run

// yarn hardhat clean
// yarn hardhat compile

//yarn hardhat run scripts/Deployment.ts

/* Output:
blabla
 */