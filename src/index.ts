import { config } from "dotenv"
import { IBundler, Bundler } from '@biconomy/bundler'
import {  BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { ethers } from 'ethers'
import { ChainId } from "@biconomy/core-types"
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from "@biconomy/modules";

config()
const bundler: IBundler = new Bundler({
    bundlerUrl: process.env.BICONOMY_BUNDLER_URL as string,     
    chainId: ChainId.POLYGON_MUMBAI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  })

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);

async function createAccount() {
try {
    const module = await ECDSAOwnershipValidationModule.create({
      signer: wallet,
      moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
    })
  
    let biconomySmartAccount = await BiconomySmartAccountV2.create({
    chainId: ChainId.POLYGON_MUMBAI,
    bundler: bundler, 
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    defaultValidationModule: module,
    activeValidationModule: module
  })
    console.log("address: ", await biconomySmartAccount.getAccountAddress())
    return biconomySmartAccount;
} catch (err) {
    console.error(err)
}
}
  
async function createTransaction() {
try {
    console.log("creating account")
  
    const smartAccount = await createAccount();
  
    const transaction = {
      to: '0x322Af0da66D00be980C7aa006377FCaaEee3BDFD',
      data: '0x',
      value: ethers.utils.parseEther('0.1'),
    }

    if (smartAccount !== undefined) {
    const userOp = await smartAccount.buildUserOp([transaction])
    userOp.paymasterAndData = "0x"
  
    const userOpResponse = await smartAccount.sendUserOp(userOp)
  
    const transactionDetail = await userOpResponse.wait()
  
    console.log("transaction detail below")
        console.log(`https://mumbai.polygonscan.com/tx/${transactionDetail.receipt.transactionHash}`)
    }
    } catch (err) {
        console.error(err)
    }
}


createTransaction()