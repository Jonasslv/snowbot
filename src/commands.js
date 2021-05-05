const { checkCooldown, makeEmbed, filterToken, formatFloat } = require('./utils.js');
const { CommandRunner } = require('./objects.js');
const { getAVAXValue } = require('./graph.js');
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
                commandDev(msg);
                break;
            case 'info':
                commandInfo(command, msg);
                break;
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
        runInfo = new CommandRunner(msg);
        //let recentValues = getSnowballRecent();
        let embedObject = {
            Title: 'Snowball Status Information',
            Color: Constants.snowballColor,
            Description: 'This is the stats for **Snowball**:\n\n' +
                `**Total Value Locked SnowGlobes:** TBD\n` +
                `**Total Value Locked StableVault:** TBD\n` +
                `**Total Value Locked IceQueen:** TBD\n\n` +
                `\`$SNOB\` Token:\n` +
                `**Price:** $${formatFloat(tokenPrice)}\n` +
                `**Total Volume:** $${tokenVolume}\n` +
                `**Total Liquidity:** $${tokenLiquidity}\n\n`,
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
                    getMessage('links'),
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

