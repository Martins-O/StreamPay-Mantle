// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice ERC-20 share token minted and burned exclusively by a YieldPool
contract YieldBackedToken is ERC20 {
    address public immutable pool;

    modifier onlyPool() {
        require(msg.sender == pool, "Pool only");
        _;
    }

    constructor(string memory name_, string memory symbol_, address pool_) ERC20(name_, symbol_) {
        require(pool_ != address(0), "Pool required");
        pool = pool_;
    }

    function mint(address to, uint256 amount) external onlyPool {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyPool {
        _burn(from, amount);
    }
}
