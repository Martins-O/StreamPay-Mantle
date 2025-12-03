// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {RevenueToken} from "./RevenueToken.sol";

contract RevenueTokenFactory is Ownable {
    struct CreateRevenueTokenParams {
        string name;
        string symbol;
        uint256 expectedRevenue;
        uint256 tenor;
        address paymentToken;
    }

    mapping(address => address[]) private _businessTokens;
    mapping(address => bool) public approvedBusinesses;
    address[] public deployedTokens;
    bool public allowPublicCreation = true;

    event BusinessApprovalUpdated(address indexed business, bool approved);
    event RevenueTokenCreated(
        address indexed business, address indexed token, uint256 expectedRevenue, uint256 tenor, address paymentToken
    );

    constructor() Ownable(msg.sender) {}

    function setBusinessApproval(address business, bool approved) external onlyOwner {
        approvedBusinesses[business] = approved;
        emit BusinessApprovalUpdated(business, approved);
    }

    function setAllowPublicCreation(bool status) external onlyOwner {
        allowPublicCreation = status;
    }

    function createRevenueToken(CreateRevenueTokenParams calldata params) external returns (address tokenAddr) {
        require(bytes(params.name).length > 0, "Name required");
        require(bytes(params.symbol).length > 0, "Symbol required");
        require(params.expectedRevenue > 0, "Revenue required");
        require(params.paymentToken != address(0), "Payment token required");

        if (!allowPublicCreation) {
            require(approvedBusinesses[msg.sender], "Business not approved");
        }

        RevenueToken token = new RevenueToken(
            msg.sender, params.name, params.symbol, params.expectedRevenue, params.tenor, params.paymentToken
        );
        tokenAddr = address(token);
        _businessTokens[msg.sender].push(tokenAddr);
        deployedTokens.push(tokenAddr);

        emit RevenueTokenCreated(msg.sender, tokenAddr, params.expectedRevenue, params.tenor, params.paymentToken);
    }

    function getBusinessTokens(address business) external view returns (address[] memory) {
        return _businessTokens[business];
    }

    function totalTokens() external view returns (uint256) {
        return deployedTokens.length;
    }
}
