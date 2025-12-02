// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice ERC-20 representing a business's tokenized future cash flow
contract RevenueToken is ERC20, Ownable {
    struct Metadata {
        address business;
        address paymentToken;
        uint256 expectedRevenue;
        uint256 tenor;
        uint256 createdAt;
    }

    address public immutable factory;
    address public immutable business;
    address public immutable paymentToken;
    uint256 public immutable expectedRevenue;
    uint256 public immutable tenor;
    uint256 public immutable createdAt;

    address public yieldPool;

    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);
    event YieldPoolSet(address indexed pool);

    modifier onlyFactory() {
        require(msg.sender == factory, "Factory only");
        _;
    }

    modifier onlyPool() {
        require(msg.sender == yieldPool, "Pool only");
        _;
    }

    modifier onlyFactoryOrOwner() {
        require(msg.sender == factory || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(
        address business_,
        string memory name_,
        string memory symbol_,
        uint256 expectedRevenue_,
        uint256 tenor_,
        address paymentToken_
    ) ERC20(name_, symbol_) Ownable(business_) {
        require(business_ != address(0), "Business required");
        require(paymentToken_ != address(0), "Payment token required");
        require(expectedRevenue_ > 0, "Expected revenue required");
        factory = msg.sender;
        business = business_;
        paymentToken = paymentToken_;
        expectedRevenue = expectedRevenue_;
        tenor = tenor_;
        createdAt = block.timestamp;

        _mint(business_, expectedRevenue_);
        emit Minted(business_, expectedRevenue_);
    }

    function setYieldPool(address pool) external onlyFactoryOrOwner {
        require(pool != address(0), "Pool required");
        require(yieldPool == address(0), "Pool set");
        yieldPool = pool;
        emit YieldPoolSet(pool);
    }

    function mint(address to, uint256 amount) external onlyFactory {
        require(amount > 0, "Invalid amount");
        _mint(to, amount);
        emit Minted(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == yieldPool || msg.sender == factory, "Not authorized");
        _burn(from, amount);
        emit Burned(from, amount);
    }

    function metadata() external view returns (Metadata memory data) {
        data = Metadata({
            business: business,
            paymentToken: paymentToken,
            expectedRevenue: expectedRevenue,
            tenor: tenor,
            createdAt: createdAt
        });
    }
}
