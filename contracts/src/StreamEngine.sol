// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {StreamManager} from "./StreamManager.sol";

/// @title StreamEngine
/// @notice Thin wrapper around the legacy StreamManager with helpers to link streams to YieldPools
contract StreamEngine is StreamManager {
    /// @dev Tracks YieldPool recipients for quick lookup from off-chain indexers
    mapping(uint256 => address) public yieldPoolForStream;

    event YieldPoolLinked(uint256 indexed streamId, address indexed pool);
    event YieldPoolUnlinked(uint256 indexed streamId, address indexed pool);

    /// @notice Creates a single-token stream toward a YieldPool recipient
    function createPoolStream(address pool, address token, uint256 totalAmount, uint256 duration)
        external
        returns (uint256 streamId)
    {
        require(pool != address(0), "Pool required");
        address[] memory tokens = new address[](1);
        tokens[0] = token;
        uint256[] memory totals = new uint256[](1);
        totals[0] = totalAmount;
        streamId = _createStream(msg.sender, pool, tokens, totals, duration);
        yieldPoolForStream[streamId] = pool;
        emit YieldPoolLinked(streamId, pool);
    }

    /// @notice Creates a multi-token stream directed to a YieldPool
    function createPoolStreamMulti(
        address pool,
        address[] calldata tokens,
        uint256[] calldata totalAmounts,
        uint256 duration
    ) external returns (uint256 streamId) {
        require(pool != address(0), "Pool required");
        streamId = _createStream(msg.sender, pool, tokens, totalAmounts, duration);
        yieldPoolForStream[streamId] = pool;
        emit YieldPoolLinked(streamId, pool);
    }

    /// @notice Allows the current stream recipient (pool) or owner to unlink metadata when the stream is closed
    function unlinkPool(uint256 streamId) external {
        address pool = yieldPoolForStream[streamId];
        require(pool != address(0), "Not linked");
        require(pool == msg.sender || ownerOf(streamId) == msg.sender, "Not authorized");
        delete yieldPoolForStream[streamId];
        emit YieldPoolUnlinked(streamId, pool);
    }
}
