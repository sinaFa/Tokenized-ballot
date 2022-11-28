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
  let votePower = await contract.getVotes(voter.address);
  console.log(`After the mint, The voter has  ${votePower} decimals of vote power.`);
  
  // By default, no voting power unless we delegate to ourselves:
  const delegateTx = await contract.connect(voter).delegate(voter.address);
  await delegateTx.wait();
  votePower = await contract.getVotes(voter.address);
  console.log(`After the self delegation, The voter has  ${votePower} decimals of vote power.`);

  // Whenever we transfer/SEND, we update our voting power (reduces by the numnber of tokens we sent)
  // The wallet RECEIVING will NOT have increased voting unless self delegates
  // This is to prevent double spending where you use voting power from tokens you don't have anymore.
  const transferTx = await contract.connect(voter).transfer(other.address,TEST_MINT_VALUE.div(2));
  await transferTx.wait();

  votePower = await contract.getVotes(voter.address);
  console.log(`After the transfer The voter has  ${votePower} decimals of vote power.`);

  votePower = await contract.getVotes(other.address);
  console.log(`After the transfer The other account has  ${votePower} decimals of vote power.`);

  const delegateOtherTx = await contract.connect(other).delegate(other.address);
  await delegateOtherTx.wait();
  votePower = await contract.getVotes(other.address);
  console.log(`After the self delegation, The other account has ${votePower} decimals of vote power.`);

  const currentBlock = await ethers.provider.getBlock("latest");
  for (let blockNumber = currentBlock.number -1; blockNumber >= 0; blockNumber--){
    const pastVoterPower = await contract.getPastVotes(voter.address, blockNumber);
    console.log(`At block ${blockNumber}, the voter had ${votePower} decimals of vote power.\n`);
  }


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
Tokenized vote Contract deployed at address 0x5FbDB2315678afecb367f032d93F642f64180aa3 

The voter starts with 0 decimals of balance.
After the mint, The voter has  10000000000000000000 decimals of balance.
After the mint, The voter has  0 decimals of vote power.
After the self delegation, The voter has  10000000000000000000 decimals of vote power.
After the transfer The voter has  5000000000000000000 decimals of vote power.
After the transfer The other account has  0 decimals of vote power.
 */
