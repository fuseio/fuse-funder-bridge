import { FuseSDK } from "@fuseio/fusebox-web-sdk";
import { ethers } from "ethers";
import { ABI } from "../abi/WrappedTokenBridgeUpgradable";
import dotenv from 'dotenv';
import { Variables } from "@fuseio/fusebox-web-sdk/dist/src/constants/variables";
import { User } from "../models/users"
import mongoose from "mongoose";
import { sendLowBalanceAlert } from "./slack";
dotenv.config();

let fuseSDK: FuseSDK;
const useNonceSequence = true;
const provider = new ethers.providers.JsonRpcProvider(process.env.WEB3_PROVIDER as any);
let address: string

export const initFuseSDK = async () => {
    const credentials = new ethers.Wallet(process.env.PRIVATE_KEY as string);
    const publicApiKey = process.env.PUBLIC_API_KEY as string;
    fuseSDK = await FuseSDK.init(publicApiKey, credentials);
    address = fuseSDK.wallet.getSender();
    console.log("FuseSDK initialized", fuseSDK.wallet.getSender());
    mongoose.connect(process.env.MONGO_URL as string);
    registerListeners();
}

export const registerListeners = () => {
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS as string, ABI, provider);
    contract.on("WrapToken", (localToken: string, remoteToken: string, remoteChainId: number, to: string, amount: BigInt) => {
        console.log("WrapToken event:", localToken, remoteToken, remoteChainId, to, amount.toString());
        checkBalance();
        transfer(remoteToken, remoteChainId, to, amount);
    });
}

const transfer = async (remoteToken: string, remoteChainId: number, to: string, amount: BigInt) => {
    let balance = await provider.getBalance(to)
    if (balance.gt(0)) {
        console.log("Balance is greater than 0, skipping transfer");
        return;
    }
    const user = await User.findOne({ user: to.toLowerCase() });
    if (user) {
        console.log("User found, no need to transfer");
        return;
    } else {
        console.log("User not found, transferring");
        const newUser = new User({ user: to.toLowerCase(), remoteToken, remoteChainId, amount: amount.toString() });
        newUser.save();
    }
    const value = ethers.utils.parseEther(process.env.AIRDROP_AMOUNT as string);
    const data = Uint8Array.from([]);
    const txOptions = { ...Variables.DEFAULT_TX_OPTIONS, useNonceSequence };
    const res = await fuseSDK.callContract(to, value, data, txOptions);
    const receipt = await res?.wait();
    console.log("Transaction Hash:", receipt?.transactionHash);
};

const checkBalance = async () => {
    const balance = await provider.getBalance(address);
    if (balance.lt(ethers.utils.parseEther("5"))) {
        console.log("Balance is low, sending alert");
        const explorerUrl = `https://explorer.fuse.io/address/${address}`;
        sendLowBalanceAlert(ethers.utils.formatEther(balance), explorerUrl);
    }
}