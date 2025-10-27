// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {StreamVault} from "../src/StreamVault.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract StreamVaultTest is Test {
    StreamVault public vault;
    MockERC20 public token;

    address public owner = address(this);
    address public user1 = address(0x1);

    uint256 public constant INITIAL_SUPPLY = 1000000 * 1e6;

    event Withdrawn(address indexed token, address indexed account, uint256 amount);

    function setUp() public {
        vault = new StreamVault();
        token = new MockERC20("Test Token", "TEST", INITIAL_SUPPLY);
    }

    function testWithdraw() public {
        uint256 withdrawAmount = 1000 * 1e6;

        // Send tokens to vault first
        token.transfer(address(vault), withdrawAmount);

        uint256 userBalanceBefore = token.balanceOf(user1);

        vm.expectEmit(true, true, false, true);
        emit Withdrawn(address(token), user1, withdrawAmount);

        vault.withdraw(address(token), user1, withdrawAmount);

        assertEq(token.balanceOf(user1) - userBalanceBefore, withdrawAmount);
        assertEq(vault.getTokenBalance(address(token)), 0);
    }

    function testWithdrawOnlyOwner() public {
        token.transfer(address(vault), 1000 * 1e6);

        vm.prank(user1);
        vm.expectRevert();
        vault.withdraw(address(token), user1, 500 * 1e6);
    }

    function testGetTokenBalance() public {
        uint256 amount = 5000 * 1e6;
        token.transfer(address(vault), amount);

        assertEq(vault.getTokenBalance(address(token)), amount);
    }
}