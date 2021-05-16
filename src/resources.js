//Preset messages for the Bot
help = 'Bot made for **Snowball** DeFI platform.\n' +
    '*Powered by Avalanche Blockchain and it\'s community.*\n\n' +
    'Help commands:\n' +
    '**s!help cmd**   : Show command list.\n' +
    '**s!help links** : Show useful links about the exchange.\n' +
    '**s!help snowball**   : What\'s Snowball?';

links = '`Information`: \n' +
    '**Main Page**:  https://snowball.network/ \n' +
    '**Documentation**: https://snowballs.gitbook.io/snowball-docs/ \n' +
    '**Medium**: https://medium.com/snowball-finance \n\n' +
    '`App Links`: \n' +
    '**Stablevault**: https://app.snowball.network/stablevault \n' +
    '**Snowglobes**: https://app.snowball.network/compound \n' +
    '**IceQueen**: https://app.snowball.network/earn/ \n\n' +
    '`Community`: \n' +
    '**Discord Group**: https://discord.gg/BqYsZr3AVe \n' +
    '**Telegram**: http://t.me/throwsnowballs \n\n' +
    '`Feed`: \n' +
    '**Twitter**: https://twitter.com/throwsnowballs \n' +
    '**Github**: https://github.com/Snowball-Finance \n\n' +
    'Remember to always bookmark your urls (check for https).\n'+
    '**NEVER send your keys to anyone**.';

snowball = '**Snowball** is a decentralized protocol on **Avalanche** that launched in March of 2021.'+
    ' We provide auto-compounding services for liquidity pools on **Pangolin** and act as an automated '+
    'market maker (**AMM**) for stable assets. Our goal is to become one of the premier DeFi '+
    'projects on **Avalanche** by offering a diversity of competitive products. Visit our website '+
    'to start snowballing your rewards.';


function getMessage(messageName) {
    switch (messageName) {
        case 'help': return help;
        case 'links': return links;
        case 'snowball': return snowball;
    }
}

module.exports = {
    commandList: [] = ['help', 'snowglobes','stablevault','icequeen','info'],
    getMessage: getMessage,
    Constants: class {
        static snowballColor = 0x00aaff;
        static snowballLogo = 'https://i.imgur.com/8Y2j0LT.png';
        static explorerAdress = 'https://cchain.explorer.avax.network/';
        static pangolinGraphAddress = "https://api.thegraph.com/subgraphs/name/dasconnor/pangolin-dex";
        static USDTAVAXPairContract = "0x9ee0a4e21bd333a6bb2ab298194320b8daa26516";
        static DAIAVAXPairContract = "0x17a2e8275792b4616befb02eb9ae699aa0dcb94b";
        static PNGContract = "0x60781c2586d68229fde47564546784ab3faca982";
        static SNOBContract = "0xC38f41A296A4493Ff429F1238e030924A1542e50";
        static SNOBMaxSupply = 18000000;
        static ReinvestsADay = 6;
        static PerformanceFees = 10;
    }
}





