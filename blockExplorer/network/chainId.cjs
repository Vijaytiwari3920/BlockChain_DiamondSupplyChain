const hre = require("hardhat")

async function main() {
    const chainId = await hre.network.provider.send("eth_chainId");
    console.log("ChainId: ", parseInt(chainId,16)); 
}

main()
