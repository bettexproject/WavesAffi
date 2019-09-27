import * as API from '@waves/waves-api';

export default {
    referralPrefix: 'http://affi.bettex.bet/join/',
    projectRedirect: 'http://dex.bettex.bet',
    restURL: 'https://dex.bettex.bet/node',

    explorerPrefix: 'https://wavesexplorer.com/tx/',
    affiliateContractAddress: '3PQBW97DGZsLzH3ayg5ke31LAaapixncg1N',
    minWithdraw: 0.01,
    refreshInterval: 30000,
    affiliateAsset: {
        decimalsPow: Math.pow(10, 8),
        symbol: 'BTXC',
    },
    fee: {
        assetId: 'WAVES',
        tokens: 0.005,
    },
    assetsDecimalMul: {
        BTXC: Math.pow(10, 8),
        WAVES: Math.pow(10, 8),
        USD: Math.pow(2, 8),
    },
    Waves: API.create(API.MAINNET_CONFIG),
};
