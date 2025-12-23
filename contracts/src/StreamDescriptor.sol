// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {StreamManager} from "./StreamManager.sol";

/**
 * @title StreamDescriptor
 * @notice Generates on-chain SVG and JSON metadata for StreamPay Stream Receipts.
 */
contract StreamDescriptor {
    using Strings for uint256;

    function tokenURI(StreamManager manager, uint256 tokenId) external view returns (string memory) {
        (StreamManager.Stream memory stream, StreamManager.StreamToken[] memory tokens) = manager.getStream(tokenId);
        
        string memory name = string(abi.encodePacked("Stream Receipt #", tokenId.toString()));
        string memory description = "A RealFi stream receipt from StreamPay. This NFT represents a claim on future cash flows.";
        
        string memory image = generateSVG(tokenId, stream, tokens);
        
        string memory attributes = _generateAttributes(stream, tokens);

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"', name, 
                            '", "description":"', description, 
                            '", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(image)),
                            '", "attributes":', attributes, "}"
                        )
                    )
                )
            )
        );
    }

    function generateSVG(uint256 tokenId, StreamManager.Stream memory stream, StreamManager.StreamToken[] memory tokens) public pure returns (string memory) {
        string memory statusColor = stream.isActive ? (stream.isPaused ? "#facc15" : "#22c55e") : "#ef4444";
        string memory statusText = stream.isActive ? (stream.isPaused ? "PAUSED" : "ACTIVE") : "INACTIVE";
        
        return string(
            abi.encodePacked(
                '<svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">',
                '<rect width="400" height="600" fill="#0f172a" rx="20"/>',
                '<rect x="20" y="20" width="360" height="560" fill="none" stroke="#334155" stroke-width="1" rx="15"/>',
                '<text x="40" y="60" fill="#94a3b8" font-family="Arial" font-size="12" font-weight="bold">STREAMPAY RECEIPT</text>',
                '<text x="40" y="90" fill="white" font-family="Arial" font-size="24" font-weight="bold">#', tokenId.toString(), '</text>',
                '<rect x="300" y="45" width="60" height="20" fill="', statusColor, '" rx="10"/>',
                '<text x="330" y="59" fill="black" font-family="Arial" font-size="10" font-weight="bold" text-anchor="middle">', statusText, '</text>',
                _svgTokens(tokens),
                '<text x="40" y="540" fill="#64748b" font-family="Arial" font-size="10">MANTLE NETWORK</text>',
                '</svg>'
            )
        );
    }

    function _svgTokens(StreamManager.StreamToken[] memory tokens) internal pure returns (string memory svg) {
        for (uint256 i = 0; i < tokens.length && i < 3; i++) {
            uint256 y = 140 + (i * 60);
            svg = string(abi.encodePacked(
                svg,
                '<text x="40" y="', y.toString(), '" fill="#94a3b8" font-family="Arial" font-size="12">TOKEN</text>',
                '<text x="40" y="', (y + 25).toString(), '" fill="white" font-family="Arial" font-size="18" font-weight="bold">', 
                Strings.toHexString(uint160(tokens[i].token), 20), '</text>'
            ));
        }
    }

    function _generateAttributes(StreamManager.Stream memory stream, StreamManager.StreamToken[] memory tokens) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '[',
            '{"trait_type": "Status", "value": "', stream.isActive ? (stream.isPaused ? "Paused" : "Active") : "Inactive", '"},',
            '{"trait_type": "Tokens", "value": "', uint256(tokens.length).toString(), '"}',
            ']'
        ));
    }
}
