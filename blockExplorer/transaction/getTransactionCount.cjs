const hre = require("hardhat")

async function main() {
    const txFrom = "0xe367c63509d294fbe048ab318b1095571a170253"
    const nonce = await hre.network.provider.send("eth_getTransactionCount", [txFrom, "latest"]);

    console.log("Nonce for address ",txFrom, " : ",parseInt(nonce, 16));
    
}

main()