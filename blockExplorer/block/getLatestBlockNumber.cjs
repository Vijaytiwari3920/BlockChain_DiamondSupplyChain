const hre = require("hardhat")

async function main() {
   const tx = await hre.network.provider.send("eth_blockNumber");
   console.log("Latest Block Details: ", parseInt(tx, 16));    
}

main()