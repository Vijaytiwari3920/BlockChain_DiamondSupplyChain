const hre = require("hardhat")

async function main() {
    const syncing = await hre.network.provider.send("eth_syncing");
    if(syncing == false){
        console.log("Node is fully synced (eth_syncing : false)");
    }
    else{
        console.log("Node is syncing (eth_syncing): ");
        console.log(syncing);
        
        
    }
}

main()