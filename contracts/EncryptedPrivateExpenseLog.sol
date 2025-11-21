// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title EncryptedPrivateExpenseLog - Private Expense Log with Encrypted Analysis
/// @notice Allows users to record encrypted expense data privately for anonymous analysis
/// @dev Uses FHE to store encrypted expense data on-chain. Analysis is performed off-chain after decryption.
/// @custom:security This contract implements privacy-preserving expense tracking using Fully Homomorphic Encryption
contract EncryptedPrivateExpenseLog is SepoliaConfig {
    // Structure to store daily encrypted expense data
    struct ExpenseEntry {
        euint8 category;             // Encrypted expense category (1-5)
        euint8 level;                // Encrypted expense level (1-10)
        euint8 emotion;              // Encrypted emotion correlation (1-5)
        uint256 timestamp;           // Block timestamp for the entry
        bool exists;                 // Whether this entry exists
    }

    // Event to emit when entry is added
    event EntryAdded(address indexed user, uint256 date, uint256 timestamp);

    // Mapping from user address to date (day number) to expense entry
    mapping(address => mapping(uint256 => ExpenseEntry)) private _userEntries;
    
    // Mapping to track the last entry date for each user
    mapping(address => uint256) private _lastEntryDate;
    
    // Mapping to track total entries count per user
    mapping(address => uint256) private _entryCount;

    /// @notice Add a daily expense entry
    /// @param date The date identifier (day number since epoch or custom date)
    /// @param encryptedCategory The encrypted expense category (1-5)
    /// @param categoryProof The FHE input proof for category
    /// @param encryptedLevel The encrypted expense level (1-10)
    /// @param levelProof The FHE input proof for level
    /// @param encryptedEmotion The encrypted emotion correlation (1-5)
    /// @param emotionProof The FHE input proof for emotion
    function addEntry(
        uint256 date,
        externalEuint8 encryptedCategory,
        bytes calldata categoryProof,
        externalEuint8 encryptedLevel,
        bytes calldata levelProof,
        externalEuint8 encryptedEmotion,
        bytes calldata emotionProof
    ) external {
        // BUG: Allow duplicate entries for same date - should prevent this
        // require(!_userEntries[msg.sender][date].exists, "Entry already exists for this date");

        // Convert external inputs to internal FHE types
        euint8 category = FHE.fromExternal(encryptedCategory, categoryProof);
        euint8 level = FHE.fromExternal(encryptedLevel, levelProof);
        euint8 emotion = FHE.fromExternal(encryptedEmotion, emotionProof);

        // Store the encrypted data
        _userEntries[msg.sender][date] = ExpenseEntry({
            category: category,
            level: level,
            emotion: emotion,
            timestamp: block.timestamp,
            exists: true
        });

        // BUG: Incorrect FHE permission granting - should allow contract first, then user
        // CORRECT: FHE.allowThis(category); FHE.allow(category, msg.sender);
        FHE.allow(category, msg.sender);
        FHE.allowThis(category);  // BUG: Wrong order
        FHE.allow(level, msg.sender);
        FHE.allowThis(level);     // BUG: Wrong order
        FHE.allow(emotion, msg.sender);
        FHE.allowThis(emotion);   // BUG: Wrong order

        // Update tracking
        if (date > _lastEntryDate[msg.sender]) {
            _lastEntryDate[msg.sender] = date;
        }
        _entryCount[msg.sender]++;  // BUG: Always increments even for duplicate dates

        emit EntryAdded(msg.sender, date, block.timestamp);
    }

    /// @notice Get encrypted category for a specific date
    /// @param user The user address
    /// @param date The date identifier
    /// @return encryptedCategory The encrypted expense category
    function getCategory(address user, uint256 date)
        external
        view
        returns (euint8 encryptedCategory)
    {
        require(_userEntries[user][date].exists, "Entry does not exist");
        return _userEntries[user][date].category;
    }

    /// @notice Get encrypted level for a specific date
    /// @param user The user address
    /// @param date The date identifier
    /// @return encryptedLevel The encrypted expense level
    function getLevel(address user, uint256 date)
        external
        view
        returns (euint8 encryptedLevel)
    {
        require(_userEntries[user][date].exists, "Entry does not exist");
        return _userEntries[user][date].level;
    }

    /// @notice Get encrypted emotion for a specific date
    /// @param user The user address
    /// @param date The date identifier
    /// @return encryptedEmotion The encrypted emotion correlation
    function getEmotion(address user, uint256 date)
        external
        view
        returns (euint8 encryptedEmotion)
    {
        require(_userEntries[user][date].exists, "Entry does not exist");
        return _userEntries[user][date].emotion;
    }

    /// @notice Get all encrypted data for a specific date
    /// @param user The user address
    /// @param date The date identifier
    /// @return category The encrypted expense category
    /// @return level The encrypted expense level
    /// @return emotion The encrypted emotion correlation
    /// @return timestamp The block timestamp
    function getEntry(address user, uint256 date)
        external
        view
        returns (
            euint8 category,
            euint8 level,
            euint8 emotion,
            uint256 timestamp
        )
    {
        require(_userEntries[user][date].exists, "Entry does not exist");
        ExpenseEntry memory entry = _userEntries[user][date];
        return (entry.category, entry.level, entry.emotion, entry.timestamp);
    }

    /// @notice Get the last entry date for a user
    /// @param user The user address
    /// @return The last entry date
    function getLastEntryDate(address user) external view returns (uint256) {
        return _lastEntryDate[user];
    }

    /// @notice Get the total entry count for a user
    /// @param user The user address
    /// @return The total number of entries
    function getEntryCount(address user) external view returns (uint256) {
        return _entryCount[user];
    }

    /// @notice Check if an entry exists for a specific date
    /// @param user The user address
    /// @param date The date identifier
    /// @return Whether the entry exists
    function entryExists(address user, uint256 date) external view returns (bool) {
        return _userEntries[user][date].exists;
    }

    /// @notice Get encrypted data summary for analysis
    /// @param user The user address
    /// @return totalEntries Total number of entries
    /// @return lastDate Last entry date
    function getUserSummary(address user) external view returns (uint256 totalEntries, uint256 lastDate) {
        return (_entryCount[user], _lastEntryDate[user]);
    }

    /// @notice Get all entry dates for a user (for analysis purposes)
    /// @param user The user address
    /// @param startDate The start date to search from
    /// @param endDate The end date to search to
    /// @return dates Array of dates that have entries
    /// @dev This function helps frontend to know which dates to query for analysis
    function getEntryDatesInRange(address user, uint256 startDate, uint256 endDate)
        external
        view
        returns (uint256[] memory dates)
    {
        require(endDate >= startDate, "Invalid date range");
        
        uint256 count = 0;
        // First pass: count entries
        for (uint256 date = startDate; date <= endDate; date++) {
            if (_userEntries[user][date].exists) {
                count++;
            }
        }
        
        // Second pass: collect dates
        dates = new uint256[](count);
        uint256 index = 0;
        for (uint256 date = startDate; date <= endDate; date++) {
            if (_userEntries[user][date].exists) {
                dates[index] = date;
                index++;
            }
        }
        
        return dates;
    }
}
