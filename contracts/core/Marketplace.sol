// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PropertyRegistry} from "./PropertyRegistry.sol";
import {FractionalToken} from "../tokens/FractionalToken.sol";

contract Marketplace is Ownable, ReentrancyGuard {
    PropertyRegistry public immutable registry;

    struct Listing {
        // secondary-market listing per seller per property
        uint256 propertyId;
        address seller;
        uint256 amount; // shares
        uint256 pricePerShareWei; // secondary price
        bool active;
    }

    // propertyId => dividend pool in wei (undistributed)
    mapping(uint256 => uint256) public dividendPools;
    // propertyId => account => amount claimed so far (per-epoch simple accounting)
    mapping(uint256 => mapping(address => uint256)) public claimedDividends;

    // Simplified listing book
    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;

    event SharesPurchased(uint256 indexed propertyId, address indexed buyer, uint256 amount, uint256 pricePerShareWei);
    event SharesSold(uint256 indexed propertyId, address indexed seller, uint256 amount, uint256 pricePerShareWei, uint256 listingId);
    event ListingCreated(uint256 indexed listingId, uint256 indexed propertyId, address indexed seller, uint256 amount, uint256 pricePerShareWei);
    event ListingFilled(uint256 indexed listingId, address indexed buyer, uint256 amount);
    event ListingCancelled(uint256 indexed listingId);
    event DividendsDeposited(uint256 indexed propertyId, uint256 amount);
    event DividendClaimed(uint256 indexed propertyId, address indexed account, uint256 amount);
    event PropertyCreated(uint256 indexed propertyId, address token, uint256 totalShares, uint256 sharePriceWei, address owner, string metadataURI);

    constructor(address initialOwner, PropertyRegistry _registry) Ownable(initialOwner) {
        registry = _registry;
    }

    // Create property and fractional token, mint all to propertyOwner
    function createProperty(
        string memory name_,
        string memory symbol_,
        string memory metadataURI,
        uint256 totalShares,
        uint256 sharePriceWei,
        address propertyOwner
    ) external onlyOwner returns (uint256 propertyId, address token) {
        require(totalShares > 0, "INVALID_SHARES");
        require(propertyOwner != address(0), "INVALID_OWNER");

        // Deploy a new ERC20 token for this property
        FractionalToken ft = new FractionalToken(name_, symbol_, address(this));

    // Mint all shares to propertyOwner initially
        ft.mint(propertyOwner, totalShares);
    // Register property (Marketplace must be the owner of registry)
    propertyId = registry.createProperty(metadataURI, address(ft), totalShares, sharePriceWei, propertyOwner);
    emit PropertyCreated(propertyId, address(ft), totalShares, sharePriceWei, propertyOwner, metadataURI);
    return (propertyId, address(ft));
    }

    // Primary sale: buy from propertyOwner if they approved/transfer - simplified: directly receive ETH by propertyOwner off-chain
    function buyShares(uint256 propertyId, address token, uint256 amount, uint256 pricePerShareWei) external payable nonReentrant {
        require(amount > 0, "INVALID_AMOUNT");
        require(msg.value == amount * pricePerShareWei, "INVALID_ETH");
        FractionalToken ft = FractionalToken(token);
        // transferFrom propertyOwner to buyer must be approved by owner beforehand; for demo, we mint to buyer against payment to owner
        ft.mint(msg.sender, amount);
        emit SharesPurchased(propertyId, msg.sender, amount, pricePerShareWei);
    }

    // Secondary-market listing
    function createListing(address token, uint256 propertyId, uint256 amount, uint256 pricePerShareWei) external nonReentrant returns (uint256 listingId) {
        require(amount > 0, "INVALID_AMOUNT");
        FractionalToken ft = FractionalToken(token);
        require(ft.balanceOf(msg.sender) >= amount, "INSUFFICIENT");
        // escrow by burning from seller and re-minting to buyer on fill (simplified to avoid approvals)
        ft.burn(msg.sender, amount);
        listingId = ++nextListingId;
        listings[listingId] = Listing({ propertyId: propertyId, seller: msg.sender, amount: amount, pricePerShareWei: pricePerShareWei, active: true });
        emit ListingCreated(listingId, propertyId, msg.sender, amount, pricePerShareWei);
    }

    function cancelListing(address token, uint256 listingId) external nonReentrant {
        Listing storage l = listings[listingId];
        require(l.active, "NOT_ACTIVE");
        require(l.seller == msg.sender, "NOT_SELLER");
        l.active = false;
        // return escrow
        FractionalToken(token).mint(msg.sender, l.amount);
        emit ListingCancelled(listingId);
    }

    function fillListing(address token, uint256 listingId, uint256 amount) external payable nonReentrant {
        Listing storage l = listings[listingId];
        require(l.active, "NOT_ACTIVE");
        require(amount > 0 && amount <= l.amount, "INVALID_AMOUNT");
        require(msg.value == amount * l.pricePerShareWei, "INVALID_ETH");
        l.amount -= amount;
        // pay seller
        (bool ok, ) = l.seller.call{value: msg.value}("");
        require(ok, "PAY_FAIL");
        // deliver shares by minting to buyer (since escrow burned on list)
        FractionalToken(token).mint(msg.sender, amount);
        emit ListingFilled(listingId, msg.sender, amount);
        if (l.amount == 0) {
            l.active = false;
        }
        emit SharesSold(l.propertyId, l.seller, amount, l.pricePerShareWei, listingId);
    }

    // Dividends
    function depositDividends(uint256 propertyId) external payable onlyOwner {
        require(msg.value > 0, "NO_VALUE");
        dividendPools[propertyId] += msg.value;
        emit DividendsDeposited(propertyId, msg.value);
    }

    function claimDividends(address token, uint256 propertyId) external nonReentrant {
        FractionalToken ft = FractionalToken(token);
        uint256 supply = ft.totalSupply();
        require(supply > 0, "NO_SUPPLY");
        uint256 pool = dividendPools[propertyId];
        require(pool > 0, "NO_POOL");
        // naive pro-rata on current holdings (stateless); in real impl, use snapshot/checkpointing
        uint256 bal = ft.balanceOf(msg.sender);
        require(bal > 0, "NO_HOLDINGS");
        uint256 payout = (pool * bal) / supply;
        // reduce pool
        dividendPools[propertyId] -= payout;
        (bool ok, ) = msg.sender.call{value: payout}("");
        require(ok, "PAYOUT_FAIL");
        emit DividendClaimed(propertyId, msg.sender, payout);
    }
}
