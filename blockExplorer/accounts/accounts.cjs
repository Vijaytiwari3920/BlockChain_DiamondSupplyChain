const hre = require("hardhat")

async function main() {
    const accounts = await hre.network.provider.send("eth_accounts");
    console.log("Accounts managed by the node: ", accounts); 

    if(accounts.length == 0){
        console.log("No accounts found!");
     }
}

main()