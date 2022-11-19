import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";


import * as dotenv from "dotenv";
import {MyERC20, MyERC20__factory} from "../typechain-types"
dotenv.config();


describe("Basic tests for understanding ERC20", async () => {
    let accounts: SignerWithAddress[];
    let erc20TokenContrat: MyERC20;

    beforeEach(async () =>  {
      accounts = await ethers.getSigners();
      const erc20TokenFactory = new MyERC20__factory(accounts[0]);
      erc20TokenContrat = await erc20TokenFactory.deploy();
      await erc20TokenContrat.deployed();   
    });

    it("Should have zero total supply at deployment", async()=>{
      const totalSupply = await erc20TokenContrat.totalSupply();
      expect(totalSupply).to.eq(0);
    });

    it("triggers the Transfer event with the address of the sender when sending transactions", async()=>{
      const mintTx = await erc20TokenContrat.mint(accounts[0].address, 10);
      await mintTx.wait();
      //We do the transfer and we expect the Event Transfer (defined in IERC20 interface) that take parameters : 1. from 2. to 3. value
      await expect(erc20TokenContrat.transfer(accounts[1].address,1))
      .to.emit(erc20TokenContrat, "Transfer")
      .withArgs(accounts[0].address,accounts[1].address,1);
      
    });
});
