// this is me VS Tiwari

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


// simpleContractModule#simpleContract - 0x44D22576fC255E9076e35b91cd86a9fD5B70916b
// DiamondSupplyChainModule#DiamondSupplyChain - 0x5A2c197D4C304370dbec65Ac5C3204C6D75b91a0

/**
 *  DiamondSupplyChain
 *  A smart contract to track a diamond through its supply chain stages,
 * from mining to final sale, ensuring transparency and provenance.
 *
 * NOTE: For a production application, you would typically use external libraries
 * like OpenZeppelin's AccessControl for robust role management.
 * Here, we implement a simplified, self-contained role system.
 */
contract DiamondSupplyChain {

    // --- Data Structures & Types ---

    // Define the stages a diamond goes through in the supply chain
    enum DiamondStatus {
        Mined,              // 0: Raw stone has been extracted
        CutAndPolished,     // 1: Stone has been faceted and polished
        Certified,          // 2: Gem has been graded (4Cs)
        InRetail,           // 3: Gem is at a retailer, ready for sale
        Sold                // 4: Gem has been purchased by the consumer
    }

    // Structure to record a stage update event
    struct StageUpdate {
        DiamondStatus status;
        address updater;
        string location; // Where the action took place
        uint256 timestamp;
        string notes;
    }

    // Structure to hold all data for a single diamond
    struct Diamond {
        uint256 id;
        address currentOwner;
        DiamondStatus status;
        uint256 caratWeight;
        string color;
        string clarity;
        string cut;
        StageUpdate[] history;
    }

    // --- State Variables ---

    // Mapping from a unique ID to the Diamond structure
    mapping(uint256 => Diamond) public diamonds;
    // Counter for the next available diamond ID (starts at 1)
    uint256 private nextDiamondId = 1;

    // --- Access Control Roles ---
    // Roles define who is authorized to perform certain actions

    mapping(address => bool) public isMiner;
    mapping(address => bool) public isCutter;
    mapping(address => bool) public isCertifier;
    mapping(address => bool) public isRetailer;
    address public contractOwner; // Used for role management

    // --- Events for Transparency ---

    // Logs the creation of a new diamond after mining
    event DiamondMined(uint256 indexed diamondId, address indexed miner, string location, uint256 caratWeight);

    // Logs the transition between any two stages
    event StatusUpdated(uint256 indexed diamondId, DiamondStatus fromStatus, DiamondStatus toStatus, address indexed actor);

    // Logs the final sale of the diamond
    event DiamondSold(uint256 indexed diamondId, address indexed buyer, uint256 salePrice);

    // --- Modifiers for Access Control ---

    constructor() {
        // The address that deploys the contract is the initial administrator
        contractOwner = msg.sender;
    }

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Only the contract owner can call this function.");
        _;
    }

    modifier onlyMiner() {
        require(isMiner[msg.sender], "Caller is not an authorized Miner.");
        _;
    }

    modifier onlyCutter() {
        require(isCutter[msg.sender], "Caller is not an authorized Cutter.");
        _;
    }

    modifier onlyCertifier() {
        require(isCertifier[msg.sender], "Caller is not an authorized Certifier.");
        _;
    }

    modifier onlyRetailer() {
        require(isRetailer[msg.sender], "Caller is not an authorized Retailer.");
        _;
    }

    // --- Role Management Functions (Admin Only) ---

    /**
     * Adds a new address to an authorized role.
     *  The role to grant (e.g., "MINER", "CUTTER").
     *  The address to grant the role to.
     */
    function grantRole(string memory _role, address _addressToGrant) public onlyContractOwner {
        if (keccak256(abi.encodePacked(_role)) == keccak256(abi.encodePacked("MINER"))) {
            isMiner[_addressToGrant] = true;
        } else if (keccak256(abi.encodePacked(_role)) == keccak256(abi.encodePacked("CUTTER"))) {
            isCutter[_addressToGrant] = true;
        } else if (keccak256(abi.encodePacked(_role)) == keccak256(abi.encodePacked("CERTIFIER"))) {
            isCertifier[_addressToGrant] = true;
        } else if (keccak256(abi.encodePacked(_role)) == keccak256(abi.encodePacked("RETAILER"))) {
            isRetailer[_addressToGrant] = true;
        } else {
            revert("Invalid role specified.");
        }
    }

    // --- Supply Chain Functions ---

    /**
     *  Stage 1: Creates a new diamond entry when it is mined.
     *  Raw weight of the stone in carats.
     *  City/Country of mining.
     */
    function mineDiamond(uint256 _carat, string memory _location) public onlyMiner returns (uint256) {
        uint256 newId = nextDiamondId;

        // Initialize the first history entry
        StageUpdate memory initialUpdate = StageUpdate({
            status: DiamondStatus.Mined,
            updater: msg.sender,
            location: _location,
            timestamp: block.timestamp,
            notes: "Raw stone mined and registered."
        });

        diamonds[newId] = Diamond({
            id: newId,
            currentOwner: msg.sender,
            status: DiamondStatus.Mined,
            caratWeight: _carat,
            color: "", // Not set yet
            clarity: "", // Not set yet
            cut: "", // Not set yet
            history: new StageUpdate[](0)
        });

        diamonds[newId].history.push(initialUpdate);
        emit DiamondMined(newId, msg.sender, _location, _carat);

        nextDiamondId++;
        return newId;
    }

    /**
     * @dev Stage 2: Transforms the raw diamond into a polished gem.
     * @param _diamondId The ID of the diamond to update.
     * @param _finishedCarat The finished weight after cutting.
     * @param _cutQuality Description of the cut (e.g., "Excellent", "Ideal").
     * @param _location Workshop location.
     */
    function cutAndPolish(uint256 _diamondId, uint256 _finishedCarat, string memory _cutQuality, string memory _location) public onlyCutter {
        Diamond storage diamond = diamonds[_diamondId];
        require(diamond.status == DiamondStatus.Mined, "Diamond must be in Mined status to be cut.");
        require(_finishedCarat > 0 && _finishedCarat <= diamond.caratWeight, "Finished weight must be valid.");

        emit StatusUpdated(_diamondId, diamond.status, DiamondStatus.CutAndPolished, msg.sender);

        diamond.caratWeight = _finishedCarat;
        diamond.cut = _cutQuality;
        diamond.status = DiamondStatus.CutAndPolished;
        diamond.currentOwner = msg.sender;

        diamond.history.push(StageUpdate({
            status: DiamondStatus.CutAndPolished,
            updater: msg.sender,
            location: _location,
            timestamp: block.timestamp,
            notes: "Stone cut, polished, and new weight/cut quality recorded."
        }));
    }

    /**
     *  Stage 3: A certified gemologist grades the diamond (4Cs).
     *  _diamondId The ID of the diamond.
     *  _color Color grade (e.g., "D", "G", "J").
     *  _clarity Clarity grade (e.g., "FL", "VS1", "SI2").
     * _reportNotes Optional notes about the certification.
     */
    function certifyDiamond(uint256 _diamondId, string memory _color, string memory _clarity, string memory _reportNotes) public onlyCertifier {
        Diamond storage diamond = diamonds[_diamondId];
        require(diamond.status == DiamondStatus.CutAndPolished, "Diamond must be Cut and Polished to be certified.");

        emit StatusUpdated(_diamondId, diamond.status, DiamondStatus.Certified, msg.sender);

        diamond.color = _color;
        diamond.clarity = _clarity;
        diamond.status = DiamondStatus.Certified;
        diamond.currentOwner = msg.sender;

        diamond.history.push(StageUpdate({
            status: DiamondStatus.Certified,
            updater: msg.sender,
            location: "GIA/IGI/AGS Lab", // Example location
            timestamp: block.timestamp,
            notes: string(abi.encodePacked("Certified with grades: Color ", _color, ", Clarity ", _clarity, ". Notes: ", _reportNotes))
        }));
    }

    /**
     *  Stage 4: The certified diamond is transferred to a retail store.
     *  _diamondId The ID of the diamond.
     *  _location Retail store address or name.
     */
    function moveToRetail(uint256 _diamondId, string memory _location) public onlyRetailer {
        Diamond storage diamond = diamonds[_diamondId];
        require(diamond.status == DiamondStatus.Certified, "Diamond must be Certified before moving to retail.");

        emit StatusUpdated(_diamondId, diamond.status, DiamondStatus.InRetail, msg.sender);

        diamond.status = DiamondStatus.InRetail;
        diamond.currentOwner = msg.sender;

        diamond.history.push(StageUpdate({
            status: DiamondStatus.InRetail,
            updater: msg.sender,
            location: _location,
            timestamp: block.timestamp,
            notes: "Transferred to retail inventory."
        }));
    }

    /**
     * Stage 5: The final sale to a consumer.
     *  _diamondId The ID of the diamond.
     *  _buyer The address of the final consumer.
     * salePrice The final sale price in a base currency (e.g., wei, USD converted).
     */
    function recordSale(uint256 _diamondId, address _buyer, uint256 _salePrice) public onlyRetailer {
        Diamond storage diamond = diamonds[_diamondId];
        require(diamond.status == DiamondStatus.InRetail, "Diamond must be In Retail status to be sold.");

        emit StatusUpdated(_diamondId, diamond.status, DiamondStatus.Sold, msg.sender);
        emit DiamondSold(_diamondId, _buyer, _salePrice);

        diamond.status = DiamondStatus.Sold;
        diamond.currentOwner = _buyer;

        diamond.history.push(StageUpdate({
            status: DiamondStatus.Sold,
            updater: msg.sender,
            location: "Final Sale",
            timestamp: block.timestamp,
            notes: string(abi.encodePacked("Sold to consumer at price: ", Strings.toString(_salePrice), " units."))
        }));
    }
}

// --- Utility Functions ---

/**
 * @dev Simple helper function to convert uint256 to string.
 * In a real project, use OpenZeppelin's Strings library.
 */
library Strings {
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}