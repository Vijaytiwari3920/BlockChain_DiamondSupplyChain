const hre = require("hardhat")

async function main() {
    const tx = await hre.network.provider.send("eth_getTransactionByBlockNumberAndIndex", ["0xd7115", "0x0"]);
    console.log("Transaction Details: ", tx);
}

main()