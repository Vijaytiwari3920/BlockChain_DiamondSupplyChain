const hre = require("hardhat")

async function main() {
    const listening = await hre.network.provider.send("net_listening");
    console.log("Listening for peers (net_listening): ", listening); 
}

main()