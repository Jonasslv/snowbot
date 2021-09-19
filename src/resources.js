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
    '**Stablevault**: https://beta.snowball.network/s4d-vault \n' +
    '**Compounding**: https://beta.snowball.network/compound-and-earn \n' +
    '`Community`: \n' +
    '**Discord Group**: https://discord.gg/BqYsZr3AVe \n' +
    '**Telegram**: http://t.me/throwsnowballs \n\n' +
    '`Feed`: \n' +
    '**Twitter**: https://twitter.com/snowballdefi \n' +
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
        static USDTAVAXPairContract = "0xe28984e1EE8D431346D32BeC9Ec800Efb643eef4";
        static DAIAVAXPairContract = "0xbA09679Ab223C6bdaf44D45Ba2d7279959289AB0";
        static PNGContract = "0x60781c2586d68229fde47564546784ab3faca982";
        static SNOBContract = "0xC38f41A296A4493Ff429F1238e030924A1542e50";
        static Harvester = "0x096a46142C199C940FfEBf34F0fe2F2d674fDB1F";
        static SNOWCONEContract = "0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E";
        static SNOBMaxSupply = 18000000;
        static ReinvestsADay = 6;
        static PerformanceFees = 10;
    }
}





