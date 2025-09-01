// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FractionalOwnership is ERC20 {
    // -------------------------
    // 1. State Variables
    // -------------------------
    address[] public holders;
    mapping(address => bool) public isHolder;

    mapping(address => uint256) public dividends;
    uint256 public totalDividends;
    uint256 public totalDistributed;

    // -------------------------
    // 2. Constructor
    // -------------------------
    constructor() ERC20("FractionalPropertyToken", "FPT") {
        _mint(msg.sender, 100 * 10 ** decimals()); // Example supply
    }

    // -------------------------
    // 3. Holders Tracking
    // -------------------------
    function _updateHolders(address _account) internal {
        if (!isHolder[_account] && balanceOf(_account) > 0) {
            holders.push(_account);
            isHolder[_account] = true;
        }
    }

    function _update(address from, address to, uint256 amount) internal override {
    super._update(from, to, amount);

    if (to != address(0) && balanceOf(to) > 0) {
        _updateHolders(to);
    }
}

    // -------------------------
    // 4. Dividend Distribution
    // -------------------------
    event DividendsDistributed(address indexed from, uint256 amount);
    event DividendClaimed(address indexed to, uint256 amount);

    function distributeDividends() external payable {
        require(msg.value > 0, "No ETH sent for dividends");

        uint256 supply = totalSupply();
        require(supply > 0, "No tokens minted");

        for (uint i = 0; i < holders.length; i++) {
            address holder = holders[i];
            uint256 holderBalance = balanceOf(holder);
            if (holderBalance > 0) {
                uint256 share = (msg.value * holderBalance) / supply;
                dividends[holder] += share;
            }
        }

        totalDividends += msg.value;
        emit DividendsDistributed(msg.sender, msg.value);
    }

    function claimDividend() external {
        uint256 amount = dividends[msg.sender];
        require(amount > 0, "No dividends to claim");

        dividends[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        totalDistributed += amount;
        emit DividendClaimed(msg.sender, amount);
    }
}
