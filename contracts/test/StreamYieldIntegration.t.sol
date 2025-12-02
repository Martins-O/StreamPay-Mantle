// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {RevenueTokenFactory} from "../src/RevenueTokenFactory.sol";
import {RevenueToken} from "../src/RevenueToken.sol";
import {YieldPool} from "../src/YieldPool.sol";
import {RiskOracleAdapter} from "../src/RiskOracleAdapter.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract StreamYieldIntegrationTest is Test {
    uint256 private constant SIGNER_PK = 0xA11CE;

    MockERC20 public usdc;
    RevenueTokenFactory public factory;
    RiskOracleAdapter public riskOracle;
    YieldPool public pool;

    address public business = address(0xBEEF);
    address public investor = address(0xCAFE);
    address public riskSigner;

    function setUp() public {
        riskSigner = vm.addr(SIGNER_PK);
        usdc = new MockERC20("Mock USDC", "mUSDC", 0);
        factory = new RevenueTokenFactory();
        riskOracle = new RiskOracleAdapter(riskSigner);

        usdc.mint(investor, 2_000_000 * 1e6);
        usdc.mint(business, 500_000 * 1e6);
    }

    function testRevenueTokenFactoryAndPoolFlow() public {
        RevenueToken revenueToken = _deployRevenueToken(1_000_000 * 1e6);

        pool = new YieldPool(address(usdc), address(riskOracle), "StreamYield USDC", "syUSDC");
        pool.configureRevenueToken(address(revenueToken));
        vm.prank(business);
        revenueToken.setYieldPool(address(pool));
        pool.setRevenueSource(business);

        _pushRiskScore(address(revenueToken), 82, 1);

        uint256 depositAmount = 200_000 * 1e6;
        vm.startPrank(investor);
        usdc.approve(address(pool), depositAmount);
        pool.deposit(depositAmount);
        vm.stopPrank();
        assertEq(pool.totalAssets(), depositAmount);
        assertEq(pool.availableCapacity(), (revenueToken.expectedRevenue() * 9_000) / 10_000 - depositAmount);

        uint256 investorBalanceBefore = usdc.balanceOf(investor);
        uint256 revenue = 40_000 * 1e6;
        vm.startPrank(business);
        usdc.transfer(address(pool), revenue);
        pool.onRevenueReceived(revenue);
        vm.stopPrank();

        vm.startPrank(investor);
        pool.withdraw(depositAmount / 2);
        vm.stopPrank();
        uint256 investorBalanceAfter = usdc.balanceOf(investor);
        assertGt(investorBalanceAfter - investorBalanceBefore, depositAmount / 2);
    }

    function testDepositRevertsWhenCapacityExceeded() public {
        RevenueToken revenueToken = _deployRevenueToken(50_000 * 1e6);
        YieldPool tightPool = new YieldPool(address(usdc), address(riskOracle), "Tight", "tightYBT");
        tightPool.configureRevenueToken(address(revenueToken));
        vm.prank(business);
        revenueToken.setYieldPool(address(tightPool));
        tightPool.setRevenueSource(business);

        _pushRiskScore(address(revenueToken), 35, 2);

        uint256 capacity = tightPool.availableCapacity();
        assertEq(capacity, (revenueToken.expectedRevenue() * 6_000) / 10_000);

        vm.startPrank(investor);
        usdc.approve(address(tightPool), capacity + 1);
        vm.expectRevert("Capacity reached");
        tightPool.deposit(capacity + 1);
        vm.stopPrank();
    }

    function testRiskOracleRejectsBadSigners() public {
        RevenueToken revenueToken = _deployRevenueToken(10_000 * 1e6);
        RiskOracleAdapter.RiskPayload memory payload = RiskOracleAdapter.RiskPayload({
            subject: address(revenueToken),
            score: 50,
            band: 1,
            timestamp: block.timestamp,
            expiry: block.timestamp + 1 days,
            nonce: keccak256("nonce")
        });

        bytes32 digest = MessageHashUtils.toEthSignedMessageHash(riskOracle.hashPayload(payload));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(0xBEEF, digest);
        bytes memory signature = abi.encodePacked(r, s, v);
        vm.expectRevert("Invalid signer");
        riskOracle.updateRiskScore(payload, signature);
    }

    function _deployRevenueToken(uint256 expectedRevenue) internal returns (RevenueToken token) {
        RevenueTokenFactory.CreateRevenueTokenParams memory params = RevenueTokenFactory.CreateRevenueTokenParams({
            name: "Acme Revenue",
            symbol: "aREV",
            expectedRevenue: expectedRevenue,
            tenor: 90 days,
            paymentToken: address(usdc)
        });

        vm.prank(business);
        address tokenAddr = factory.createRevenueToken(params);
        token = RevenueToken(tokenAddr);
        assertEq(token.business(), business);
        assertEq(token.expectedRevenue(), expectedRevenue);
    }

    function _pushRiskScore(address subject, uint8 score, uint8 band) internal {
        RiskOracleAdapter.RiskPayload memory payload = RiskOracleAdapter.RiskPayload({
            subject: subject,
            score: score,
            band: band,
            timestamp: block.timestamp,
            expiry: block.timestamp + 1 days,
            nonce: keccak256(abi.encodePacked(subject, score, block.timestamp))
        });

        bytes32 digest = MessageHashUtils.toEthSignedMessageHash(riskOracle.hashPayload(payload));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(SIGNER_PK, digest);
        bytes memory signature = abi.encodePacked(r, s, v);
        riskOracle.updateRiskScore(payload, signature);
    }
}
