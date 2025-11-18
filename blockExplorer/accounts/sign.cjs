const hre = require("hardhat")

async function main() {
    const accounts = await hre.network.provider.send("eth_accounts");
    const message = "Hello from Hardhat blockExplorer/accounts/sign.cjs"

    try{
        const messageHex =  hre.ethers.hexlify(hre.ethers.toUtf8Bytes(message))
        const signature = await hre.network.provider.send("eth_sign", [accounts[0], messageHex]);
        console.log("Signature: ", signature);
    }
    catch(err){
        console.log("eth_sign failed: ", err.message);
        
    }
    
}

main()
