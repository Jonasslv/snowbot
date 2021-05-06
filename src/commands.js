const { checkCooldown, makeEmbed, filterToken, formatCurrency } = require('./utils.js');
const { CommandRunner } = require('./objects.js');
const { getAVAXValue } = require('./graph.js');
const { geticeQueenInfo, geticeQueenTVL } = require('./abicalls.js');
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
                commandDev(msg);
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

function commandIceQueen(command, msg){
    runApy = new CommandRunner(msg);
    let pools = geticeQueenInfo();;
    pools = lodash.orderBy(pools,["yearlyAPR"], ['desc']);
    if(pools.length > 0){
        let strPools = ``;
        let totalValue = 0;
        pools.forEach((element) =>{
            totalValue += Number(element.totalStakedUsd);
            strPools += `**${element.name}**\n`+
                        `**TVL:** ${formatCurrency(element.totalStakedUsd)}\n`+
                        `**APR D**:${element.dailyAPR.toFixed(2)}% **W**:${element.weeklyAPR.toFixed(2)}% **Y**:${element.yearlyAPR.toFixed(2)}%\n\n`
        });
        let embedObject = {
            Title: 'Snowball Top APR List',
            Color: Constants.snowballColor,
            Description: '**IceQueen** Farming Pools ordered by APR% :farmer: :woman_farmer: :\n\n' +
                strPools+
                `**All Pools Value:** ${formatCurrency(totalValue)}`
        };
        runApy.embed = embedObject;
        runApy.sendMessage();
    }else{
        msg.reply('Sorry no data has been found.')
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
        let totalMcap = (Constants.SNOBMaxSupply*tokenPrice).toFixed(2);
        let iceQueenTVL = geticeQueenTVL();
        runInfo = new CommandRunner(msg);
        //let recentValues = getSnowballRecent();
        let embedObject = {
            Title: 'Snowball Status Information',
            Color: Constants.snowballColor,
            Description: 'This is the stats for **Snowball**:\n\n' +
                `\`$SNOB\` Token (Pangolin Data):\n` +
                `**Price:** ${formatCurrency(tokenPrice)}\n` +
                `**Fully Diluted Mcap:** ${formatCurrency(totalMcap)}\n` +
                `**Total Volume:** ${formatCurrency(tokenVolume)}\n` +
                `**Total Liquidity:** ${formatCurrency(tokenLiquidity)}\n\n`+
                `**TVL SnowGlobes:** TBD\n` +
                `**TVL StableVault:** TBD\n` +
                `**TVL IceQueen:** ${formatCurrency(iceQueenTVL)}\n\n`,
            Thumbnail: Constants.snowballLogo
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
    runWelcome: runWelcome
}

