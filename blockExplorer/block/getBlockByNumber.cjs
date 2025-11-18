const hre = require("hardhat")

async function main() {
   const tx = await hre.network.provider.send("eth_getBlockByNumber", ["0xd7115", true]);
    console.log("Block Details: ", tx);
    
}

main()