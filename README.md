# **💎 Diamond Supply Chain Tracker on Ethereum**

## **About The Project**

This project implements a decentralized, transparent, and immutable **Diamond Supply Chain** tracking system using a Solidity Smart Contract and a modern React frontend interface. The goal is to provide irrefutable provenance for a diamond, tracking it through its entire lifecycle, from the mine to the final consumer.

### **Key Features**

1. **Immutable Provenance:** All major transactions and status changes are recorded on the Ethereum blockchain, ensuring that the history of each diamond cannot be tampered with.  
2. **Role-Based Access Control:** The contract uses internal access controls (Miner, Cutter, Certifier, Retailer) to ensure only authorized entities can perform specific supply chain actions, reinforcing data integrity.  
3. **Real-Time Tracking:** The React application allows users to interact with the contract, execute state changes (transactions), and query the current status and detailed data (4Cs, weight, owner) of any registered diamond in real-time.

### **Technology Stack**

| Component | Technology | Purpose |
| :---- | :---- | :---- |
| **Smart Contract** | **Solidity 0.8+** | Core business logic and immutable data storage. |
| **Blockchain/Testing** | **Hardhat** | Local development network, compilation, and scripting. |
| **Frontend** | **Vite \+ React** | Modern, fast web interface for user interaction. |
| **Web3 Integration** | **Ethers.js v6** | Connecting the frontend application to Metamask and the Ethereum network. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework for a responsive, clean design. |

## **⚙️ Smart Contract Logic (DiamondSupplyChain.sol)**

The heart of the system is the DiamondSupplyChain contract, which utilizes a state machine implemented via a DiamondStatus enum. Each function is protected by a specific role modifier.

### **Diamond Lifecycle (The 5 Stages)**

| Stage | Status | Role Required | Description |
| :---- | :---- | :---- | :---- |
| **1\. Mining** | Mined (0) | **Miner** | Registers the raw stone, its initial carat weight, and location. Assigns the first unique diamondId. |
| **2\. Cutting** | CutAndPolished (1) | **Cutter** | Records the final cut quality and the stone's new, finished carat weight after faceting. |
| **3\. Certification** | Certified (2) | **Certifier** | Records the official grades (Color and Clarity) for the diamond (The 4Cs). |
| **4\. Transfer** | InRetail (3) | **Retailer** | Transfers ownership and custody to a retail location, making it available for sale. |
| **5\. Sale** | Sold (4) | **Retailer** | Records the final sale price and transfers final ownership to the consumer's address. |

### **Access Control**

The contract owner manages all roles via the grantRole(string \_role, address \_addressToGrant) function, ensuring only trusted parties can participate in each stage of the supply chain.
