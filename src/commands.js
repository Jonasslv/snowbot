const { checkCooldown, makeEmbed, filterToken, formatCurrency } = require('./utils.js');
const { CommandRunner } = require('./objects.js');
const { getAVAXValue } = require('./graph.js');
const { readFileSync,writeFileSync } = require('fs');
const { geticeQueenInfo, geticeQueenTVL,getSnowglobesPool,getSnowglobesTVL,getSnobCircSupply } = require('./abicalls.js');
const { getMessage, Constants, commandList } = require('./resources.js');
const lodash = require('lodash');


function runCommand(command, msg, settings) {
    if (checkCooldown(msg, command.ReportedCommand, settings.cooldownMessage)) {
        switch (command.ReportedCommand) {
            //Help command
            case 'help':
                commandHelp(command, msg, settings);
                break;
            case 'snowglobes':
                commandSnowglobes(command,msg);
                break;
            case 'stablevault':
                commandDev(msg);
                break;
            case 'icequeen':
                commandIceQueen(command, msg);
                break;
            case 'info':
                commandInfo(command, msg);
                break;
        }
    }
}

async function runRefreshAPYStaticChannel(client){
    var settings = JSON.parse(readFileSync('./settings.json'));
    let channelAPY = await client.channels.fetch(settings.channelAPYID);
    if(!channelAPY){
        console.log('APY channel not found!');
        return;
    }
    let embedMSGicequeen = makeEmbed(commandIceQueen(null,null,true));
    let embedMSGsnowglobes = makeEmbed(commandSnowglobes(null,null,true)); 
    //check if has a message already sent
    if(settings.msgIDicequeen.length > 0){
        let msgicequeen = await channelAPY.messages.fetch(settings.msgIDicequeen);   
        msgicequeen.edit(embedMSGicequeen);
    }else{
        channelAPY.send(embedMSGicequeen).then((msg) =>{
            settings.msgIDicequeen = msg.id;
            writeFileSync('./settings.json',JSON.stringify(settings));
        });
    }
    //check if has a message already sent
    if(settings.msgIDsnowglobes.length > 0){
        let msgsnowglobes = await channelAPY.messages.fetch(settings.msgIDsnowglobes);
        msgsnowglobes.edit(embedMSGsnowglobes);
    }else{
        channelAPY.send(embedMSGsnowglobes).then((msg) =>{
            settings.msgIDsnowglobes = msg.id;
            writeFileSync('./settings.json',JSON.stringify(settings));
        });
    }
}

function commandSnowglobes(command, msg, staticMSG = false){
    if(!staticMSG){
        runApy = new CommandRunner(msg);
    }
    let pools = getSnowglobesPool();
    pools = lodash.orderBy(pools,["yearlyAPY"], ['desc']);
    if(pools.length > 0){
        let strPools = ``;
        let totalValue = 0;
        pools.forEach((element) =>{
            totalValue += Number(element.snow_tvl);
            strPools += `**${element.stakeTokenTicker}**\n`+
                        `**TVL:** ${formatCurrency(element.snow_tvl)}\n`+
                        `**APY D**:${element.dailyAPY.toFixed(2)}% **W**:${element.weeklyAPY.toFixed(2)}% **Y**:${element.yearlyAPY.toFixed(2)}%\n\n`
        });
        let embedObject = {
            Title: 'Snowglobes Top APY List',
            Color: Constants.snowballColor,
            Description: '**Snowglobes** Farming Pools ordered by APY% :farmer: :woman_farmer: :\n\n' +
                strPools+
                `**All Pools Value: ${formatCurrency(totalValue)}**`
        };
        if(!staticMSG){
            runApy.embed = embedObject;
            runApy.sendMessage();
        }else{
            return embedObject; 
        }
    }else{
        if(!staticMSG){
            msg.reply('Sorry no data has been found.');
        }
    }
}



function commandIceQueen(command, msg, staticMSG = false){
    if(!staticMSG){
        runApy = new CommandRunner(msg);
    }
    let pools = geticeQueenInfo();;
    pools = lodash.orderBy(pools,["snowglobeYAPY"], ['desc']);
    if(pools.length > 0){
        let strPools = ``;
        let totalValue = 0;
        pools.forEach((element) =>{
            totalValue += Number(element.totalStakedUsd);
            strPools += `**${element.name}**\n`+
                        `**TVL:** ${formatCurrency(element.totalStakedUsd)}\n`+
                        (element.name.startsWith('Wrapped') ?
                          `**APY D**:${element.snowglobeDAPY.toFixed(2)}% **W**:${element.snowglobeWAPY.toFixed(2)}% **Y**:${element.snowglobeYAPY.toFixed(2)}%\n`:'')+
                        `**SNOB APR D**:${element.dailyAPR.toFixed(2)}% **W**:${element.weeklyAPR.toFixed(2)}% **Y**:${element.yearlyAPR.toFixed(2)}%\n\n`
        });
        let embedObject = {
            Title: 'IceQueen Top APY List',
            Color: Constants.snowballColor,
            Description: '**IceQueen** Farming Pools ordered by APY% :farmer: :woman_farmer: :\n\n' +
                strPools+
                `\n**All Pools Value: ${formatCurrency(totalValue)}**`
        };
        if(!staticMSG){
            runApy.embed = embedObject;
            runApy.sendMessage();
        }else{
            return embedObject;
        }
    }else{
        if(!staticMSG){
            msg.reply('Sorry no data has been found.');
        }
    }
}


function commandDev(msg){
    msg.reply('Sorry command in development, try again later.')
}

function commandInfo(command, msg) {
    let filteredResult = filterToken('SNOB');
    if (filteredResult.length > 0) {
        let tokenPrice = (getAVAXValue() * filteredResult[0].derivedETH);
        let tokenVolume = (filteredResult[0].tradeVolume * tokenPrice).toFixed(2);
        let tokenLiquidity = (filteredResult[0].totalLiquidity * tokenPrice).toFixed(2);
        let totalMcap = (getSnobCircSupply()*tokenPrice).toFixed(2);
        let iceQueenTVL = geticeQueenTVL();
        let snowGlobesTVL = getSnowglobesTVL();
        runInfo = new CommandRunner(msg);
        //let recentValues = getSnowballRecent();
        let embedObject = {
            Title: 'Snowball Status Information',
            Color: Constants.snowballColor,
            Description: 'This is the stats for **Snowball**:\n\n' +
                `\`$SNOB\` Token (Pangolin Data):\n` +
                `**Price:** ${formatCurrency(tokenPrice)}\n` +
                `**Circ. Supply Marketcap:** ${formatCurrency(totalMcap)}\n` +
                `**Total Volume:** ${formatCurrency(tokenVolume)}\n` +
                `**Total Liquidity:** ${formatCurrency(tokenLiquidity)}\n\n`+
                `**TVL SnowGlobes:** ${formatCurrency(snowGlobesTVL-iceQueenTVL)}\n` +
                `**TVL StableVault:** TBD\n` +
                `**TVL IceQueen:** ${formatCurrency(iceQueenTVL)}\n\n`,
            Thumbnail: Constants.snowballLogo,
            Footer: `TVL: ${formatCurrency(snowGlobesTVL)}` 
        };
        runInfo.embed = embedObject;
        runInfo.sendMessage();
    }else{
        msg.reply('Sorry an error has being encountered.')
    }
}

function runWelcome(settings, member) {
    if (settings.sendWelcomeDM && member.guild.id == settings.snowballServerID) {
        member.user.createDM().then(channel => {
            let embedObject = {
                Title: 'Welcome to Snowball Community Discord!',
                Color: Constants.snowballColor,
                Description: 'Feel free to engage in conversations with our community!\n' +
                    'If you need any additional information use `s!help` here in DM or in #bot-commands!\n\n' +
                    getMessage('snowball'),
                Thumbnail: Constants.snowballLogo
            };
            channel.send(makeEmbed(embedObject));

        });
    }
}

function commandHelp(command, msg, settings) {
    runHelp = new CommandRunner(msg);
    //if the command is just help
    if (command.Args.trim().length == 0) {
        //Feed the command embed
        runHelp.embed = {
            Title: 'Snowball Bot',
            Description: getMessage('help'),
            Color: Constants.snowballColor,
            Thumbnail: Constants.snowballLogo
        }
        //send message
        runHelp.sendMessage();
    } else {

        //list of other help commands
        switch (command.Args.trim()) {
            case 'cmd':
                //Serialize command list
                let strList = '';
                commandList.forEach((element) => {
                    if (strList.length > 0) {
                        strList += ',';
                    }
                    strList += `\`${settings.botprefix}${element}\``;
                });

                runHelp.embed = {
                    Title: 'Snowball - Commands',
                    Description: '**Command List:**\n' +
                        strList,
                    Color: Constants.snowballColor
                }
                //send message
                runHelp.sendMessage();

                break;
            case 'links':
                //Feed the command embed
                runHelp.embed = {
                    Title: 'Snowball - Useful Links',
                    Description: getMessage('links'),
                    Color: Constants.snowballColor
                }
                //send message
                runHelp.sendMessage();
                break;
            case 'snowball':
                //Feed the command embed
                runHelp.embed = {
                    Title: 'What\'s Snowball?',
                    Description: getMessage('snowball'),
                    Color: Constants.snowballColor,
                    URL: 'https://snowball.network/'
                }
                //send message
                runHelp.sendMessage();
                break;
            default: messagesStrings
                msg.reply('Sorry, Invalid Command.');
        }
    }

}

module.exports = {
    runCommand: runCommand,
    runWelcome: runWelcome,
    runRefreshAPYStaticChannel:runRefreshAPYStaticChannel
}

