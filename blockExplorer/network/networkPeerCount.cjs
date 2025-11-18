const hre = require("hardhat")

async function main() {
    const peerCountHash = await hre.network.provider.send("net_peerCount");
    console.log("Peer Count: ", parseInt(peerCountHash, 16)); 
}

main()