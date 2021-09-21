const { Client } = require('discord.js');
const { readFileSync } = require('fs');
const { checkCommand } = require('./src/utils.js');
const { retrieveAllTokensData, getTokenList, getAVAXValue, } = require('./src/graph.js');
const { runCommand, runWelcome, runRefreshAPYStaticChannel, runHarvesterOutOfGas } = require('./src/commands.js');
const { generateFarmingPoolsData, checkHarvesterJuice, loadSnobSupply, getSnobCircSupply } = require('./src/abicalls.js');
const lodash = require('lodash');

//Create instance of bot.
const client = new Client();

const enumStatus =  Object.freeze({
  price:0,
  mcap:1,
  percentLocked:2,
});
var currentStatus = enumStatus.price;


//Sync read to wait for settings
var settings = JSON.parse(readFileSync('./settings.json'));
console.log('Settings loaded!');
const botPrefix = settings.botprefix;

//Login with set token ID
client.login(settings.tokenid);


client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  //Create timer to refresh tokens data
  retrieveAllTokensData(client).then(async () => {
    await refreshHarvester(client);
    await refreshSNOBData(client);
    await generateFarmingPoolsData();
    if (settings.refreshAPY) {
      runRefreshAPYStaticChannel(client);
      setInterval(runRefreshAPYStaticChannel, 1800000, client);
    }
    console.log('Tokens loaded!');
  });
  setInterval(retrieveAllTokensData, settings.refreshTokenList, client);
  setInterval(refreshSNOBData, settings.refreshTokenList+30000, client); //give time to refresh tokendata
  setInterval(refreshHarvester, 28800000, client);
  setInterval(generateFarmingPoolsData, 1800000); //30 minutes to refresh apy to not spam ABI calls
});

client.on('guildMemberAdd', member => {
  runWelcome(settings, member);
});

//On message
client.on('message', msg => {
  //Store the content/text of the message
  let msgContent = msg.content;

  //Help Alternatives
  if (msgContent == botPrefix || (msgContent == '<@!' + client.user.id + '>')) {
    msgContent = `${botPrefix}help`;
  }

  //Check for valid command
  if (msgContent != null &&
    msgContent.startsWith(botPrefix)) {
    //Generates the command object with args
    let command = checkCommand(msgContent.substring(botPrefix.length));

    command.ValidCommand ? runCommand(command, msg, settings) : msg.reply('Sorry, invalid command.');
  }
});

async function refreshHarvester(client) {
  checkHarvesterJuice(client).then(
    (payload) => {
      if (payload.harvestStatus.lowGas) {
        runHarvesterOutOfGas(payload.client, payload.harvestStatus);
      }
    });
}

async function refreshSNOBData(client) {
  //update bot presence
  const { snobCircSupply, percentLocked } = await loadSnobSupply();
  const locked = `${percentLocked.toFixed(1)}% SNOB Locked`;
  const filteredResult = lodash.filter(getTokenList(), { "symbol": "SNOB" });
  const orderedResult = lodash.orderBy(filteredResult, ["totalLiquidity", "tradeVolume"], ['desc', 'desc']);
  const tokenPrice = (getAVAXValue() * orderedResult[0].derivedETH).toFixed(2);
  const mcap = `Total Mcap $${((tokenPrice * snobCircSupply)/1_000_000).toFixed(2)}M`;

  let relevantInformation;
  switch(currentStatus){
    case enumStatus.price:
      relevantInformation = `SNOB $${tokenPrice}`;
      currentStatus = enumStatus.mcap;
    break;
    case enumStatus.mcap:
      relevantInformation = mcap;
      currentStatus = enumStatus.percentLocked;
    break;
    case enumStatus.percentLocked:
      relevantInformation = locked;
      currentStatus = enumStatus.price;
    break;
  }
  client.user.setPresence({
    status: 'online',
    activity: {
      name: `${relevantInformation}`,
      type: "PLAYING"
    }
  });
}


