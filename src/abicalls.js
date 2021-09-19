//TODO: code cleaning when more familiarized, for now let it working
//credits to vfat.tools, 70% of the code forked from there and applied small fixes.
const { ethers } = require('ethers');
const lodash = require('lodash');
const { getAVAXValue, getTokenList } = require('./graph.js');
const { filterToken,APYMath } = require('./utils.js');
const { Constants } = require('./resources.js');

var iceQueenAPR = [];
var iceQueenTVL = NaN;
var type = [];
var snowglobesAPR = [];
var snowglobesTVL = NaN;
var snobCircSupply = 0;
var harvestStatus = {
  lowGas:false,
  AVAXQty:0
}

const avaxTokens = [
    { "id": "avalanche", "symbol": "AVAX", "contract": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7" },
    { "id": "pangolin", "symbol": "PNG", "contract": "0x60781C2586D68229fde47564546784ab3fACA982" },
]
const SNOWCONE_ABI = [{ "name": "CommitOwnership", "inputs": [ {  "type": "address",  "name": "admin",  "indexed": false } ], "anonymous": false, "type": "event"},{ "name": "ApplyOwnership", "inputs": [ {  "type": "address",  "name": "admin",  "indexed": false } ], "anonymous": false, "type": "event"},{ "name": "Deposit", "inputs": [ {  "type": "address",  "name": "provider",  "indexed": true }, {  "type": "uint256",  "name": "value",  "indexed": false }, {  "type": "uint256",  "name": "locktime",  "indexed": true }, {  "type": "int128",  "name": "type",  "indexed": false }, {  "type": "uint256",  "name": "ts",  "indexed": false } ], "anonymous": false, "type": "event"},{ "name": "Withdraw", "inputs": [ {  "type": "address",  "name": "provider",  "indexed": true }, {  "type": "uint256",  "name": "value",  "indexed": false }, {  "type": "uint256",  "name": "ts",  "indexed": false } ], "anonymous": false, "type": "event"},{ "name": "Supply", "inputs": [ {  "type": "uint256",  "name": "prevSupply",  "indexed": false }, {  "type": "uint256",  "name": "supply",  "indexed": false } ], "anonymous": false, "type": "event"},{ "outputs": [], "inputs": [ {  "type": "address",  "name": "token_addr" }, {  "type": "string",  "name": "_name" }, {  "type": "string",  "name": "_symbol" }, {  "type": "string",  "name": "_version" } ], "stateMutability": "nonpayable", "type": "constructor"},{ "name": "commit_transfer_ownership", "outputs": [], "inputs": [ {  "type": "address",  "name": "addr" } ], "stateMutability": "nonpayable", "type": "function", "gas": 37568},{ "name": "apply_transfer_ownership", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 38407},{ "name": "commit_smart_wallet_checker", "outputs": [], "inputs": [ {  "type": "address",  "name": "addr" } ], "stateMutability": "nonpayable", "type": "function", "gas": 36278},{ "name": "apply_smart_wallet_checker", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 37005},{ "name": "get_last_user_slope", "outputs": [ {  "type": "int128",  "name": "" } ], "inputs": [ {  "type": "address",  "name": "addr" } ], "stateMutability": "view", "type": "function", "gas": 2540},{ "name": "user_point_history__ts", "outputs": [ {  "type": "uint256",  "name": "" } ], "inputs": [ {  "type": "address",  "name": "_addr" }, {  "type": "uint256",  "name": "_idx" } ], "stateMutability": "view", "type": "function", "gas": 1643},{ "name": "locked__end", "outputs": [ {  "type": "uint256",  "name": "" } ], "inputs": [ {  "type": "address",  "name": "_addr" } ], "stateMutability": "view", "type": "function", "gas": 1564},{ "name": "checkpoint", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 37118215},{ "name": "deposit_for", "outputs": [], "inputs": [ {  "type": "address",  "name": "_addr" }, {  "type": "uint256",  "name": "_value" } ], "stateMutability": "nonpayable", "type": "function", "gas": 74411056},{ "name": "create_lock", "outputs": [], "inputs": [ {  "type": "uint256",  "name": "_value" }, {  "type": "uint256",  "name": "_unlock_time" } ], "stateMutability": "nonpayable", "type": "function", "gas": 74412397},{ "name": "increase_amount", "outputs": [], "inputs": [ {  "type": "uint256",  "name": "_value" } ], "stateMutability": "nonpayable", "type": "function", "gas": 74411818},{ "name": "increase_unlock_time", "outputs": [], "inputs": [ {  "type": "uint256",  "name": "_unlock_time" } ], "stateMutability": "nonpayable", "type": "function", "gas": 74412465},{ "name": "withdraw", "outputs": [], "inputs": [], "stateMutability": "nonpayable", "type": "function", "gas": 37289006},{ "name": "balanceOf", "outputs": [ {  "type": "uint256",  "name": "" } ], "inputs": [ {  "type": "address",  "name": "addr" } ], "stateMutability": "view", "type": "function"},{ "name": "balanceOf", "outputs": [ {  "type": "uint256",  "name": "" } ], "inputs": [ {  "type": "address",  "name": "addr" }, {  "type": "uint256",  "name": "_t" } ], "stateMutability": "view", "type": "function"},{ "name": "balanceOfAt", "outputs": [ {  "type": "uint256",  "name": "" } ], "inputs": [ {  "type": "address",  "name": "addr" }, {  "type": "uint256",  "name": "_block" } ], "stateMutability": "view", "type": "function", "gas": 509566},{ "name": "totalSupply", "outputs": [ {  "type": "uint256",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function"},{ "name": "totalSupply", "outputs": [ {  "type": "uint256",  "name": "" } ], "inputs": [ {  "type": "uint256",  "name": "t" } ], "stateMutability": "view", "type": "function"},{ "name": "totalSupplyAt", "outputs": [ {  "type": "uint256",  "name": "" } ], "inputs": [ {  "type": "uint256",  "name": "_block" } ], "stateMutability": "view", "type": "function", "gas": 879507},{ "name": "changeController", "outputs": [], "inputs": [ {  "type": "address",  "name": "_newController" } ], "stateMutability": "nonpayable", "type": "function", "gas": 36878},{ "name": "token", "outputs": [ {  "type": "address",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1751},{ "name": "supply", "outputs": [ {  "type": "uint256",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1781},{ "name": "locked", "outputs": [ {  "type": "int128",  "name": "amount" }, {  "type": "uint256",  "name": "end" } ], "inputs": [ {  "type": "address",  "name": "arg0" } ], "stateMutability": "view", "type": "function", "gas": 3260},{ "name": "epoch", "outputs": [ {  "type": "uint256",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1841},{ "name": "point_history", "outputs": [ {  "type": "int128",  "name": "bias" }, {  "type": "int128",  "name": "slope" }, {  "type": "uint256",  "name": "ts" }, {  "type": "uint256",  "name": "blk" } ], "inputs": [ {  "type": "uint256",  "name": "arg0" } ], "stateMutability": "view", "type": "function", "gas": 5178},{ "name": "user_point_history", "outputs": [ {  "type": "int128",  "name": "bias" }, {  "type": "int128",  "name": "slope" }, {  "type": "uint256",  "name": "ts" }, {  "type": "uint256",  "name": "blk" } ], "inputs": [ {  "type": "address",  "name": "arg0" }, {  "type": "uint256",  "name": "arg1" } ], "stateMutability": "view", "type": "function", "gas": 5423},{ "name": "user_point_epoch", "outputs": [ {  "type": "uint256",  "name": "" } ], "inputs": [ {  "type": "address",  "name": "arg0" } ], "stateMutability": "view", "type": "function", "gas": 2146},{ "name": "slope_changes", "outputs": [ {  "type": "int128",  "name": "" } ], "inputs": [ {  "type": "uint256",  "name": "arg0" } ], "stateMutability": "view", "type": "function", "gas": 2076},{ "name": "controller", "outputs": [ {  "type": "address",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 1991},{ "name": "transfersEnabled", "outputs": [ {  "type": "bool",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2021},{ "name": "name", "outputs": [ {  "type": "string",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 8453},{ "name": "symbol", "outputs": [ {  "type": "string",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 7506},{ "name": "version", "outputs": [ {  "type": "string",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 7536},{ "name": "decimals", "outputs": [ {  "type": "uint256",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2141},{ "name": "future_smart_wallet_checker", "outputs": [ {  "type": "address",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2171},{ "name": "smart_wallet_checker", "outputs": [ {  "type": "address",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2201},{ "name": "admin", "outputs": [ {  "type": "address",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2231},{ "name": "future_admin", "outputs": [ {  "type": "address",  "name": "" } ], "inputs": [], "stateMutability": "view", "type": "function", "gas": 2261}];

const SNOB_CHEF_ABI = [{ "type": "constructor", "stateMutability": "nonpayable", "inputs": [{ "type": "address", "name": "_snowball", "internalType": "contract Snowball" }, { "type": "address", "name": "_devfund", "internalType": "address" }, { "type": "address", "name": "_treasury", "internalType": "address" }, { "type": "uint256", "name": "_snowballPerBlock", "internalType": "uint256" }, { "type": "uint256", "name": "_startBlock", "internalType": "uint256" }, { "type": "uint256", "name": "_bonusEndBlock", "internalType": "uint256" }] }, { "type": "event", "name": "Deposit", "inputs": [{ "type": "address", "name": "user", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "pid", "internalType": "uint256", "indexed": true }, { "type": "uint256", "name": "amount", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "event", "name": "EmergencyWithdraw", "inputs": [{ "type": "address", "name": "user", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "pid", "internalType": "uint256", "indexed": true }, { "type": "uint256", "name": "amount", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "event", "name": "OwnershipTransferred", "inputs": [{ "type": "address", "name": "previousOwner", "internalType": "address", "indexed": true }, { "type": "address", "name": "newOwner", "internalType": "address", "indexed": true }], "anonymous": false }, { "type": "event", "name": "Recovered", "inputs": [{ "type": "address", "name": "token", "internalType": "address", "indexed": false }, { "type": "uint256", "name": "amount", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "event", "name": "Withdraw", "inputs": [{ "type": "address", "name": "user", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "pid", "internalType": "uint256", "indexed": true }, { "type": "uint256", "name": "amount", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "BONUS_MULTIPLIER", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "add", "inputs": [{ "type": "uint256", "name": "_allocPoint", "internalType": "uint256" }, { "type": "address", "name": "_lpToken", "internalType": "contract IERC20" }, { "type": "bool", "name": "_withUpdate", "internalType": "bool" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "bonusEndBlock", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "deposit", "inputs": [{ "type": "uint256", "name": "_pid", "internalType": "uint256" }, { "type": "uint256", "name": "_amount", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "devFundDivRate", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "devfund", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "emergencyWithdraw", "inputs": [{ "type": "uint256", "name": "_pid", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "getMultiplier", "inputs": [{ "type": "uint256", "name": "_from", "internalType": "uint256" }, { "type": "uint256", "name": "_to", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "massUpdatePools", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "owner", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "pendingSnowball", "inputs": [{ "type": "uint256", "name": "_pid", "internalType": "uint256" }, { "type": "address", "name": "_user", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "lpToken", "internalType": "contract IERC20" }, { "type": "uint256", "name": "allocPoint", "internalType": "uint256" }, { "type": "uint256", "name": "lastRewardBlock", "internalType": "uint256" }, { "type": "uint256", "name": "accSnowballPerShare", "internalType": "uint256" }], "name": "poolInfo", "inputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "poolLength", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "renounceOwnership", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "set", "inputs": [{ "type": "uint256", "name": "_pid", "internalType": "uint256" }, { "type": "uint256", "name": "_allocPoint", "internalType": "uint256" }, { "type": "bool", "name": "_withUpdate", "internalType": "bool" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setBonusEndBlock", "inputs": [{ "type": "uint256", "name": "_bonusEndBlock", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setDevFundDivRate", "inputs": [{ "type": "uint256", "name": "_devFundDivRate", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setSnowballPerBlock", "inputs": [{ "type": "uint256", "name": "_snowballPerBlock", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setTreasuryDivRate", "inputs": [{ "type": "uint256", "name": "_treasuryDivRate", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "contract Snowball" }], "name": "snowball", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "snowballPerBlock", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "startBlock", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "totalAllocPoint", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "transferOwnership", "inputs": [{ "type": "address", "name": "newOwner", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "treasury", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "treasuryDivRate", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "updateDevfund", "inputs": [{ "type": "address", "name": "_devfund", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "updatePool", "inputs": [{ "type": "uint256", "name": "_pid", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "updateTreasury", "inputs": [{ "type": "address", "name": "_treasury", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "amount", "internalType": "uint256" }, { "type": "uint256", "name": "rewardDebt", "internalType": "uint256" }], "name": "userInfo", "inputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }, { "type": "address", "name": "", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "withdraw", "inputs": [{ "type": "uint256", "name": "_pid", "internalType": "uint256" }, { "type": "uint256", "name": "_amount", "internalType": "uint256" }] }]

const PANGO_ABI = [{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0In", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1In", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount0Out", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1Out", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "Swap", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint112", "name": "reserve0", "type": "uint112" }, { "indexed": false, "internalType": "uint112", "name": "reserve1", "type": "uint112" }], "name": "Sync", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [], "name": "DOMAIN_SEPARATOR", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "MINIMUM_LIQUIDITY", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "PERMIT_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "burn", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "_token0", "type": "address" }, { "internalType": "address", "name": "_token1", "type": "address" }], "name": "initialize", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "kLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "mint", "outputs": [{ "internalType": "uint256", "name": "liquidity", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "permit", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "price0CumulativeLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "price1CumulativeLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "skim", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount0Out", "type": "uint256" }, { "internalType": "uint256", "name": "amount1Out", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "swap", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "sync", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }];
const PNG_STAKING_ABI = [{ "inputs": [{ "internalType": "address", "name": "_rewardsToken", "type": "address" }, { "internalType": "address", "name": "_stakingToken", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Recovered", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" }], "name": "RewardAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" }], "name": "RewardPaid", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "newDuration", "type": "uint256" }], "name": "RewardsDurationUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Staked", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Withdrawn", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "earned", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "exit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getRewardForDuration", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastTimeRewardApplicable", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastUpdateTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "reward", "type": "uint256" }], "name": "notifyRewardAmount", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "periodFinish", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" }], "name": "recoverERC20", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "rewardPerToken", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "rewardPerTokenStored", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "rewardRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "rewards", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "rewardsDuration", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "rewardsToken", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_rewardsDuration", "type": "uint256" }], "name": "setRewardsDuration", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "stakeWithPermit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "stakingToken", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "userRewardPerTokenPaid", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]

const AVAX_VAULT_ABI = [{ "type": "constructor", "stateMutability": "nonpayable", "inputs": [{ "type": "address", "name": "_token", "internalType": "address" }, { "type": "address", "name": "_governance", "internalType": "address" }, { "type": "address", "name": "_timelock", "internalType": "address" }, { "type": "address", "name": "_controller", "internalType": "address" }] }, { "type": "event", "name": "Approval", "inputs": [{ "type": "address", "name": "owner", "internalType": "address", "indexed": true }, { "type": "address", "name": "spender", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "value", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "event", "name": "Transfer", "inputs": [{ "type": "address", "name": "from", "internalType": "address", "indexed": true }, { "type": "address", "name": "to", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "value", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "allowance", "inputs": [{ "type": "address", "name": "owner", "internalType": "address" }, { "type": "address", "name": "spender", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "approve", "inputs": [{ "type": "address", "name": "spender", "internalType": "address" }, { "type": "uint256", "name": "amount", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "available", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "balance", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "balanceOf", "inputs": [{ "type": "address", "name": "account", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "controller", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint8", "name": "", "internalType": "uint8" }], "name": "decimals", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "decreaseAllowance", "inputs": [{ "type": "address", "name": "spender", "internalType": "address" }, { "type": "uint256", "name": "subtractedValue", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "deposit", "inputs": [{ "type": "uint256", "name": "_amount", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "depositAll", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "earn", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "getRatio", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "governance", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "harvest", "inputs": [{ "type": "address", "name": "reserve", "internalType": "address" }, { "type": "uint256", "name": "amount", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "increaseAllowance", "inputs": [{ "type": "address", "name": "spender", "internalType": "address" }, { "type": "uint256", "name": "addedValue", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "max", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "min", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "string", "name": "", "internalType": "string" }], "name": "name", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setController", "inputs": [{ "type": "address", "name": "_controller", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setGovernance", "inputs": [{ "type": "address", "name": "_governance", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setMin", "inputs": [{ "type": "uint256", "name": "_min", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "setTimelock", "inputs": [{ "type": "address", "name": "_timelock", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "string", "name": "", "internalType": "string" }], "name": "symbol", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "timelock", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "contract IERC20" }], "name": "token", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "totalSupply", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "transfer", "inputs": [{ "type": "address", "name": "recipient", "internalType": "address" }, { "type": "uint256", "name": "amount", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "transferFrom", "inputs": [{ "type": "address", "name": "sender", "internalType": "address" }, { "type": "address", "name": "recipient", "internalType": "address" }, { "type": "uint256", "name": "amount", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "withdraw", "inputs": [{ "type": "uint256", "name": "_shares", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "withdrawAll", "inputs": [] }]
const ERC20_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }];
const SNOWGLOBE_ABI = [{"type":"constructor","stateMutability":"nonpayable","inputs":[{"type":"address","name":"_token","internalType":"address"},{"type":"address","name":"_governance","internalType":"address"},{"type":"address","name":"_timelock","internalType":"address"},{"type":"address","name":"_controller","internalType":"address"}]},{"type":"event","name":"Approval","inputs":[{"type":"address","name":"owner","internalType":"address","indexed":true},{"type":"address","name":"spender","internalType":"address","indexed":true},{"type":"uint256","name":"value","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"event","name":"Transfer","inputs":[{"type":"address","name":"from","internalType":"address","indexed":true},{"type":"address","name":"to","internalType":"address","indexed":true},{"type":"uint256","name":"value","internalType":"uint256","indexed":false}],"anonymous":false},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"allowance","inputs":[{"type":"address","name":"owner","internalType":"address"},{"type":"address","name":"spender","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"approve","inputs":[{"type":"address","name":"spender","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"available","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"balance","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"balanceOf","inputs":[{"type":"address","name":"account","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"controller","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint8","name":"","internalType":"uint8"}],"name":"decimals","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"decreaseAllowance","inputs":[{"type":"address","name":"spender","internalType":"address"},{"type":"uint256","name":"subtractedValue","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"deposit","inputs":[{"type":"uint256","name":"_amount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"depositAll","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"earn","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"getRatio","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"governance","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"harvest","inputs":[{"type":"address","name":"reserve","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"increaseAllowance","inputs":[{"type":"address","name":"spender","internalType":"address"},{"type":"uint256","name":"addedValue","internalType":"uint256"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"max","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"min","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"name","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setController","inputs":[{"type":"address","name":"_controller","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setGovernance","inputs":[{"type":"address","name":"_governance","internalType":"address"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setMin","inputs":[{"type":"uint256","name":"_min","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"setTimelock","inputs":[{"type":"address","name":"_timelock","internalType":"address"}]},{"type":"function","stateMutability":"view","outputs":[{"type":"string","name":"","internalType":"string"}],"name":"symbol","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"address"}],"name":"timelock","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"address","name":"","internalType":"contract IERC20"}],"name":"token","inputs":[]},{"type":"function","stateMutability":"view","outputs":[{"type":"uint256","name":"","internalType":"uint256"}],"name":"totalSupply","inputs":[]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"transfer","inputs":[{"type":"address","name":"recipient","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[{"type":"bool","name":"","internalType":"bool"}],"name":"transferFrom","inputs":[{"type":"address","name":"sender","internalType":"address"},{"type":"address","name":"recipient","internalType":"address"},{"type":"uint256","name":"amount","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdraw","inputs":[{"type":"uint256","name":"_shares","internalType":"uint256"}]},{"type":"function","stateMutability":"nonpayable","outputs":[],"name":"withdrawAll","inputs":[]}];

const SNOB_CHEF_ADDR = "0xB12531a2d758c7a8BF09f44FC88E646E1BF9D375";

var provider = null;

async function generateFarmingPoolsData() {
    const PngFarmsElegible = [
        {
            stakingRewardAddress: '0x417C02150b9a31BcaCb201d1D60967653384E1C6',
            snowglobeAddress: '0x586554828eE99811A8ef75029351179949762c26'  //avax-ether
        },
        {
            stakingRewardAddress: '0xe968E9753fd2c323C2Fe94caFF954a48aFc18546',
            snowglobeAddress: '0x39BE35904f52E83137881C0AC71501Edf0180181'    //avax-wbtc
        },
        {
            stakingRewardAddress: '0xBDa623cDD04d822616A263BF4EdbBCe0B7DC4AE7',
            snowglobeAddress: '0x00933c16e06b1d15958317C2793BC54394Ae356C'    //avax-link
        },
        {
            stakingRewardAddress: '0x574d3245e36Cf8C9dc86430EaDb0fDB2F385F829',
            snowglobeAddress: '0x621207093D2e65Bf3aC55dD8Bf0351B980A63815'    //PNG-AVAX   
        },
        {
            stakingRewardAddress: '0x94C021845EfE237163831DAC39448cFD371279d6',
            snowglobeAddress: '0x3fcFBCB4b368222fCB4d9c314eCA597489FE8605'    //AVAX-USDT
        },
        {
            stakingRewardAddress: '0xDA354352b03f87F84315eEF20cdD83c49f7E812e',
            snowglobeAddress: '0x751089F1bf31B13Fa0F0537ae78108088a2253BF'    //AVAX-SUSHI
        },
        {
            stakingRewardAddress: '0x701e03fAD691799a8905043C0d18d2213BbCf2c7',
            snowglobeAddress: '0xb21b21E4fA802EE4c158d7cf4bD5416B8035c5e0'    //AVAX-DAI
        },
        {
            stakingRewardAddress: '0x1F6aCc5F5fE6Af91C1BB3bEbd27f4807a243D935',
            snowglobeAddress: '0xdf7F15d05d641dF701D961a38d03028e0a26a42D'    //AVAX-UNI
        },
        {
            stakingRewardAddress: '0x7ac007afB5d61F48D1E3C8Cc130d4cf6b765000e',
            snowglobeAddress: '0x3815f36C3d60d658797958EAD8778f6500be16Df'   //PNG-ETH 
        },
        {
            stakingRewardAddress: '0x681047473B6145BA5dB90b074E32861549e85cC7',
            snowglobeAddress: '0x763Aa38c837f61DD8429313933Cc47f24E881430'   //PNG-WBTC  
        },
        {
            stakingRewardAddress: '0x6356b24b36074AbE2903f44fE4019bc5864FDe36',
            snowglobeAddress: '0x392c51Ab0AF3017E3e22713353eCF5B9d6fBDE84'   //PNG-LINK 
        },
        {
            stakingRewardAddress: '0xE2510a1fCCCde8d2D1c40b41e8f71fB1F47E5bBA',
            snowglobeAddress: '0x7987aDB3C789f071FeFC1BEb15Ce6DfDfbc75899'    //PNG-USDT
        },
        {
            stakingRewardAddress: '0x633F4b4DB7dD4fa066Bd9949Ab627a551E0ecd32',
            snowglobeAddress: '0x8eDd233546730C51a9d3840e954E5581Eb3fDAB1'    //PNG-SUSHI 
        },
        {
            stakingRewardAddress: '0xe3103e565cF96a5709aE8e603B1EfB7fED04613B',
            snowglobeAddress: '0xcD651AD29835099334d312a9372418Eb2b70c72F'    //PNG-DAI
        },
        {
            stakingRewardAddress: '0xFd9ACEc0F413cA05d5AD5b962F3B4De40018AD87',
            snowglobeAddress: '0x3270b685A4a61252C6f30c1eBca9DbE622984e22'    //PNG-AAVE
        },
        {
            stakingRewardAddress: '0x4f74BbF6859A994e7c309eA0f11E3Cc112955110',
            snowglobeAddress: '0x14F98349Af847AB472Eb7f7c705Dc4Bee530713B'    //PNG-UNI
        },
        {
            stakingRewardAddress: '0xc7D0E29b616B29aC6fF4FD5f37c8Da826D16DB0D',
            snowglobeAddress: '0x234ed7c95Be12b2A0A43fF602e737225C83c2aa1'    //PNG-YFI
        },
        {
            stakingRewardAddress: '0x08B9A023e34Bad6Db868B699fa642Bf5f12Ebe76',
            snowglobeAddress: '0xB4db531076494432eaAA4C6fCD59fcc876af2734'    //PNG-SNOB
        },
        {
            stakingRewardAddress: '0x640D754113A3CBDd80BcCc1b5c0387148EEbf2fE',
            snowglobeAddress: '0xF4072358C1E3d7841BD7AfDE31F61E17E8d99BE7'  //AVAX-SNOB
        },
        {
            stakingRewardAddress: '0x12A33F6B0dd0D35279D402aB61587fE7eB23f7b0',
            snowglobeAddress: '0xa39785a4E4CdDa7509751ed152a00f3D37FbFa9F'  
        },
        {
            stakingRewardAddress: '0xd3e5538A049FcFcb8dF559B85B352302fEfB8d7C',
            snowglobeAddress: '0x27f8FE86a513bAAF18B59D3dD15218Cc629640Fc'  
        },
        {
            stakingRewardAddress: '0xf2b788085592380bfCAc40Ac5E0d10D9d0b54eEe',
            snowglobeAddress: '0x888Ab4CB2279bDB1A81c49451581d7c243AffbEf'  
        },
        {
            stakingRewardAddress: '0x759ee0072901f409e4959E00b00a16FD729397eC',
            snowglobeAddress: '0x8309C64390F376fD778BDd701d54d1F8DFfe1F39'  
        }
    ]
    provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    const tokens = {};

    const prices = await getAvaxPrices();

    const SNOB_CHEF = new ethers.Contract(SNOB_CHEF_ADDR, SNOB_CHEF_ABI, provider);

    const blockNum = await provider.getBlockNumber();
    const multiplier = await SNOB_CHEF.getMultiplier(blockNum, blockNum + 1);

    const blocksPerSeconds = await getAverageBlockTime();

    const rewardsPerWeek = await SNOB_CHEF.snowballPerBlock() / 1e18
        * 604800 / blocksPerSeconds * multiplier;

    const pools = PngFarmsElegible.map(c => {
        return {
            address: c.stakingRewardAddress,
            snowglobe: c.snowglobeAddress,
            abi: PNG_STAKING_ABI,
            stakeTokenFunction: "stakingToken",
            rewardTokenFunction: "rewardsToken"
        }
    })
    await loadMultiplePangolinPools(tokens, prices, pools);

    
    await loadAvaxChefContract(tokens, prices, SNOB_CHEF, SNOB_CHEF_ADDR, SNOB_CHEF_ABI, `SNOB`,
        "snowball", null, rewardsPerWeek, "pendingSnowball", null, [0]);

}

async function loadSnobSupply(){
    const provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    const SNOB_CONTRACT = new ethers.Contract(Constants.SNOBContract, ERC20_ABI, provider);
    const SNOWCONE_CONTRACT = new ethers.Contract(Constants.SNOWCONEContract, SNOWCONE_ABI, provider);

    const lockedSNOB = await SNOWCONE_CONTRACT.callStatic["supply"]({gasLimit:100000}) / 10 ** 18;
    snobCircSupply = (await SNOB_CONTRACT.totalSupply() / 10 ** 18)-lockedSNOB;

    return snobCircSupply;
}

function getSnobCircSupply(){
   return snobCircSupply; 
}

async function loadMultiplePangolinPools(tokens, prices, pools) {
    let APRs = [];
    let tvl = 0;
    const infos = await Promise.all(pools.map(p =>
        loadPangolinPoolInfo(tokens, prices, p.abi, p.address, p.rewardTokenFunction, p.stakeTokenFunction,p.snowglobe)));
    for (const i of infos) {
        const weeklyAPR = i.usdPerWeek / i.staked_tvl * 100;
        const dailyAPR = weeklyAPR / 7;
        const yearlyAPR = weeklyAPR * 52;
        const dailyAPY = APYMath.APRToAPY(dailyAPR,Constants.ReinvestsADay,Constants.PerformanceFees,1);
        const weekAPY = APYMath.APRToAPY(weeklyAPR,Constants.ReinvestsADay,Constants.PerformanceFees,7);
        const yearlyAPY = APYMath.APRToAPY(yearlyAPR,Constants.ReinvestsADay,Constants.PerformanceFees,365);
        i.weeklyAPY = weekAPY;
        i.dailyAPY = dailyAPY;
        i.yearlyAPY = yearlyAPY;
        tvl += i.snow_tvl;
        APRs.push(i);
    };
    snowglobesTVL = tvl;
    snowglobesAPR = APRs;
}

function getSnowglobesTVL(){
    return snowglobesTVL;
}

async function loadPangolinPoolInfo(tokens, prices, stakingAbi, stakingAddress,
    rewardTokenFunction, stakeTokenFunction,snowglobeAddress) {
    const STAKING_POOL = new ethers.Contract(stakingAddress, stakingAbi, provider);

    if (!STAKING_POOL.callStatic[stakeTokenFunction]) {
        console.log("Couldn't find stake function ", stakeTokenFunction);
    }
    const stakeTokenAddress = await STAKING_POOL.callStatic[stakeTokenFunction]();

    const rewardTokenAddress = await STAKING_POOL.callStatic[rewardTokenFunction]();

    var stakeToken = await getAvaxToken(stakeTokenAddress, stakingAddress);

    stakeToken.staked = await STAKING_POOL.totalSupply() / 10 ** stakeToken.decimals;
    
    const SNOWGLOBE_TOKEN = new ethers.Contract(snowglobeAddress, SNOWGLOBE_ABI, provider);
    const ratio = await SNOWGLOBE_TOKEN.callStatic[`getRatio`]() / 10  ** stakeToken.decimals;
    stakeToken.stakedSnow = (await SNOWGLOBE_TOKEN.callStatic[`totalSupply`]());
    stakeToken.stakedSnow = (stakeToken.stakedSnow / 10 ** stakeToken.decimals) *ratio;

    var newPriceAddresses = stakeToken.tokens.filter(x =>
        !getParameterCaseInsensitive(prices, x));
    prices = await lookUpTokenPrices(newPriceAddresses);

    var newTokenAddresses = stakeToken.tokens.filter(x =>
        !getParameterCaseInsensitive(tokens, x));
    for (const address of newTokenAddresses) {
        tokens[address] = await getAvaxToken(address, stakingAddress);
    }
    if (!getParameterCaseInsensitive(tokens, rewardTokenAddress)) {
        tokens[rewardTokenAddress] = await getAvaxToken(rewardTokenAddress, stakingAddress);
    }
    const rewardToken = getParameterCaseInsensitive(tokens, rewardTokenAddress);

    const rewardTokenTicker = rewardToken.symbol;

    const poolPrices = getPoolPrices(tokens, prices, stakeToken, "avax");

    if (!poolPrices) {
        console.log(`Couldn't calculate prices for pool ${stakeTokenAddress}`);
        return null;
    }

    const stakeTokenTicker = poolPrices.stakeTokenTicker;

    const stakeTokenPrice =
        prices[stakeTokenAddress]?.usd ?? getParameterCaseInsensitive(prices, stakeTokenAddress)?.usd;
        
    const rewardTokenPrice = (lodash.filter(prices, function (o) { return o.address.toLowerCase() == rewardTokenAddress.toLowerCase() }))[0].usd;

    const periodFinish = await STAKING_POOL.periodFinish();
    const rewardRate = await STAKING_POOL.rewardRate();
    const weeklyRewards = (Date.now() / 1000 > periodFinish) ? 0 : rewardRate / 1e18 * 604800;

    const usdPerWeek = weeklyRewards * rewardTokenPrice;

    const staked_tvl = poolPrices.staked_tvl;
    const snow_tvl = poolPrices.snow_tvl;

    return {
        poolPrices,
        stakeTokenAddress,
        rewardTokenAddress,
        stakeTokenTicker,
        rewardTokenTicker,
        stakeTokenPrice,
        rewardTokenPrice,
        weeklyRewards,
        usdPerWeek,
        staked_tvl,
        snow_tvl
    }
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
    let tvlicequeen = 0;
    let aprs = [];
    for (i = 0; i < poolCount; i++) {
        if (poolPrices[i] && poolPrices[i].name) {
            let apr = printChefPool(chefAbi, chefAddress, prices, tokens, poolInfos[i], i, poolPrices[i],
                totalAllocPoints, rewardsPerWeek, rewardTokenTicker, rewardTokenAddress,
                pendingRewardsFunction, null, null, "avax")
            aprs.push(apr);
            aprs[aprs.length - 1].name = poolPrices[i].name;
            let snowglobe = lodash.find(snowglobesAPR,{stakeTokenTicker:poolPrices[i].name.substring('8')});
            aprs[aprs.length - 1].snowglobeDAPY = snowglobe.dailyAPY; 
            aprs[aprs.length - 1].snowglobeWAPY = snowglobe.weeklyAPY; 
            aprs[aprs.length - 1].snowglobeYAPY = snowglobe.yearlyAPY; 
            tvlicequeen += apr.totalStakedUsd;
        }
    }
    iceQueenTVL = tvlicequeen;
    iceQueenAPR = aprs;

}

function geticeQueenInfo() {
    return iceQueenAPR;
}

function geticeQueenTVL() {
    return iceQueenTVL;
}

function getSnowglobesPool() {
    return snowglobesAPR;
}

function getHarvestStatus() {
  return harvestStatus;
}


module.exports = { generateFarmingPoolsData,getSnobCircSupply, geticeQueenInfo, geticeQueenTVL,
  getSnowglobesPool,getSnowglobesTVL, getHarvestStatus, checkHarvesterJuice, loadSnobSupply  };

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
    var t0, p0, t1, p1;
    t0 = (lodash.filter(tokens, function (o) { return o.address.toLowerCase() == pool.token0.toLowerCase(); }))[0]; //getParameterCaseInsensitive(tokens, pool.token0);
    p0 = (lodash.filter(prices, function (o) { return o.address.toLowerCase() == pool.token0.toLowerCase(); }))[0].usd; //getParameterCaseInsensitive(prices, pool.token0)?.usd;
    t1 = (lodash.filter(tokens, function (o) { return o.address.toLowerCase() == pool.token1.toLowerCase(); }))[0];//getParameterCaseInsensitive(tokens, pool.token1);
    p1 = (lodash.filter(prices, function (o) { return o.address.toLowerCase() == pool.token1.toLowerCase(); }))[0].usd;
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
    var snow_tvl = pool.stakedSnow * price;
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
        snow_tvl:snow_tvl,
        staked_tvl: staked_tvl,
        stakeTokenTicker: stakeTokenTicker,
    }
}

function getPoolPrices(tokens, prices, pool, chain = "eth") {
    if (pool.token0 != null) return getPangoPrices(tokens, prices, pool);
    if (pool.token != null) return getWrapPrices(tokens, prices, pool);
    return getErc20Prices(prices, pool, chain);
}

function getWrapPrices(tokens, prices, pool) {
    const wrappedToken = pool.token;
    if (wrappedToken.token0 != null) { //Uniswap
        const pangoPrices = getPangoPrices(tokens, prices, wrappedToken);
        const name = `Wrapped ${pangoPrices.stakeTokenTicker}`;
        const price = (pool.balance / 10 ** wrappedToken.decimals) * pangoPrices.price / (pool.totalSupply / 10 ** pool.decimals);
        const tvl = pool.balance / 10 ** wrappedToken.decimals * price;
        const staked_tvl = pool.staked * price;

        prices[pool.address] = { usd: price };
        return {
            name: name,
            tvl: tvl,
            staked_tvl: staked_tvl,
            price: price,
            stakeTokenTicker: pool.symbol
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
        prices[pool.address] = { usd: price };
        return {
            name: pool.symbol,
            tvl: tvl,
            staked_tvl: staked_tvl,
            price: price,
            stakeTokenTicker: pool.symbol
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

async function getAvaxPangoPool(pool, poolAddress, stakingAddress) {
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
    (getTokenList()).forEach((element) => {
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


async function checkHarvesterJuice (client) {
  const provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
  const harvesterAVAX = await provider.getBalance(Constants.Harvester)/1e18;
  harvestStatus.AVAXQty = harvesterAVAX;
  if(harvesterAVAX < 5){
    harvestStatus.lowGas = true;
  }
  return {harvestStatus,client};

}
