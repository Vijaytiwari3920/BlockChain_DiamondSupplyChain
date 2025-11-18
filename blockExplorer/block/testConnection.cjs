const { ethers } = require("hardhat");

async function main() {
  const provider = new ethers.JsonRpcProvider("http://10.10.0.62:8550");
  const block = await provider.getBlockNumber();
  console.log("Connected! Latest block:", block);
}

main().catch(console.error);
