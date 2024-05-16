// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface IFlocToken {
    function mint(address to, uint256 amount) external;
}

contract FlocLoyaltyToken is ERC20, Pausable, AccessControl {
    IFlocToken public flocToken;
    uint256 public conversionRatio;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ANALYST_ROLE = keccak256("ANALYST_ROLE");

    constructor() ERC20("FlocLoyaltyToken", "FLT") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Initial mint to the deployer, adjust as needed

        conversionRatio = 3; // 3 loyalty tokens for 1 gold token

        // Set up the admin role
        _grantRole(ADMIN_ROLE, msg.sender);

        // Assign the admin role as the admin for other roles
        _setRoleAdmin(ANALYST_ROLE, ADMIN_ROLE);

        // Optionally, you can give the deployer the analyst role as well
        // _setupRole(ANALYST_ROLE, msg.sender);
    }

    function mint(
        address to,
        uint256 amount
    ) public onlyRole(ADMIN_ROLE) whenNotPaused {
        _mint(to, amount);
    }

    function burn(uint256 amount) public whenNotPaused {
        _burn(msg.sender, amount);
    }

    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // Functions that can be called by analysts
    function checkBalance(
        address account
    ) public view onlyRole(ANALYST_ROLE) returns (uint256) {
        return balanceOf(account);
    }

    // Overriding the transfer, transferFrom, and approve methods to respect the pause state
    function transfer(
        address to,
        uint256 amount
    ) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    function approve(
        address spender,
        uint256 amount
    ) public override whenNotPaused returns (bool) {
        return super.approve(spender, amount);
    }

    // Function to set the flocToken address
    function setflocTokenAddress(
        address _flocTokenAddress
    ) public onlyRole(ADMIN_ROLE) {
        flocToken = IFlocToken(_flocTokenAddress);
    }

    // Function to set the conversion ratio
    function setConversionRatio(
        uint256 _newRatio
    ) public whenNotPaused onlyRole(ADMIN_ROLE) {
        require(_newRatio > 0, "Conversion ratio must be greater than zero");
        conversionRatio = _newRatio;
    }

    // Function to swap loyalty tokens for gold tokens
    function swapForFlocToken(uint256 loyaltyAmount) public whenNotPaused {
        require(
            address(flocToken) != address(0),
            "Floc token contract not set"
        );
        require(
            balanceOf(msg.sender) >= loyaltyAmount,
            "Not enough loyalty tokens"
        );
        uint256 flocAmount = loyaltyAmount / conversionRatio;
        _burn(msg.sender, loyaltyAmount);
        flocToken.mint(msg.sender, flocAmount);
    }
}
