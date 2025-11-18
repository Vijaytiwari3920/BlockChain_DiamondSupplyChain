const hre = require("hardhat")

async function main() {
    const netVersion = await hre.network.provider.send("net_version");
    console.log("Network Id: ", netVersion); 
}

main()