const hre = require("hardhat")

async function main() {
    const blockHash = "0xcc9f978b75df82f30edb5d4f9ac5115bbd349f7e9527e0e83fa2ea7a8ea57215"
    const tx = await hre.network.provider.send("eth_getBlockByHash", [blockHash, true]);

    console.log("Block Details: ", tx);
    
}

main()