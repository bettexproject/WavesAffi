import * as API from '@waves/waves-api';

export default {
    referralPrefix: 'http://localhost:8080/join/',
    projectRedirect: 'http://localhost:3000',
    restURL: 'https://testnode1.wavesnodes.com',
    explorerPrefix: 'https://wavesexplorer.com/testnet/tx/',
    affiliateContractAddress: '3MqSVVMsPLhbavWyUu81TPFCXs5a5c1vuHz',
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
    Waves: API.create(API.TESTNET_CONFIG),
};
