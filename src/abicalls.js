//TODO: code cleaning when more familiarized, for now let it working
//credits to vfat.tools, 70% of the code forked from there and applied small fixes.
const { ethers } = require('ethers');
const lodash = require('lodash');
const { getAVAXValue, getTokenList } = require('./graph.js');
const { filterToken } = require('./utils.js');
const { Constants } = require('./resources.js');

var individualAPRs = [];
var type = [];

const avaxTokens = [
    { "id": "avalanche", "symbol": "AVAX", "contract": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7" },
    { "id": "pangolin", "symbol": "PNG", "contract": "0x60781C2586D68229fde47564546784ab3fACA982" },
]
const SNOB_CHEF_ABI = [{ "type": "constructor", "stateMutability": "nonpayable", "inputs": [{ "type": "address", "name": "_snowball", "internalType": "contract Snowball" }, { "type": "address", "name": "_devfund", "internalType": "address" }, { "type": "address", "name": "_treasury", "internalType": "address" }, { "type": "uint256", "name": "_snowballPerBlock", "internalType": "uint256" }, { "type": "uint256", "name": "_startBlock", "internalType": "uint256" }, { "type": "uint256", "name": "_bonusEndBlock", "internalType": "uint256" }] }, { "type": "event", "name": "Deposit", "inputs": [{ "type": "address", "name": "user", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "pid", "internalType": "uint256", "indexed": true }, { "type": "uint256", "name": "amount", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "event", "name": "EmergencyWithdraw", "inputs": [{ "type": "address", "name": "user", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "pid", "internalType": "uint256", "indexed": true }, { "type": "uint256", "name": "amount", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "event", "name": "OwnershipTransferred", "inputs": [{ "type": "address", "name": "previousOwner", "internalType": "address", "indexed": true }, { "type": "address", "name": "newOwner", "internalType": "address", "indexed": true }], "anonymous": false }, { "type": "event", "name": "Recovered", "inputs": [{ "type": "address", "name": "token", "internalType": "address", "indexed": false }, { "type": "uint256", "name": "amount", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "event", "name": "Withdraw", "inputs": [{ "type": "address", "name": "user", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "pid", "internalType": "uint256", "indexed": true }, { "type": "uint256", "name": "amount", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "BONUS_MULTIPLIER", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "add", "inputs": [{ "type": "uint256", "name": "_allocPoint", "internalType": "uint256" }, { "type": "address", "name": "_lpToken", "internalType": "contract IERC20" }, { "type": "bool", "name": "_withUpdate", "internalType": "bool" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "bonusEndBlock", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "deposit", "inputs": [{ "type": "uint256", "name": "_pid", "internalType": "uint256" }, { "type": "uint256", "name": "_amount", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "devFundDivRate", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "devfund", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "emergencyWithdraw", "inputs": [{ "type": "uint256", "name": "_pid", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "getMultiplier", "inputs": [{ "type": "uint256", "name": "_from", "internalType": "uint256" }, { "type": "uint256", "name": "_to", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "massUpdatePools", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "owner", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "pendingSnowball", "inputs": [{ "type": "uint256", "name": "_pid", "internalType": "uint256" }, { "type": "address", "name": "_user", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "lpToken", "internalType": "contract IERC20" }, { "type": "uint256", "name": "allocPoint", "internalType": "uint256" }, { "type": "uint256", "name": "lastRewardBlock", "internalType": "uint256" }, { "type": "uint256", "name": "accSnowballPerShare", "internalType": "uint256" }], "name": "poolInfo", "inputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "poolLength", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "renounceOwnership", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "set", "inputs": [{ "type": "uint256", "name": "_pid", "internalType": "uint256" }, { "type": "uint256", "name": "_allocPoint", "internalType": "uint256" }, { "type": "bool", "name": "_withUpdate", "internalType": "bool" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setBonusEndBlock", "inputs": [{ "type": "uint256", "name": "_bonusEndBlock", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setDevFundDivRate", "inputs": [{ "type": "uint256", "name": "_devFundDivRate", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setSnowballPerBlock", "inputs": [{ "type": "uint256", "name": "_snowballPerBlock", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setTreasuryDivRate", "inputs": [{ "type": "uint256", "name": "_treasuryDivRate", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "contract Snowball" }], "name": "snowball", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "snowballPerBlock", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "startBlock", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "totalAllocPoint", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "transferOwnership", "inputs": [{ "type": "address", "name": "newOwner", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "treasury", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "treasuryDivRate", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "updateDevfund", "inputs": [{ "type": "address", "name": "_devfund", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "updatePool", "inputs": [{ "type": "uint256", "name": "_pid", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "updateTreasury", "inputs": [{ "type": "address", "name": "_treasury", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "amount", "internalType": "uint256" }, { "type": "uint256", "name": "rewardDebt", "internalType": "uint256" }], "name": "userInfo", "inputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }, { "type": "address", "name": "", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "withdraw", "inputs": [{ "type": "uint256", "name": "_pid", "internalType": "uint256" }, { "type": "uint256", "name": "_amount", "internalType": "uint256" }] }]

const PANGO_ABI = [{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0In", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1In", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount0Out", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1Out", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "Swap", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint112", "name": "reserve0", "type": "uint112" }, { "indexed": false, "internalType": "uint112", "name": "reserve1", "type": "uint112" }], "name": "Sync", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [], "name": "DOMAIN_SEPARATOR", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "MINIMUM_LIQUIDITY", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "PERMIT_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "burn", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "_token0", "type": "address" }, { "internalType": "address", "name": "_token1", "type": "address" }], "name": "initialize", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "kLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "mint", "outputs": [{ "internalType": "uint256", "name": "liquidity", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "permit", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "price0CumulativeLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "price1CumulativeLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "skim", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount0Out", "type": "uint256" }, { "internalType": "uint256", "name": "amount1Out", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "swap", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "sync", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }];
const BSC_VAULT_ABI = [{ "inputs": [{ "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "address", "name": "_controller", "type": "address" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "available", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "balance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "controller", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "deposit", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "depositAll", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "earn", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getPricePerFullShare", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "governance", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "reserve", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "harvest", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "max", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "min", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "_controller", "type": "address" }], "name": "setController", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "_governance", "type": "address" }], "name": "setGovernance", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "_min", "type": "uint256" }], "name": "setMin", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "token", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "_shares", "type": "uint256" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "withdrawAll", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }]

const AVAX_VAULT_ABI = [{ "type": "constructor", "stateMutability": "nonpayable", "inputs": [{ "type": "address", "name": "_token", "internalType": "address" }, { "type": "address", "name": "_governance", "internalType": "address" }, { "type": "address", "name": "_timelock", "internalType": "address" }, { "type": "address", "name": "_controller", "internalType": "address" }] }, { "type": "event", "name": "Approval", "inputs": [{ "type": "address", "name": "owner", "internalType": "address", "indexed": true }, { "type": "address", "name": "spender", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "value", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "event", "name": "Transfer", "inputs": [{ "type": "address", "name": "from", "internalType": "address", "indexed": true }, { "type": "address", "name": "to", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "value", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "allowance", "inputs": [{ "type": "address", "name": "owner", "internalType": "address" }, { "type": "address", "name": "spender", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "approve", "inputs": [{ "type": "address", "name": "spender", "internalType": "address" }, { "type": "uint256", "name": "amount", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "available", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "balance", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "balanceOf", "inputs": [{ "type": "address", "name": "account", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "controller", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint8", "name": "", "internalType": "uint8" }], "name": "decimals", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "decreaseAllowance", "inputs": [{ "type": "address", "name": "spender", "internalType": "address" }, { "type": "uint256", "name": "subtractedValue", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "deposit", "inputs": [{ "type": "uint256", "name": "_amount", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "depositAll", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "earn", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "getRatio", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "governance", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "harvest", "inputs": [{ "type": "address", "name": "reserve", "internalType": "address" }, { "type": "uint256", "name": "amount", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "increaseAllowance", "inputs": [{ "type": "address", "name": "spender", "internalType": "address" }, { "type": "uint256", "name": "addedValue", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "max", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "min", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "string", "name": "", "internalType": "string" }], "name": "name", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setController", "inputs": [{ "type": "address", "name": "_controller", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setGovernance", "inputs": [{ "type": "address", "name": "_governance", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setMin", "inputs": [{ "type": "uint256", "name": "_min", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setTimelock", "inputs": [{ "type": "address", "name": "_timelock", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "string", "name": "", "internalType": "string" }], "name": "symbol", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "timelock", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "contract IERC20" }], "name": "token", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "totalSupply", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "transfer", "inputs": [{ "type": "address", "name": "recipient", "internalType": "address" }, { "type": "uint256", "name": "amount", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "transferFrom", "inputs": [{ "type": "address", "name": "sender", "internalType": "address" }, { "type": "address", "name": "recipient", "internalType": "address" }, { "type": "uint256", "name": "amount", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "withdraw", "inputs": [{ "type": "uint256", "name": "_shares", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "withdrawAll", "inputs": [] }]
const ERC20_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }];

const SNOB_CHEF_ADDR = "0xB12531a2d758c7a8BF09f44FC88E646E1BF9D375";
const rewardTokenTicker = "SNOB";
var provider = undefined;

async function generateFarmingPoolsData() {
    provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    const tokens = {};

    const prices = await getAvaxPrices();

    const SNOB_CHEF = new ethers.Contract(SNOB_CHEF_ADDR, SNOB_CHEF_ABI, provider);

    const blockNum = await provider.getBlockNumber();
    const multiplier = await SNOB_CHEF.getMultiplier(blockNum, blockNum + 1);

    const blocksPerSeconds = await getAverageBlockTime();

    const rewardsPerWeek = await SNOB_CHEF.snowballPerBlock() / 1e18
        * 604800 / blocksPerSeconds * multiplier;

    await loadAvaxChefContract(tokens, prices, SNOB_CHEF, SNOB_CHEF_ADDR, SNOB_CHEF_ABI, rewardTokenTicker,
        "snowball", null, rewardsPerWeek, "pendingSnowball", null, [0]);

    console.log(`loaded`);

}

async function getAverageBlockTime() {
    const currentBlockNumber = await provider.getBlockNumber();
    const currentBlock = await provider.getBlock(currentBlockNumber);
    const previousBlock = await provider.getBlock(currentBlockNumber - 15000);
    const differenceTimestamp = currentBlock.timestamp - previousBlock.timestamp;
    return differenceTimestamp / 15000;
}


async function loadAvaxChefContract(tokens, prices, chef, chefAddress, chefAbi, rewardTokenTicker,
    rewardTokenFunction, rewardsPerBlockFunction, rewardsPerWeekFixed, pendingRewardsFunction,
    deathPoolIndices, ignoredPools) {
    const chefContract = chef ?? new ethers.Contract(chefAddress, chefAbi, provider);

    const poolCount = parseInt(await chefContract.poolLength(), 10);
    const totalAllocPoints = await chefContract.totalAllocPoint();

    var tokens = {};

    const rewardTokenAddress = await chefContract.callStatic[rewardTokenFunction]();
    const rewardToken = await getAvaxToken(rewardTokenAddress, chefAddress);
    const rewardsPerWeek = rewardsPerWeekFixed ??
        await chefContract.callStatic[rewardsPerBlockFunction]()
        / 10 ** rewardToken.decimals * 604800 / 3

    const poolInfos = await Promise.all([...Array(poolCount).keys()].map(async (x) =>
        ignoredPools?.includes(x) ? null :
            await getAvaxPoolInfo(chefContract, chefAddress, x, pendingRewardsFunction)));


    var tokenAddresses = [].concat.apply([], poolInfos.filter(x => x?.poolToken).map(x => x.poolToken.tokens));

    var prices = await lookUpTokenPrices();

    await Promise.all(tokenAddresses.map(async (address) => {
        tokens[address] = await getAvaxToken(address, chefAddress);
    }));

    if (deathPoolIndices) {   //load prices for the deathpool assets
        deathPoolIndices.map(i => poolInfos[i])
            .map(poolInfo =>
                poolInfo?.poolToken ? getPoolPrices(tokens, prices, poolInfo.poolToken, "avax") : undefined);
    }

    const poolPrices = poolInfos.map(poolInfo => poolInfo?.poolToken ? getPoolPrices(tokens, prices, poolInfo.poolToken, "avax") : undefined);

    let aprs = []
    for (i = 0; i < poolCount; i++) {
        if (poolPrices[i] && poolPrices[i].name){
            let apr = printChefPool(chefAbi, chefAddress, prices, tokens, poolInfos[i], i, poolPrices[i],
                totalAllocPoints, rewardsPerWeek, rewardTokenTicker, rewardTokenAddress,
                pendingRewardsFunction, null, null, "avax")
            aprs.push(apr);
            aprs[aprs.length-1].name = poolPrices[i].name;
        }
    }
    individualAPRs = aprs;
    
}

function getPoolsInfo() {
    return individualAPRs;
}

async function getAvaxPoolInfo(chefContract, chefAddress, poolIndex, pendingRewardsFunction) {
    const poolInfo = await chefContract.poolInfo(poolIndex);
    if (poolInfo.allocPoint == 0) {
        return {
            address: poolInfo.lpToken,
            allocPoints: poolInfo.allocPoint ?? 1,
            poolToken: null,
            userStaked: 0,
            pendingRewardTokens: 0,
        };
    }
    const poolToken = await getAvaxToken(poolInfo.lpToken, chefAddress);
    return {
        address: poolInfo.lpToken,
        allocPoints: poolInfo.allocPoint ?? 1,
        poolToken: poolToken,
        userStaked: 0,
        pendingRewardTokens: 0,
    };
}


module.exports = { generateFarmingPoolsData, getPoolsInfo };

function printChefPool(chefAbi, chefAddr, prices, tokens, poolInfo, poolIndex, poolPrices,
    totalAllocPoints, rewardsPerWeek, rewardTokenTicker, rewardTokenAddress,
    pendingRewardsFunction, fixedDecimals, claimFunction, chain = "eth") {
    fixedDecimals = fixedDecimals ?? 2;
    const sp = (poolInfo.stakedToken == null) ? null : getPoolPrices(tokens, prices, poolInfo.stakedToken);
    var poolRewardsPerWeek = poolInfo.allocPoints / totalAllocPoints * rewardsPerWeek;
    if (poolRewardsPerWeek == 0 && rewardsPerWeek != 0) return;
    const rewardPrice = (lodash.filter(prices, function (o) { return o.address.toLowerCase() == rewardTokenAddress.toLowerCase(); }))[0].usd;
    const staked_tvl = sp?.staked_tvl ?? poolPrices.staked_tvl;
    var apr = printAPR(rewardPrice, poolRewardsPerWeek,
        staked_tvl, fixedDecimals);
    
    apr.poolInfo = poolInfo;
    return apr;
}


function printAPR(rewardPrice, poolRewardsPerWeek, staked_tvl, fixedDecimals) {
    var usdPerWeek = poolRewardsPerWeek * rewardPrice;
    fixedDecimals = fixedDecimals ?? 2;
    var weeklyAPR = usdPerWeek / staked_tvl * 100;
    var dailyAPR = weeklyAPR / 7;
    var yearlyAPR = weeklyAPR * 52;
    return {
        totalStakedUsd: staked_tvl,
        dailyAPR,
        yearlyAPR,
        weeklyAPR
    }
}


function getErc20Prices(prices, pool, chain = "eth") {
    var price = getParameterCaseInsensitive(prices, pool.address)?.usd;
    var tvl = pool.totalSupply * price / 10 ** pool.decimals;
    var staked_tvl = pool.staked * price;
    return {
        staked_tvl: staked_tvl,
        price: price,
        stakeTokenTicker: pool.symbol,
        tvl: tvl
    }
}


function getPangoPrices(tokens, prices, pool) {
    var t0 = (lodash.filter(tokens, function (o) { return o.address.toLowerCase() == pool.token0.toLowerCase(); }))[0]; //getParameterCaseInsensitive(tokens, pool.token0);
    var p0 = (lodash.filter(prices, function (o) { return o.address.toLowerCase() == pool.token0.toLowerCase(); }))[0].usd; //getParameterCaseInsensitive(prices, pool.token0)?.usd;
    var t1 = (lodash.filter(tokens, function (o) { return o.address.toLowerCase() == pool.token1.toLowerCase(); }))[0];//getParameterCaseInsensitive(tokens, pool.token1);
    var p1 = (lodash.filter(prices, function (o) { return o.address.toLowerCase() == pool.token1.toLowerCase(); }))[0].usd;
    if (p0 == null && p1 == null) {
        console.log(`Missing prices for tokens ${pool.token0} and ${pool.token1}.`);
        return undefined;
    }
    if (t0?.decimals == null) {
        console.log(`Missing information for token ${pool.token0}.`);
        return undefined;
    }
    if (t1?.decimals == null) {
        console.log(`Missing information for token ${pool.token1}.`);
        return undefined;
    }
    var q0 = pool.q0 / 10 ** t0.decimals;
    var q1 = pool.q1 / 10 ** t1.decimals;
    if (p0 == null) {
        p0 = q1 * p1 / q0;
        prices[pool.token0] = { usd: p0 };
    }
    if (p1 == null) {
        p1 = q0 * p0 / q1;
        prices[pool.token1] = { usd: p1 };
    }
    var tvl = q0 * p0 + q1 * p1;
    var price = tvl / pool.totalSupply;
    prices[pool.address] = { usd: price };
    var staked_tvl = pool.staked * price;
    let stakeTokenTicker = `${t0.symbol}/${t1.symbol}`;
    return {
        t0: t0,
        p0: p0,
        q0: q0,
        t1: t1,
        p1: p1,
        q1: q1,
        price: price,
        tvl: tvl,
        staked_tvl: staked_tvl,
        stakeTokenTicker: stakeTokenTicker,
    }
}

function getPoolPrices(tokens, prices, pool, chain = "eth") {
    if (pool.token0 != null) return getPangoPrices(tokens, prices, pool);
    if (pool.token != null) return getWrapPrices(tokens, prices, pool);
    return getErc20Prices(prices, pool, chain);
}

function getWrapPrices(tokens, prices, pool)
{
  const wrappedToken = pool.token;
  if (wrappedToken.token0 != null) { //Uniswap
    const pangoPrices = getPangoPrices(tokens, prices, wrappedToken);
    const name = `Wrapped ${pangoPrices.stakeTokenTicker}`;
    const price = (pool.balance / 10 ** wrappedToken.decimals) * pangoPrices.price / (pool.totalSupply / 10 ** pool.decimals);
    const tvl = pool.balance / 10 ** wrappedToken.decimals * price;
    const staked_tvl = pool.staked * price;
    
    prices[pool.address] = { usd : price };
    return {
      name : name,
      tvl : tvl,
      staked_tvl : staked_tvl,
      price : price,
      stakeTokenTicker : pool.symbol
    }
  }
  else {
    let tokenPrice = 0;
    if (wrappedToken.token != null) { //e.g. stakedao crv token vault
      tokenPrice = pp.price;
    }
    else {
      tokenPrice = getParameterCaseInsensitive(prices, wrappedToken.address)?.usd;
    }
    const price = (pool.balance / 10 ** wrappedToken.decimals) * tokenPrice / (pool.totalSupply / 10 ** pool.decimals);
    const tvl = pool.balance / 10 ** wrappedToken.decimals * price;
    const staked_tvl = pool.staked * price;
    prices[pool.address] = { usd : price };
    return {
      name: pool.symbol,
      tvl : tvl,
      staked_tvl : staked_tvl,
      price : price,
      stakeTokenTicker : pool.symbol
    }
  }
}


function getParameterCaseInsensitive(object, key) {
    return object[Object.keys(object)
        .find(k => k.toLowerCase() === key.toLowerCase())
    ];
}


async function getAvax20(token, address) {
    if (address == "0x0000000000000000000000000000000000000000") {
        return {
            address,
            name: "Avax",
            symbol: "AVAX",
            totalSupply: 1e8,
            decimals: 18,
            contract: null,
            tokens: [address]
        }
    }
    const decimals = await token.decimals()
    return {
        address,
        name: await token.name(),
        symbol: await token.symbol(),
        totalSupply: await token.totalSupply(),
        decimals: decimals,
        contract: token,
        tokens: [address]
    };
}

async function getAvaxStoredToken(tokenAddress, type, stakingAddress) {
    switch (type) {
        case "pango":
            const pool = new ethers.Contract(tokenAddress, PANGO_ABI, provider);
            return await getAvaxPangoPool(pool, tokenAddress, stakingAddress);
        case "avax20":
            const avax20 = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
            return await getAvax20(avax20, tokenAddress);
        case "vault":
            const vault = new ethers.Contract(tokenAddress, AVAX_VAULT_ABI, provider);
            return await getAvaxVault(vault, tokenAddress, stakingAddress);
    }
}


async function getAvaxVault(vault, address, stakingAddress) {
    const decimals = await vault.decimals();
    const token_ = await vault.token();
    const token = await getAvaxToken(token_, address);
    return {
        address,
        name: await vault.name(),
        symbol: await vault.symbol(),
        totalSupply: await vault.totalSupply(),
        decimals: decimals,
        token: token,
        staked: await vault.balanceOf(stakingAddress) / 10 ** decimals,
        balance: await vault.balance(),
        contract: vault,
        tokens: [address].concat(token.tokens),
    }
}

async function getAvaxToken(tokenAddress, stakingAddress) {
    if (tokenAddress == "0x0000000000000000000000000000000000000000") {
        return getAvax20(null, tokenAddress, "")
    }
    let searchType = [];
    let searchAddress = [];
    if (type.length > 0) {
        searchType = lodash.filter(type, function (o) { return o.tokenAddress.toLowerCase() == tokenAddress.toLowerCase(); });
    }
    if (searchType.length > 0) return getAvaxStoredToken(tokenAddress, searchType[0].type, stakingAddress);
    try {
        const pool = new ethers.Contract(tokenAddress, PANGO_ABI, provider);
        const pangoPool = await getAvaxPangoPool(pool, tokenAddress, stakingAddress);
        searchAddress = lodash.filter(type, function (o) { return o.tokenAddress.toLowerCase() == tokenAddress.toLowerCase(); });
        if (searchAddress.length == 0) {
            type.push({ tokenAddress: tokenAddress, type: "pango" });
        }
        return pangoPool;
    }
    catch (err) {
    }
    try {
        const VAULT = new ethers.Contract(tokenAddress, AVAX_VAULT_ABI, provider);
        const vault = await getAvaxVault(VAULT, tokenAddress, stakingAddress);
        searchAddress = lodash.filter(type, function (o) { return o.tokenAddress.toLowerCase() == tokenAddress.toLowerCase(); });
        if (searchAddress.length == 0) {
            type.push({ tokenAddress: tokenAddress, type: "vault" });
        }
        return vault;
    }
    catch (err) {
    }
    try {
        const avax20 = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const avax20tok = await getAvax20(avax20, tokenAddress);
        searchAddress = lodash.filter(type, function (o) { return o.tokenAddress.toLowerCase() == tokenAddress.toLowerCase(); });
        if (searchAddress.length == 0) {
            type.push({ tokenAddress: tokenAddress, type: "avax20" });
        }
        return avax20tok;
    }
    catch (err) {
        console.log(err);
        console.log(`Couldn't match ${tokenAddress} to any known token type.`);
    }
}

async function getAvaxPangoPool(pool, poolAddress,stakingAddress) {
    let q0, q1;
    const reserves = await pool.getReserves();
    q0 = reserves._reserve0;
    q1 = reserves._reserve1;
    const decimals = await pool.decimals();
    const token0 = await pool.token0();
    const token1 = await pool.token1();
    return {
        symbol: await pool.symbol(),
        name: await pool.name(),
        address: poolAddress,
        token0,
        q0,
        token1,
        q1,
        staked: await pool.balanceOf(stakingAddress) / 10 ** decimals,
        totalSupply: await pool.totalSupply() / 10 ** decimals,
        decimals: decimals,
        contract: pool,
        tokens: [token0, token1]
    };
}

async function getAvaxPrices() {
    const idPrices = await lookUpPrices(avaxTokens.map(x => x.id));
    const prices = {}
    for (const bt of avaxTokens)
        if (idPrices[bt.id])
            prices[bt.contract] = idPrices[bt.id];
    return prices;
}

const lookUpTokenPrices = async function () {
    let prices = [];
    let AVAXValue = getAVAXValue();
    (getTokenList()).forEach((element)=>{
            prices.push({ address: element.id, usd: element.derivedETH * AVAXValue });


    });

    return prices;
}


const chunk = (arr, n) => arr.length ? [arr.slice(0, n), ...chunk(arr.slice(n), n)] : []

const lookUpPrices = async function (id_array) {
    let AVAXValue = getAVAXValue();
    let PNGToken = filterToken(Constants.PNGContract);
    let PNGValue = 0;
    if (PNGToken != undefined) {
        PNGValue = (PNGToken[0].derivedETH * AVAXValue).toFixed(2);
    }
    return { avalanche: { usd: (AVAXValue).toFixed(2) }, pangolin: { usd: PNGValue } };
}
