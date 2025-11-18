import React, { useState, useEffect } from 'react';
// The import below is commented out because the build environment is having trouble resolving it.
// import { ethers } from 'ethers';

// --- Global Variable Setup (We need to declare ethers globally if importing via script tag) ---
// We assume 'ethers' will be available globally after the script tag is loaded.
const ethers = window.ethers;


// --- CONFIGURATION ---
// !!! REPLACE THIS WITH YOUR DEPLOYED CONTRACT ADDRESS !!!
const DEPLOYED_CONTRACT_ADDRESS = "0x5A2c197D4C304370dbec65Ac5C3204C6D75b91a0"; 

// ✅ FULL ABI GENERATED FROM DiamondSupplyChain.sol
// This array contains all functions and events required for interaction.
const DIAMOND_CONTRACT_ABI = [
    // View Functions (Read Data)
    "function contractOwner() view returns (address)",
    "function isMiner(address) view returns (bool)",
    "function isCutter(address) view returns (bool)",
    "function isCertifier(address) view returns (bool)",
    "function isRetailer(address) view returns (bool)",
    "function diamonds(uint256) view returns (uint256 id, address currentOwner, uint256 status, uint256 caratWeight, string color, string clarity, string cut)",
    // Transaction Functions (Write Data)
    "function grantRole(string _role, address _addressToGrant)",
    "function mineDiamond(uint256 _carat, string _location) returns (uint256)",
    "function cutAndPolish(uint256 _diamondId, uint256 _finishedCarat, string _cutQuality, string _location)",
    "function certifyDiamond(uint256 _diamondId, string _color, string _clarity, string _reportNotes)",
    "function moveToRetail(uint256 _diamondId, string _location)",
    "function recordSale(uint256 _diamondId, address _buyer, uint256 _salePrice)",
    // Events (For decoding transaction receipts)
    "event DiamondMined(uint256 indexed diamondId, address indexed miner, string location, uint256 caratWeight)",
    "event StatusUpdated(uint256 indexed diamondId, uint256 fromStatus, uint256 toStatus, address indexed actor)",
    "event DiamondSold(uint256 indexed diamondId, address indexed buyer, uint256 salePrice)"
];

// Map the contract's enum values for display (0-4)
const STATUS_MAP = {
    0: 'Mined ⛏️', 
    1: 'Cut and Polished 🔪', 
    2: 'Certified 📃', 
    3: 'In Retail 🛍️', 
    4: 'Sold ✅'
};

// --- Helper Components ---

// Component 1: Admin Role Granter
const RoleGranter = ({ onGrant }) => {
    const [role, setRole] = useState('MINER');
    const [addr, setAddr] = useState('');

    return (
        <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg shadow-inner">
            <h4 className="text-lg font-semibold text-gray-700">Grant Role (Admin Action)</h4>
            <div className="flex gap-3">
                <select 
                    value={role} 
                    onChange={e => setRole(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md flex-1"
                >
                    <option value="MINER">MINER</option>
                    <option value="CUTTER">CUTTER</option>
                    <option value="CERTIFIER">CERTIFIER</option>
                    <option value="RETAILER">RETAILER</option>
                </select>
                <input 
                    type="text" 
                    placeholder="Address to grant role (0x...)" 
                    value={addr} 
                    onChange={e => setAddr(e.target.value)} 
                    className="p-2 border border-gray-300 rounded-md flex-2"
                />
            </div>
            <button 
                onClick={() => onGrant(role, addr)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150 shadow-md"
            >
                Grant Role
            </button>
        </div>
    );
};

// Component 2: Diamond Stage Card
const StageCard = ({ title, diamondId, children, isDisabled = false }) => (
    <div className={`p-5 rounded-xl shadow-lg transition duration-300 ${isDisabled ? 'bg-gray-100 text-gray-400' : 'bg-white hover:shadow-xl'}`}>
        <h4 className="text-xl font-bold mb-3 text-blue-800 flex justify-between items-center">
            {title}
            <span className="text-sm font-normal text-gray-500">ID: {diamondId || 'N/A'}</span>
        </h4>
        {children}
    </div>
);

// --- Stage-Specific Forms ---

const Stage1Mine = ({ onMine }) => {
    const [carat, setCarat] = useState(5.00);
    const [location, setLocation] = useState("Siberia, Russia");
    return (
        <StageCard title="Stage 1: Mine Diamond" diamondId="">
            <div className="flex flex-col space-y-3">
                <input type="number" step="0.01" value={carat} onChange={e => setCarat(e.target.value)} placeholder="Raw Carat Weight (e.g., 5.00)" className="p-2 border rounded-md" />
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Mining Location" className="p-2 border rounded-md" />
                <button onClick={() => onMine(carat, location)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition duration-150">
                    Execute Mining (Miner Role)
                </button>
            </div>
        </StageCard>
    );
};

const Stage2Cut = ({ onCut, diamondId }) => {
    const [carat, setCarat] = useState(2.50);
    const [cut, setCut] = useState("Excellent");
    const [location, setLocation] = useState("Surat, India");
    const isDisabled = !diamondId;
    return (
        <StageCard title="Stage 2: Cut & Polish" diamondId={diamondId} isDisabled={isDisabled}>
            <div className="flex flex-col space-y-3">
                <input type="number" step="0.01" value={carat} onChange={e => setCarat(e.target.value)} placeholder="Finished Carat Weight" className="p-2 border rounded-md" disabled={isDisabled} />
                <input type="text" value={cut} onChange={e => setCut(e.target.value)} placeholder="Cut Quality" className="p-2 border rounded-md" disabled={isDisabled} />
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Cutting Location" className="p-2 border rounded-md" disabled={isDisabled} />
                <button onClick={() => onCut(diamondId, carat, cut, location)} disabled={isDisabled} className={`font-bold py-2 rounded-lg transition duration-150 ${isDisabled ? 'bg-gray-400' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}>
                    Execute Cut (Cutter Role)
                </button>
            </div>
        </StageCard>
    );
};

const Stage3Certify = ({ onCertify, diamondId }) => {
    const [color, setColor] = useState("D");
    const [clarity, setClarity] = useState("VVS1");
    const [notes, setNotes] = useState("GIA Report 123456");
    const isDisabled = !diamondId;
    return (
        <StageCard title="Stage 3: Certify" diamondId={diamondId} isDisabled={isDisabled}>
            <div className="flex flex-col space-y-3">
                <input type="text" value={color} onChange={e => setColor(e.target.value)} placeholder="Color Grade (e.g., D)" className="p-2 border rounded-md" disabled={isDisabled} />
                <input type="text" value={clarity} onChange={e => setClarity(e.target.value)} placeholder="Clarity Grade (e.g., VVS1)" className="p-2 border rounded-md" disabled={isDisabled} />
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Report Notes" className="p-2 border rounded-md" disabled={isDisabled} />
                <button onClick={() => onCertify(diamondId, color, clarity, notes)} disabled={isDisabled} className={`font-bold py-2 rounded-lg transition duration-150 ${isDisabled ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
                    Execute Certification (Certifier Role)
                </button>
            </div>
        </StageCard>
    );
};

const Stage4Retail = ({ onRetail, diamondId }) => {
    const [location, setLocation] = useState("Tiffany & Co., New York");
    const isDisabled = !diamondId;
    return (
        <StageCard title="Stage 4: Move to Retail" diamondId={diamondId} isDisabled={isDisabled}>
            <div className="flex flex-col space-y-3">
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Retail Location" className="p-2 border rounded-md" disabled={isDisabled} />
                <button onClick={() => onRetail(diamondId, location)} disabled={isDisabled} className={`font-bold py-2 rounded-lg transition duration-150 ${isDisabled ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                    Execute Move (Retailer Role)
                </button>
            </div>
        </StageCard>
    );
};

const Stage5Sale = ({ onSale, diamondId }) => {
    const [buyer, setBuyer] = useState("0x...");
    const [price, setPrice] = useState(50.0);
    const isDisabled = !diamondId;
    return (
        <StageCard title="Stage 5: Record Sale" diamondId={diamondId} isDisabled={isDisabled}>
            <div className="flex flex-col space-y-3">
                <input type="text" value={buyer} onChange={e => setBuyer(e.target.value)} placeholder="Consumer Address (0x...)" className="p-2 border rounded-md" disabled={isDisabled} />
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="Sale Price (in ETH/Base Unit)" className="p-2 border rounded-md" disabled={isDisabled} />
                <button onClick={() => onSale(diamondId, buyer, price)} disabled={isDisabled} className={`font-bold py-2 rounded-lg transition duration-150 ${isDisabled ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                    Record Sale (Retailer Role)
                </button>
            </div>
        </StageCard>
    );
};


// --- Main App Component ---

export default function App() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [diamondId, setDiamondId] = useState('');
    const [statusMessage, setStatusMessage] = useState('Connect your wallet to get started.');
    const [diamondData, setDiamondData] = useState(null);
    const [fetchId, setFetchId] = useState('');

    // --- Dynamic Script Loader for Ethers.js ---
    useEffect(() => {
        // Only load the script if ethers isn't globally available (which it shouldn't be yet)
        if (typeof window.ethers === 'undefined') {
            const script = document.createElement('script');
            // Using Ethers v6 CDN URL
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.umd.min.js';
            script.onload = () => {
                // Ethers.js v6 attaches all modules to window.ethers
                console.log("Ethers.js v6 loaded successfully.");
                // We don't need to update state here, as the App logic uses window.ethers directly, 
                // but this ensures the library is available before interaction.
            };
            document.head.appendChild(script);
            
            return () => {
                document.head.removeChild(script);
            };
        }
    }, []);

    // --- Wallet & Contract Initialization ---
    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined' && typeof window.ethers !== 'undefined') {
            try {
                // Ethers v6: The provider is created using the browser's window.ethereum
                // Use the globally exposed ethers object
                const provider = new ethers.BrowserProvider(window.ethereum);
                setProvider(provider);
                
                // Request accounts and get the signer
                const accounts = await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();

                setAccount(accounts[0]);
                setSigner(signer);
                setStatusMessage(`Wallet connected: ${accounts[0].substring(0, 6)}...${accounts[0].slice(-4)}`);

                // Initialize the Contract instance with the Signer
                const contractInstance = new ethers.Contract(
                    DEPLOYED_CONTRACT_ADDRESS,
                    DIAMOND_CONTRACT_ABI,
                    signer // The signer is needed for transactions
                );
                setContract(contractInstance);

            } catch (error) {
                console.error("User rejected access or error connecting:", error);
                setStatusMessage('Failed to connect wallet. Ensure Metamask is running.');
            }
        } else if (typeof window.ethers === 'undefined') {
             setStatusMessage('Ethers.js library is still loading. Please wait a moment and try again.');
        } else {
            setStatusMessage('Metamask or a compatible wallet is not detected.');
        }
    };

    // --- Role Management (Admin only) ---
    const handleGrantRole = async (roleName, targetAddress) => {
        if (!contract) return setStatusMessage('Contract not loaded.');
        setStatusMessage(`Granting ${roleName} role to ${targetAddress}...`);
        try {
            const tx = await contract.grantRole(roleName, targetAddress);
            await tx.wait();
            setStatusMessage(`✅ Successfully granted ${roleName} role! Tx: ${tx.hash.substring(0, 10)}...`);
        } catch (error) {
            console.error(error);
            setStatusMessage(`❌ Error granting role: ${error.reason || error.message}`);
        }
    };
    
    // --- Diamond Interaction Functions ---

    const handleMineDiamond = async (carat, location) => {
        if (!contract) return setStatusMessage('Contract not loaded.');
        setStatusMessage('Mining diamond...');

        try {
            const initialCarat = Math.floor(Number(carat) * 100); // Convert XX.XX to 2 decimal integer
            const tx = await contract.mineDiamond(initialCarat, location);
            const receipt = await tx.wait();

            let newDiamondId = null;
            if (receipt.logs) {
                const parsedLog = receipt.logs
                    .map(log => {
                        try {
                            return contract.interface.parseLog(log);
                        } catch (e) { return null; }
                    })
                    .find(log => log && log.name === 'DiamondMined');
                
                if (parsedLog && parsedLog.args) {
                    newDiamondId = Number(parsedLog.args.diamondId); 
                }
            }
            
            if (newDiamondId) {
                setDiamondId(newDiamondId.toString()); // Set ID for auto-fetch
                await fetchDiamondData(newDiamondId);
                setStatusMessage(`✅ Diamond #${newDiamondId} mined successfully at ${location}!`);
            } else {
                throw new Error("Could not read the new Diamond ID from the event log.");
            }

        } catch (error) {
            console.error(error);
            setStatusMessage(`❌ Error mining diamond: ${error.reason || error.message}`);
        }
    };

    const handleCutDiamond = async (id, finishedCarat, cutQuality, location) => {
        if (!contract || !id) return setStatusMessage('Contract not ready or ID is missing.');
        setStatusMessage(`Cutting diamond #${id}...`);
        try {
            const finished = Math.floor(Number(finishedCarat) * 100);
            const tx = await contract.cutAndPolish(id, finished, cutQuality, location);
            await tx.wait();
            await fetchDiamondData(id);
            setStatusMessage(`✅ Diamond #${id} cut and polished!`);
        } catch (error) {
            console.error(error);
            setStatusMessage(`❌ Error cutting diamond: ${error.reason || error.message}`);
        }
    };

    const handleCertifyDiamond = async (id, color, clarity, notes) => {
        if (!contract || !id) return setStatusMessage('Contract not ready or ID is missing.');
        setStatusMessage(`Certifying diamond #${id}...`);
        try {
            const tx = await contract.certifyDiamond(id, color, clarity, notes);
            await tx.wait();
            await fetchDiamondData(id);
            setStatusMessage(`✅ Diamond #${id} certified!`);
        } catch (error) {
            console.error(error);
            setStatusMessage(`❌ Error certifying diamond: ${error.reason || error.message}`);
        }
    };
    
    const handleMoveToRetail = async (id, location) => {
        if (!contract || !id) return setStatusMessage('Contract not ready or ID is missing.');
        setStatusMessage(`Moving diamond #${id} to retail...`);
        try {
            const tx = await contract.moveToRetail(id, location);
            await tx.wait();
            await fetchDiamondData(id);
            setStatusMessage(`✅ Diamond #${id} moved to retail at ${location}!`);
        } catch (error) {
            console.error(error);
            setStatusMessage(`❌ Error moving to retail: ${error.reason || error.message}`);
        }
    };
    
    const handleRecordSale = async (id, buyerAddress, priceETH) => {
        if (!contract || !id) return setStatusMessage('Contract not ready or ID is missing.');
        setStatusMessage(`Recording sale for diamond #${id}...`);
        try {
            // Check if ethers is available globally
            if (typeof window.ethers === 'undefined') {
                throw new Error("Ethers library not yet loaded.");
            }
            const salePriceWei = window.ethers.parseUnits(priceETH.toString(), "ether"); 
            const tx = await contract.recordSale(id, buyerAddress, salePriceWei);
            await tx.wait();
            await fetchDiamondData(id);
            setStatusMessage(`✅ Diamond #${id} sold to ${buyerAddress.substring(0, 6)}...!`);
        } catch (error) {
            console.error(error);
            setStatusMessage(`❌ Error recording sale: ${error.reason || error.message}`);
        }
    };

    // --- Read Function ---
    const fetchDiamondData = async (idToFetch) => {
        const id = Number(idToFetch);
        if (!contract || !id || id <= 0) {
            setDiamondData(null);
            return;
        }
        
        setStatusMessage(`Fetching data for Diamond #${id}...`);
        try {
            const data = await contract.diamonds(id);
            
            const formattedData = {
                id: Number(data[0]),
                currentOwner: data[1],
                status: STATUS_MAP[Number(data[2])],
                caratWeight: Number(data[3]) / 100, // Convert back to XX.XX carats
                color: data[4],
                clarity: data[5],
                cut: data[6],
            };
            setDiamondData(formattedData);
            setStatusMessage(`Fetched data for Diamond #${id}. Current Status: ${formattedData.status}`);
        } catch (error) {
            console.error("Error fetching diamond data:", error);
            setDiamondData(null);
            setStatusMessage(`❌ Could not find data for Diamond #${id}.`);
        }
    };
    
    // Effect to auto-fetch data when contract or tracked ID changes
    useEffect(() => {
        if (diamondId && contract) {
            fetchDiamondData(diamondId);
        }
    }, [diamondId, contract]); 

    // --- Render Logic ---
    
    // Loading/Connect Screen
    if (!account) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
                <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
                    <h1 className="text-3xl font-extrabold text-blue-600 mb-4">💎 Diamond Tracker</h1>
                    <p className="text-gray-600 mb-6">Connect your web3 wallet to interact with the supply chain smart contract.</p>
                    <button 
                        onClick={connectWallet} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-150 shadow-lg transform hover:scale-105"
                    >
                        Connect Metamask
                    </button>
                    <p className="mt-4 text-sm text-red-500 font-medium">{statusMessage}</p>
                </div>
            </div>
        );
    }
    
    // Main Application Screen
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="bg-white p-6 rounded-xl shadow-lg mb-6 flex justify-between items-center flex-wrap">
                    <div>
                        <h1 className="text-3xl font-extrabold text-blue-800">💎 Diamond Supply Chain</h1>
                        <p className="text-sm text-gray-500">Contract: {DEPLOYED_CONTRACT_ADDRESS.substring(0, 10)}...</p>
                    </div>
                    <div className="text-right mt-3 sm:mt-0">
                        <p className="text-sm font-semibold text-gray-700">Connected As: {account.substring(0, 6)}...{account.slice(-4)}</p>
                        <p className={`text-xs p-1 rounded-full inline-block mt-1 ${statusMessage.startsWith('✅') ? 'bg-green-100 text-green-700' : statusMessage.startsWith('❌') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {statusMessage}
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Admin Section */}
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin & Tracker</h2>
                        <RoleGranter onGrant={handleGrantRole} />

                        <div className="mt-6 p-4 bg-white rounded-xl shadow-md">
                            <h4 className="text-lg font-semibold text-gray-700 mb-3">Track Diamond ID</h4>
                            <div className="flex gap-3">
                                <input 
                                    type="number" 
                                    placeholder="Enter Diamond ID (e.g., 1)" 
                                    value={fetchId} 
                                    onChange={e => setFetchId(e.target.value)} 
                                    className="p-2 border border-gray-300 rounded-md flex-1"
                                />
                                <button 
                                    onClick={() => setDiamondId(fetchId)} 
                                    disabled={!fetchId}
                                    className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg transition duration-150"
                                >
                                    Track
                                </button>
                            </div>
                        </div>

                        {/* Diamond Details */}
                        {diamondData && (
                            <div className="mt-6 p-6 bg-blue-50 border-l-4 border-blue-600 rounded-xl shadow-lg">
                                <h3 className="text-xl font-bold text-blue-800 mb-2">ID #{diamondData.id} Summary</h3>
                                <p className="text-sm text-gray-700 mb-2">Owner: {diamondData.currentOwner.substring(0, 8)}...</p>
                                <p className="text-lg font-extrabold text-blue-600">Status: {diamondData.status}</p>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    <p>Weight: **{diamondData.caratWeight}** ct</p>
                                    <p>Cut: {diamondData.cut || 'N/A'}</p>
                                    <p>Color: {diamondData.color || 'N/A'}</p>
                                    <p>Clarity: {diamondData.clarity || 'N/A'}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stage Execution Section */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Execute Supply Chain Stages</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Stage1Mine onMine={handleMineDiamond} />
                            <Stage2Cut onCut={handleCutDiamond} diamondId={diamondId} />
                            <Stage3Certify onCertify={handleCertifyDiamond} diamondId={diamondId} />
                            <Stage4Retail onRetail={handleMoveToRetail} diamondId={diamondId} />
                            <Stage5Sale onSale={handleRecordSale} diamondId={diamondId} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}