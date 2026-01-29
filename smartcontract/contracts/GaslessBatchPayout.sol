// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IERC20.sol";

/**
 * @title GaslessBatchPayout
 * @notice Contract for gasless batch payouts using USDT0 EIP-3009 transferWithAuthorization
 * @dev This contract records batch payouts executed via gasless transfers
 *      The actual transfers are done via USDT0's transferWithAuthorization by a relayer
 */
contract GaslessBatchPayout {
    IERC20 public immutable usdt0;
    address public owner;
    address public relayer; // Authorized relayer address
    
    // Payout tracking
    struct Payout {
        uint256 payoutId;
        address initiator;
        uint256 totalAmount;
        uint256 recipientCount;
        uint256 timestamp;
        bool completed;
        string proofRailsId;
        bytes32[] authorizationNonces; // Track used nonces for this payout
    }
    
    // Recipient payment tracking
    struct RecipientPayment {
        address recipient;
        uint256 amount;
        uint256 payoutId;
        bool paid;
        uint256 timestamp;
        bytes32 nonce; // EIP-3009 nonce used
    }
    
    // Mapping from payout ID to payout details
    mapping(uint256 => Payout) public payouts;
    
    // Mapping from payout ID to recipient payments
    mapping(uint256 => RecipientPayment[]) public payoutRecipients;
    
    // Mapping from recipient address to their payment history
    mapping(address => RecipientPayment[]) public recipientHistory;
    
    // Mapping to track used nonces (from => nonce => used)
    mapping(address => mapping(bytes32 => bool)) public usedNonces;
    
    // Counter for payout IDs
    uint256 private payoutCounter;
    
    // Events for ProofRails integration
    event PayoutCreated(
        uint256 indexed payoutId,
        address indexed initiator,
        uint256 totalAmount,
        uint256 recipientCount,
        uint256 timestamp,
        string payoutRef
    );
    
    event PaymentRecorded(
        uint256 indexed payoutId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp,
        bytes32 nonce,
        string payoutRef
    );
    
    event PayoutCompleted(
        uint256 indexed payoutId,
        address indexed initiator,
        uint256 totalAmount,
        uint256 recipientCount,
        uint256 timestamp,
        string payoutRef
    );
    
    event ProofRailsIdUpdated(
        uint256 indexed payoutId,
        string oldProofRailsId,
        string newProofRailsId
    );
    
    event RelayerUpdated(address oldRelayer, address newRelayer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "GaslessBatchPayout: caller is not the owner");
        _;
    }
    
    modifier onlyRelayer() {
        require(msg.sender == relayer, "GaslessBatchPayout: caller is not the relayer");
        _;
    }
    
    /**
     * @dev Constructor
     * @param _usdt0Address Address of the USDT0 token contract on Flare
     * @param _relayer Address of the relayer that will execute gasless transfers
     */
    constructor(address _usdt0Address, address _relayer) {
        require(_usdt0Address != address(0), "GaslessBatchPayout: invalid USDT0 address");
        require(_relayer != address(0), "GaslessBatchPayout: invalid relayer address");
        usdt0 = IERC20(_usdt0Address);
        relayer = _relayer;
        owner = msg.sender;
        payoutCounter = 1;
    }
    
    /**
     * @dev Record a batch payout after gasless transfers have been executed
     * @param initiator The address that authorized the transfers
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts paid
     * @param nonces Array of nonces used for each transfer
     * @param payoutRef Reference string for ProofRails
     * @return payoutId The ID of the created payout record
     * @notice This is called by the relayer after executing transferWithAuthorization
     */
    function recordBatchPayout(
        address initiator,
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes32[] calldata nonces,
        string calldata payoutRef
    ) external onlyRelayer returns (uint256) {
        require(recipients.length > 0, "GaslessBatchPayout: no recipients");
        require(recipients.length == amounts.length, "GaslessBatchPayout: array length mismatch");
        require(recipients.length == nonces.length, "GaslessBatchPayout: nonces length mismatch");
        
        uint256 payoutId = payoutCounter++;
        uint256 totalAmount = 0;
        bytes32[] memory authorizationNonces = new bytes32[](nonces.length);
        
        // Calculate total and validate nonces
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "GaslessBatchPayout: invalid recipient address");
            require(amounts[i] > 0, "GaslessBatchPayout: amount must be greater than 0");
            require(!usedNonces[initiator][nonces[i]], "GaslessBatchPayout: nonce already used");
            
            totalAmount += amounts[i];
            usedNonces[initiator][nonces[i]] = true;
            authorizationNonces[i] = nonces[i];
        }
        
        // Create payout record
        payouts[payoutId] = Payout({
            payoutId: payoutId,
            initiator: initiator,
            totalAmount: totalAmount,
            recipientCount: recipients.length,
            timestamp: block.timestamp,
            completed: true,
            proofRailsId: "",
            authorizationNonces: authorizationNonces
        });
        
        // Record recipient payments
        for (uint256 i = 0; i < recipients.length; i++) {
            RecipientPayment memory payment = RecipientPayment({
                recipient: recipients[i],
                amount: amounts[i],
                payoutId: payoutId,
                paid: true,
                timestamp: block.timestamp,
                nonce: nonces[i]
            });
            
            payoutRecipients[payoutId].push(payment);
            recipientHistory[recipients[i]].push(payment);
            
            // Emit event for ProofRails
            string memory paymentRef = string(abi.encodePacked(
                payoutRef,
                ":recipient:",
                _uint2str(i)
            ));
            emit PaymentRecorded(payoutId, recipients[i], amounts[i], block.timestamp, nonces[i], paymentRef);
        }
        
        // Emit events
        emit PayoutCreated(
            payoutId,
            initiator,
            totalAmount,
            recipients.length,
            block.timestamp,
            payoutRef
        );
        
        emit PayoutCompleted(
            payoutId,
            initiator,
            totalAmount,
            recipients.length,
            block.timestamp,
            payoutRef
        );
        
        return payoutId;
    }
    
    /**
     * @dev Update ProofRails ID for a payout
     * @param payoutId The payout ID to update
     * @param newProofRailsId The ProofRails receipt ID returned from API
     */
    function updateProofRailsId(
        uint256 payoutId,
        string calldata newProofRailsId
    ) external {
        require(payouts[payoutId].payoutId != 0, "GaslessBatchPayout: payout does not exist");
        require(bytes(newProofRailsId).length > 0, "GaslessBatchPayout: invalid proofRailsId");
        
        string memory oldProofRailsId = payouts[payoutId].proofRailsId;
        payouts[payoutId].proofRailsId = newProofRailsId;
        
        emit ProofRailsIdUpdated(payoutId, oldProofRailsId, newProofRailsId);
    }
    
    /**
     * @dev Update the relayer address
     * @param newRelayer The new relayer address
     */
    function setRelayer(address newRelayer) external onlyOwner {
        require(newRelayer != address(0), "GaslessBatchPayout: invalid relayer address");
        address oldRelayer = relayer;
        relayer = newRelayer;
        emit RelayerUpdated(oldRelayer, newRelayer);
    }
    
    /**
     * @dev Get payout details
     * @param payoutId The payout ID
     * @return payout The payout details
     */
    function getPayout(uint256 payoutId) external view returns (Payout memory) {
        return payouts[payoutId];
    }
    
    /**
     * @dev Get all recipients for a payout
     * @param payoutId The payout ID
     * @return recipients Array of recipient payments
     */
    function getPayoutRecipients(uint256 payoutId) external view returns (RecipientPayment[] memory) {
        return payoutRecipients[payoutId];
    }
    
    /**
     * @dev Get payment history for a recipient
     * @param recipient The recipient address
     * @return payments Array of recipient payments
     */
    function getRecipientHistory(address recipient) external view returns (RecipientPayment[] memory) {
        return recipientHistory[recipient];
    }
    
    /**
     * @dev Get total number of payouts
     * @return count Total payout count
     */
    function getPayoutCount() external view returns (uint256) {
        return payoutCounter - 1;
    }
    
    /**
     * @dev Check if a nonce has been used
     * @param from The address that authorized the transfer
     * @param nonce The nonce to check
     * @return used Whether the nonce has been used
     */
    function isNonceUsed(address from, bytes32 nonce) external view returns (bool) {
        return usedNonces[from][nonce];
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "GaslessBatchPayout: invalid new owner");
        owner = newOwner;
    }
    
    /**
     * @dev Internal function to convert uint to string
     * @param _i The uint to convert
     * @return _uintAsString The string representation
     */
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
