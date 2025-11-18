const { ethers } = require("hardhat");

// --- UTILITY FUNCTION ---
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- CONFIGURATION ---
// !!! DEPLOYED ADDRESS HAS BEEN UPDATED HERE !!!
const DEPLOYED_CONTRACT_ADDRESS = "0x5A2c197D4C304370dbec65Ac5C3204C6D75b91a0";
// ---------------------

async function main() {
    console.log("--- Starting Diamond Supply Chain Simulation ---");

    // Get the first few signers (accounts) provided by Hardhat
    const signers = await ethers.getSigners();
  
    // Since the initial check was removed by the user in the provided snippet, 
    // we'll proceed assuming 6 signers are available for the sake of completion.
    if (signers.length < 6) {
        console.error("\n ERROR: Insufficient number of signers available. The script requires 6 funded accounts.");
        process.exit(1);
    }
    
    // Assign roles to the available signers
    const contractOwner = signers[0]; // Deployer / Admin
    const miner = signers[1];
    const cutter = signers[2];
    const certifier = signers[3];
    const retailer = signers[4];
    const consumer = signers[5]; // The final buyer

    // 1. Get the contract instance
    let contract;
    try {
        // FIX 1: Changed ethers.utils.getAddress to ethers.getAddress (Ethers v6)
        const validatedAddress = ethers.getAddress(DEPLOYED_CONTRACT_ADDRESS);
        
        const DiamondSupplyChain = await ethers.getContractFactory("DiamondSupplyChain");
        // Use the validated address and the contract interface
        contract = new ethers.Contract(
            validatedAddress,
            DiamondSupplyChain.interface,
            contractOwner // The signer used for transactions
        );
        
        console.log(`\nContract loaded at: ${contract.target}`);
        console.log(`Contract Owner (Admin): ${contractOwner.address}`);
        console.log(`Miner: ${miner.address}`);
        console.log(`Cutter: ${cutter.address}`);
        console.log(`Certifier: ${certifier.address}`);
        console.log(`Retailer: ${retailer.address}`);
        console.log(`Consumer: ${consumer.address}`);

    } catch (e) {
        if (e.message.includes("invalid address")) {
            console.error("\n ERROR: Invalid Contract Address.");
            console.error("Please ensure you replaced the DEPLOYED_CONTRACT_ADDRESS placeholder with the correct address from your Ignition deployment output.");
        } else {
            throw e; // Re-throw any other errors
        }
    }


    // --- 2. ADMIN SETUP: Granting Roles ---
    console.log("\n--- 2. Role Setup ---");

    // Ensure all transactions wait for confirmation (.wait())
    await contract.connect(contractOwner).grantRole("MINER", miner.address).then(tx => tx.wait());
    console.log(` Granted MINER role to ${miner.address}`);

    await contract.connect(contractOwner).grantRole("CUTTER", cutter.address).then(tx => tx.wait());
    console.log(` Granted CUTTER role to ${cutter.address}`);

    await contract.connect(contractOwner).grantRole("CERTIFIER", certifier.address).then(tx => tx.wait());
    console.log(` Granted CERTIFIER role to ${certifier.address}`);

    await contract.connect(contractOwner).grantRole("RETAILER", retailer.address).then(tx => tx.wait());
    console.log(` Granted RETAILER role to ${retailer.address}`);

    // --- CRITICAL DELAY: Wait 3 seconds to ensure state is synchronized across the network ---
    console.log("... Waiting 3 seconds for role assignment confirmation on network...");
    await sleep(3000);
    console.log("... Resuming script.");


    // --- 3. STAGE 1: Mined (Miner Role) ---
    console.log("\n--- 3. Stage 1: Mined (Miner) ---");
    const initialCarat = 500; // 5.00 carats (using 2 decimal places implicitly for simplicity)
    const miningLocation = "Siberia, Russia";

    // Transaction uses the Miner account
    const mineTx = await contract.connect(miner).mineDiamond(initialCarat, miningLocation);
    const mineReceipt = await mineTx.wait();

    // --- FIX START: ROBUST EVENT PARSING ---
    let diamondId;
    let minedEventLog;
    
    // Use mineReceipt.logs and contract.interface.parseLog() for robust event parsing.
    if (mineReceipt.logs && mineReceipt.logs.length > 0) {
        minedEventLog = mineReceipt.logs
            .map(log => {
                try {
                    // Try to decode the log using the contract's ABI
                    return contract.interface.parseLog(log);
                } catch (e) {
                    // Ignore logs that don't belong to this contract or are unparseable
                    return null;
                }
            })
            // Find the log specifically for the 'DiamondMined' event
            .find(parsedLog => parsedLog && parsedLog.name === 'DiamondMined');
    }

    if (minedEventLog && minedEventLog.args) {
        // FIX 3: Changed .toNumber() to Number() to handle native BigInt (Ethers v6)
        // Since the diamond ID is small (starts at 1), converting BigInt to Number is safe.
        diamondId = Number(minedEventLog.args.diamondId); 
    } else {
         throw new Error("Could not find or parse DiamondMined event from transaction logs. The transaction might have reverted or the event log format is unexpected.");
    }
    // --- FIX END ---
    
    console.log(` Diamond #${diamondId} mined. Raw Weight: ${initialCarat/100} carats.`);


    // --- 4. STAGE 2: Cut and Polished (Cutter Role) ---
    console.log("\n--- 4. Stage 2: Cut and Polished (Cutter) ---");
    const finishedCarat = 250; // 2.50 carats after cutting
    const cutQuality = "Excellent";
    const cuttingLocation = "Surat, India";

    // Transaction uses the Cutter account
    await contract.connect(cutter).cutAndPolish(diamondId, finishedCarat, cutQuality, cuttingLocation).then(tx => tx.wait());
    console.log(`✔ Diamond #${diamondId} cut and polished. Finished Weight: ${finishedCarat/100} carats.`);
    
    
    // --- 5. STAGE 3: Certified (Certifier Role) ---
    console.log("\n--- 5. Stage 3: Certified (Certifier) ---");
    const color = "D"; // Highest grade
    const clarity = "VVS1"; // Very Very Slightly Included 1
    const reportNotes = "Laser inscribed with GIA report number 123456.";
    
    // Transaction uses the Certifier account
    await contract.connect(certifier).certifyDiamond(diamondId, color, clarity, reportNotes).then(tx => tx.wait());
    console.log(` Diamond #${diamondId} certified. Grades: Color=${color}, Clarity=${clarity}.`);
    

    // --- 6. STAGE 4: Move to Retail (Retailer Role) ---
    console.log("\n--- 6. Stage 4: Move to Retail (Retailer) ---");
    const retailLocation = "Tiffany & Co., New York";

    // Transaction uses the Retailer account
    await contract.connect(retailer).moveToRetail(diamondId, retailLocation).then(tx => tx.wait());
    console.log(` Diamond #${diamondId} moved to retail at ${retailLocation}.`);


    // --- 7. STAGE 5: Record Sale (Retailer Role) ---
    console.log("\n--- 7. Stage 5: Record Sale (Retailer) ---");
    // FIX 2: Changed ethers.utils.parseUnits to ethers.parseUnits (Ethers v6)
    const salePrice = ethers.parseUnits("50", 18); // Simulating a high price in Wei (50 ETH/units)

    // Transaction uses the Retailer account
    await contract.connect(retailer).recordSale(diamondId, consumer.address, salePrice).then(tx => tx.wait());
    console.log(` Diamond #${diamondId} sold to consumer ${consumer.address}.`);


    // --- 8. Final Verification ---
    console.log("\n--- 8. Final Verification (Read Data) ---");
    // Reading is done by the Admin account (contractOwner)
    const finalDiamondData = await contract.diamonds(diamondId);
    // The enum index (0=Mined, 4=Sold) is returned as a BigInt, we use toString() for clean printing.
    console.log(`Final Status (enum index): ${finalDiamondData.status.toString()}`); // Should be 4 (Sold)
    console.log(`Final Owner: ${finalDiamondData.currentOwner}`); // Should be Consumer's address

    console.log("\n--- Simulation Complete! ---");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });