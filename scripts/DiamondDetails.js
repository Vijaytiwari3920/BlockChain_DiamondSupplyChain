// scripts/queryDiamonds.js
const { ethers } = require("hardhat");

async function main() {
  console.log("=== Diamond Supply Chain Query Script ===\n");

  // Contract address
  const CONTRACT_ADDRESS = "0x5A2c197D4C304370dbec65Ac5C3204C6D75b91a0";
  
  // Get contract instance
  const DiamondSupplyChain = await ethers.getContractFactory("DiamondSupplyChain");
  const contract = await DiamondSupplyChain.attach(CONTRACT_ADDRESS);

  console.log("Contract attached at:", CONTRACT_ADDRESS);
  console.log("");

  try {
    // Query multiple diamonds (adjust the range based on how many you've created)
    for (let i = 1; i < 50; i++) {
      try {
        const diamond = await contract.diamonds(i);
        
        // Check if diamond exists (id will be 0 if not exists)
        if (diamond.id.toString() !== "0") {
          console.log(`=== Diamond ID: ${diamond.id} ===`);
          console.log("Status:", getStatusName(diamond.status));
          console.log("Owner:", diamond.currentOwner);
          console.log("Carat Weight:", diamond.caratWeight.toString());
          console.log("Color:", diamond.color || "Not set");
          console.log("Clarity:", diamond.clarity || "Not set");
          console.log("Cut:", diamond.cut || "Not set");
          console.log("");
        }
      } catch (error) {
        // Diamond doesn't exist or other error
        break;
      }
    }

    // Check role assignments
    const [owner, miner, cutter, certifier, retailer] = await ethers.getSigners();
    
    console.log("=== Role Verification ===");
    console.log("Is miner authorized?", await contract.isMiner(miner.address));
    console.log("Is cutter authorized?", await contract.isCutter(cutter.address));
    console.log("Is certifier authorized?", await contract.isCertifier(certifier.address));
    console.log("Is retailer authorized?", await contract.isRetailer(retailer.address));
    
  } catch (error) {
    console.error("Error:", error);
  }
}

function getStatusName(statusNumber) {
  const statusNames = [
    "Mined",
    "CutAndPolished", 
    "Certified",
    "InRetail",
    "Sold"
  ];
  return statusNames[statusNumber] || "Unknown";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });