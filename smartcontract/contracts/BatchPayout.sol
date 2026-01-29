// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IERC20.sol";

/**
 * @title BatchPayout
 * @notice Contract for batch payouts using USDT0 on Flare Network
 * @dev Integrates with ProofRails for payment verification
 */
contract BatchPayout {
    IERC20 public immutable usdt0;
    address public owner;
    
    // Payout tracking
    struct Payout {
        uint256 payoutId;
        address initiator;
        uint256 totalAmount;
        uint256 recipientCount;
        uint256 timestamp;
        bool completed;
        string proofRailsId; // ProofRails verification ID
    }
    
    // Recipient payment tracking
    struct RecipientPayment {
        address recipient;
        uint256 amount;
        uint256 payoutId;
        bool paid;
        uint256 timestamp;
    }
    
    // Mapping from payout ID to payout details
    mapping(uint256 => Payout) public payouts;
    
    // Mapping from payout ID to recipient payments
    mapping(uint256 => RecipientPayment[]) public payoutRecipients;
    
    // Mapping from recipient address to their payment history
    mapping(address => RecipientPayment[]) public recipientHistory;
    
    // Counter for payout IDs
    uint256 private payoutCounter;
    
    // Events for ProofRails integration
    // These events contain all data needed for ProofRails API call
    // Note: Arrays cannot be emitted directly, so we emit individual PaymentExecuted events
    event PayoutCreated(
        uint256 indexed payoutId,
        address indexed initiator,
        uint256 totalAmount,
        uint256 recipientCount,
        uint256 timestamp,
        string payoutRef
    );
    
    event PaymentExecuted(
        uint256 indexed payoutId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp,
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
    
    modifier onlyOwner() {
        require(msg.sender == owner, "BatchPayout: caller is not the owner");
        _;
    }
    
    /**
     * @dev Constructor
     * @param _usdt0Address Address of the USDT0 token contract on Flare
     */
    constructor(address _usdt0Address) {
        require(_usdt0Address != address(0), "BatchPayout: invalid USDT0 address");
        usdt0 = IERC20(_usdt0Address);
        owner = msg.sender;
        payoutCounter = 1;
    }
    
    /**
     * @dev Execute batch payout to multiple recipients
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to pay (in USDT0 decimals)
     * @param payoutRef Optional reference string for ProofRails (e.g., "payout:123")
     * @return payoutId The ID of the created payout
     * @notice This function emits events that should be listened to by the frontend
     *         The frontend will then call ProofRails API with the transaction hash
     *         and update the proofRailsId using updateProofRailsId()
     */
    function batchPayout(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string calldata payoutRef
    ) external returns (uint256) {
        require(recipients.length > 0, "BatchPayout: no recipients");
        require(recipients.length == amounts.length, "BatchPayout: array length mismatch");
        
        uint256 payoutId = payoutCounter++;
        uint256 totalAmount = 0;
        
        // Calculate total amount and validate
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "BatchPayout: invalid recipient address");
            require(amounts[i] > 0, "BatchPayout: amount must be greater than 0");
            totalAmount += amounts[i];
        }
        
        // Check allowance and balance
        require(
            usdt0.allowance(msg.sender, address(this)) >= totalAmount,
            "BatchPayout: insufficient allowance"
        );
        require(
            usdt0.balanceOf(msg.sender) >= totalAmount,
            "BatchPayout: insufficient balance"
        );
        
        // Create payout record (proofRailsId will be updated after ProofRails API call)
        payouts[payoutId] = Payout({
            payoutId: payoutId,
            initiator: msg.sender,
            totalAmount: totalAmount,
            recipientCount: recipients.length,
            timestamp: block.timestamp,
            completed: false,
            proofRailsId: "" // Will be set after ProofRails API call
        });
        
        // Execute transfers and record payments
        for (uint256 i = 0; i < recipients.length; i++) {
            // Transfer USDT0 from sender to recipient
            require(
                usdt0.transferFrom(msg.sender, recipients[i], amounts[i]),
                "BatchPayout: transfer failed"
            );
            
            // Record recipient payment
            RecipientPayment memory payment = RecipientPayment({
                recipient: recipients[i],
                amount: amounts[i],
                payoutId: payoutId,
                paid: true,
                timestamp: block.timestamp
            });
            
            payoutRecipients[payoutId].push(payment);
            recipientHistory[recipients[i]].push(payment);
            
            // Emit event for ProofRails with payoutRef
            // Frontend will use this to call ProofRails API for each recipient
            string memory paymentRef = string(abi.encodePacked(
                payoutRef,
                ":recipient:",
                _uint2str(i)
            ));
            emit PaymentExecuted(payoutId, recipients[i], amounts[i], block.timestamp, paymentRef);
        }
        
        // Mark payout as completed
        payouts[payoutId].completed = true;
        
        // Emit events with all data needed for ProofRails integration
        // Frontend will listen to these events and call ProofRails API
        // The PaymentExecuted events below contain individual recipient data
        emit PayoutCreated(
            payoutId,
            msg.sender,
            totalAmount,
            recipients.length,
            block.timestamp,
            payoutRef
        );
        
        emit PayoutCompleted(
            payoutId,
            msg.sender,
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
     * @notice This should be called by the frontend/backend after successfully
     *         calling ProofRails API with the transaction hash
     */
    function updateProofRailsId(
        uint256 payoutId,
        string calldata newProofRailsId
    ) external {
        require(payouts[payoutId].payoutId != 0, "BatchPayout: payout does not exist");
        require(bytes(newProofRailsId).length > 0, "BatchPayout: invalid proofRailsId");
        // Allow anyone to update (frontend/backend will call this after ProofRails API)
        // In production, you might want to add access control
        
        string memory oldProofRailsId = payouts[payoutId].proofRailsId;
        payouts[payoutId].proofRailsId = newProofRailsId;
        
        emit ProofRailsIdUpdated(payoutId, oldProofRailsId, newProofRailsId);
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
     * @dev Transfer ownership of the contract
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "BatchPayout: invalid new owner");
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
