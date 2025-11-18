const { ethers } = require("hardhat");

async function main() {

  // ==== CONTRACT ADDRESS (CHANGE THIS TO YOURS) ====
  const contractAddress = "0x5A2c197D4C304370dbec65Ac5C3204C6D75b91a0";

  // ==== RPC PROVIDER (iitbhilai network) ====
  const provider = new ethers.JsonRpcProvider("http://10.10.0.62:8550");

  // ==== SIGNER (PRIVATE KEY FROM hardhat.config.js) ====
  const PRIVATE_KEY = "04e62696bc403d5ab741bc2ae6a236c321bd11bf50f4664f3ffa6250f8fdf3e7"; 
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Signer Address:", signer.address);

  // ==== CONTRACT ABI ====
  const contractJSON = require("../artifacts/contracts/DiamondSupplyChain.sol/DiamondSupplyChain.json");
  const diamondSC = new ethers.Contract(contractAddress, contractJSON.abi, signer);

  console.log("Connected to contract:", contractAddress);

  // --------------------------------------------------
  // GRANT ROLES
  // --------------------------------------------------
  console.log("\nGranting roles...");
  await (await diamondSC.grantRole("MINER", signer.address)).wait();
  await (await diamondSC.grantRole("CUTTER", signer.address)).wait();
  await (await diamondSC.grantRole("CERTIFIER", signer.address)).wait();
  await (await diamondSC.grantRole("RETAILER", signer.address)).wait();
  console.log("Roles granted successfully!");

  // --------------------------------------------------
  // MINE DIAMOND
  // --------------------------------------------------
  console.log("\nMining diamond...");
  const tx = await diamondSC.mineDiamond(10, "South Africa");
  const receipt = await tx.wait();

  let minedId = null;

  for (const log of receipt.logs) {
    try {
      const parsed = diamondSC.interface.parseLog(log);
      if (parsed.name === "DiamondMined") {
        minedId = parsed.args.diamondId;
      }
    } catch (e) {}
  }

  if (!minedId) {
    console.error("Mining event not found!");
    return;
  }

  console.log("Diamond Mined → ID:", minedId.toString());

  // --------------------------------------------------
  // CUT & POLISH
  // --------------------------------------------------
  console.log("Cutting diamond...");
  await (await diamondSC.cutAndPolish(minedId, 8, "Excellent", "Mumbai")).wait();

  // --------------------------------------------------
  // CERTIFY
  // --------------------------------------------------
  console.log("Certifying diamond...");
  await (await diamondSC.certifyDiamond(minedId, "D", "VS1", "Perfect stone")).wait();

  // --------------------------------------------------
  // RETAIL
  // --------------------------------------------------
  console.log("Moving to retail...");
  await (await diamondSC.moveToRetail(minedId, "Delhi Showroom")).wait();

  // --------------------------------------------------
  // SALE
  // --------------------------------------------------
  console.log("Recording final sale...");
  await (await diamondSC.recordSale(minedId, signer.address, 150000)).wait();

  // --------------------------------------------------
  // FETCH FINAL DIAMOND DATA
  // --------------------------------------------------
  const d = await diamondSC.diamonds(minedId);

  console.log("\n=== FINAL DIAMOND DATA ===");
  console.log("ID:          ", d.id.toString());
  console.log("Owner:       ", d.currentOwner);
  console.log("Status:      ", d.status.toString());
  console.log("Carat:       ", d.caratWeight.toString());
  console.log("Color:       ", d.color);
  console.log("Clarity:     ", d.clarity);
  console.log("Cut:         ", d.cut);
}

main().catch((err) => {
  console.error("ERROR:", err);
});
