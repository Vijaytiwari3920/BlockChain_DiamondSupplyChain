const hre = require("hardhat")

async function main() {
    const txHash = "0x970f4b64c060ab11706931623493a8b72898f1c9d0b3d3ab06549d91063371dd"
    const tx = await hre.network.provider.send("eth_getTransactionReceipt", [txHash]);

    console.log("Transaction Receipt: ", tx);
    
}

main()