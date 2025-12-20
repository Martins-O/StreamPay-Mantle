// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract RiskOracleAdapter is Ownable {
    struct RiskData {
        uint8 score;
        uint8 band;
        uint256 lastUpdated;
    }

    struct RiskPayload {
        address subject;
        uint8 score;
        uint8 band;
        uint256 timestamp;
        uint256 expiry;
        bytes32 nonce;
    }

    bytes32 public constant RISK_TYPEHASH =
        keccak256("RiskPayload(address subject,uint8 score,uint8 band,uint256 timestamp,uint256 expiry,bytes32 nonce)");

    bytes32 public constant EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 public constant NAME_HASH = keccak256("StreamYieldRisk");
    bytes32 public constant VERSION_HASH = keccak256("1");

    address public riskSigner;
    bytes32 public immutable DOMAIN_SEPARATOR;
    mapping(address => RiskData) private _riskData;
    mapping(bytes32 => bool) public consumedNonces;

    event RiskSignerUpdated(address indexed newSigner);
    event RiskScoreUpdated(address indexed subject, uint8 score, uint8 band, uint256 timestamp);

    constructor(address signer) Ownable(msg.sender) {
        require(signer != address(0), "Signer required");
        riskSigner = signer;
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(EIP712_DOMAIN_TYPEHASH, NAME_HASH, VERSION_HASH, block.chainid, address(this))
        );
        emit RiskSignerUpdated(signer);
    }

    function updateRiskSigner(address signer) external onlyOwner {
        require(signer != address(0), "Signer required");
        riskSigner = signer;
        emit RiskSignerUpdated(signer);
    }

    function hashPayload(RiskPayload memory payload) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                RISK_TYPEHASH,
                payload.subject,
                payload.score,
                payload.band,
                payload.timestamp,
                payload.expiry,
                payload.nonce
            )
        );
    }

    function updateRiskScore(RiskPayload calldata payload, bytes calldata signature) external {
        require(payload.subject != address(0), "Subject required");
        require(payload.timestamp <= block.timestamp, "Future payload");
        if (payload.expiry != 0) {
            require(payload.expiry >= block.timestamp, "Payload expired");
        }
        require(!consumedNonces[payload.nonce], "Nonce used");

        bytes32 digest = hashTypedData(payload);
        address recovered = ECDSA.recover(digest, signature);
        require(recovered == riskSigner, "Invalid signer");

        consumedNonces[payload.nonce] = true;
        _riskData[payload.subject] = RiskData({score: payload.score, band: payload.band, lastUpdated: block.timestamp});

        emit RiskScoreUpdated(payload.subject, payload.score, payload.band, block.timestamp);
    }

    function getRiskData(address subject) external view returns (RiskData memory data) {
        data = _riskData[subject];
        if (data.lastUpdated == 0) {
            data.band = 2; // default to highest risk band if unknown
        }
    }

    function hashTypedData(RiskPayload memory payload) public view returns (bytes32) {
        return MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, hashPayload(payload));
    }
}
