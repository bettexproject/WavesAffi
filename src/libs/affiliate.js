import axios from 'axios';
import config from '../config';
import { invokeScript } from '@waves/waves-transactions';
import _ from 'lodash';

const getDataByKey = async (key) => {
    try {
        const res = await axios.get(`${config.restURL}/addresses/data/${config.affiliateContractAddress}/${key}`);
        return res && res.data && res.data.value;
    } catch (e) {
        return null;
    }
};
const getDataByKeyPattern = async (pattern) => {
    try {
        const res = await axios.get(`${config.restURL}/addresses/data/${config.affiliateContractAddress}?matches=${pattern}`);
        return res && res.data;
    } catch (e) {
        return null;
    }
};

export default {
    /**
     * fetch referral transaction (including cashback)
     * @param userAddress
     * @returns Array {
     *  txId: id of fund transaction
     *  key: user address of transaction owner
     *  level: level of referral
     * }
     */
    fetchReferralTransactions: async (userAddress) => {
        const records = await getDataByKeyPattern(`fund_${userAddress}_.*`);
        return _.map(records, record => {
            const data = record.value.split(':');
            return {
                txId: record.key.split('_')[2],
                key: data[0],
                amount: data[1] / config.affiliateAsset.decimalsPow,
                level: data[2],
                timestamp: parseInt(data[3]),
            };
        });
    },
    /**
     * fetch withdraw transactions
     * @param userAddress
     * @returns Array {
     *     txId: id of withdraw tx
     *     amount: amount in tokens
     *     timestamp: timestamp of transaction
     * }
     */
    fetchWithdrawTransactions: async (userAddress) => {
        const records = await getDataByKeyPattern(`withdraw_${userAddress}_.*`);
        if (!records) {
            return records;
        }
        return _.map(records, record => {
            const data = record.value.split(':');
            return {
                txId: record.key.split('_')[2],
                amount: data[0] / config.affiliateAsset.decimalsPow,
                timestamp: parseInt(data[1]),
            };
        });
    },
    /**
     * fetch balance of address (in tokens)
     * @param userAddress
     * @returns {Promise<number>}
     */
    fetchMyBalance: async (userAddress) => {
        const balanceCoins = await getDataByKey(`${userAddress}_balance`);
        return balanceCoins ? balanceCoins / config.affiliateAsset.decimalsPow : 0;
    },
    /**
     * fetch list of referrals
     * @param userAddress
     * @returns referrals[]
     */
    fetchReferrals: async (userAddress) => {
        const referrals = await getDataByKeyPattern(`${userAddress}_referral_*.`);
        return _.map(referrals, referral => referral.value);
    },
    /**
     * fetch user referer
     * @param userAddress
     * @returns referrer
     */
    fetchReferer: async (userAddress) => {
        return await getDataByKey(`${userAddress}_referer`);
    },
    /**
     * withdraw all balance of user
     */
    withdraw: async () => {
        const tx2sign = {
            type: 16,
            data: {
                dApp: config.affiliateContractAddress,
                fee: config.fee,
                call: {
                    function: 'withdraw',
                    args: [],
                },
                payment: [],
            },
        };
        await window.WavesKeeper.signAndPublishTransaction(tx2sign);
    },
    /**
     * register user
     * @param referer
     * @param senderPublicKey
     * @returns {Promise<void>}
     */
    register: async (referer, senderPublicKey) => {
        const tx = await new Promise(resolve => {
            let salt = 0;
            const interval = setInterval(() => {
                const start = Date.now();
                while (Date.now() - start < 30) {
                    const tx = invokeScript({
                        fee: Math.round(config.fee.tokens * 100000000),
                        dApp: config.affiliateContractAddress,
                        chainId: 84,
                        call: {
                            args: [
                                {value: referer, type: 'string'},
                                {value: salt, type: 'integer'},
                            ],
                            function: 'register',
                        },
                        payment: [],
                        senderPublicKey,
                    });
                    if (tx.id.substring(0, 3) === '123') {
                        clearInterval(interval);
                        resolve(tx);
                    }
                    salt++;
                }
            }, 1);
        });

        const tx2sign = {
            type: tx.type,
            data: {
                dApp: tx.dApp,
                fee: config.fee,
                call: tx.call,
                payment: tx.payment,
                timestamp: tx.timestamp,
                proofs: tx.proofs,
            },
        };
        await window.WavesKeeper.signAndPublishTransaction(tx2sign);
    },
};
