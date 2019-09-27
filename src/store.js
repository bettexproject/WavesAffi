import Vue from 'vue'
import Vuex from 'vuex'
import affiliateAPI from './libs/affiliate';
import * as _ from "lodash";
import BigNumber from 'bignumber.js';
import config from './config';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loggedUser: null,
    apiError: null,
    referralTransactions: null,
    myBalance: null,
    isKeeperInstalled: null,
    referrals: null,
    referer: null,
    withdrawTxs: null,
    darkMode: localStorage.getItem('darkMode') === 'true',
  },
  mutations: {
    setApiError: (state, value) => state.apiError = value,
    loginSuccess: (state, value) => state.loggedUser = value,
    updateReferralTransactions: (state, value) => state.referralTransactions = value,
    updateWithdrawTxs: (state, value) => state.withdrawTxs = value,
    updateMyBalance: (state, value) => state.myBalance = value,
    updateReferrals: (state, value) => state.referrals = value,
    updateReferer: (state, value) => state.referer = value,
    updateKeeperInstalled: (state, value) => state.isKeeperInstalled = value,
    toggleDarkMode: state => { state.darkMode = !state.darkMode; localStorage.setItem('darkMode', state.darkMode); },
  },
  actions: {
    login({ commit }) {
      if (!window.WavesKeeper) {
        commit('updateKeeperInstalled', !!window.WavesKeeper);
      } else {
        window.WavesKeeper.auth({ data: "Auth on my site" })
            .then(res => {
              commit('loginSuccess', res);
            })
            .catch(err => {
              commit('setApiError', err.message);
            });
      }
    },
    fetchReferrals({ commit, getters }) {
      affiliateAPI.fetchReferrals(getters.currentUserAddress)
          .then(res => commit('updateReferrals', res))
          .catch(err => commit('setApiError', err));
    },
    fetchReferer({ commit, getters }) {
      affiliateAPI.fetchReferer(getters.currentUserAddress)
          .then(res => commit('updateReferer', res || false))
          .catch(err => commit('setApiError', err));
    },
    fundAffiliate(d, { amount }) {
        affiliateAPI.fundAffilitate({ amount });
    },
    fetchReferralTransactions({ commit, getters }) {
      affiliateAPI.fetchReferralTransactions(getters.currentUserAddress)
          .then(res => commit('updateReferralTransactions', res))
          .catch(err => commit('setApiError', err));
    },
    fetchWithdrawTransactions({ commit, getters }) {
      affiliateAPI.fetchWithdrawTransactions(getters.currentUserAddress)
          .then(res => commit('updateWithdrawTxs', res))
          .catch(err => commit('setApiError', err));
    },
    fetchMyBalance({ commit, getters }) {
      affiliateAPI.fetchMyBalance(getters.currentUserAddress)
          .then(res => commit('updateMyBalance', res))
          .catch(err => commit('setApiError', err));
    },
    register({ getters } , { referer }) {
      return affiliateAPI.register(referer, getters.currentUserPublicKey);
    },
    withdraw({ getters }) {
      return affiliateAPI.withdraw(_.keys(getters.getMyBalance));
    }
  },
  getters: {
    isLoggedIn: state => !!state.loggedUser,
    loggedUser: state => state.loggedUser,
    loginError: state => state.loginError,
    getDarkMode: state => state.darkMode,
    currentUserAddress: (state, getters) => getters.loggedUser && getters.loggedUser.address,
    currentUserPublicKey: (state, getters) => getters.loggedUser && getters.loggedUser.publicKey,
    getReferralTransactions: state => state.referralTransactions,
    isKeeperInstalled: state => state.isKeeperInstalled,
    getMyBalance: state => state.myBalance,
    getReferrals: state => state.referrals,
    getReferer: state => state.referer,

    getWithdrawTxs: (state) => state.withdrawTxs,

    getTotalEarnings: (state, getters) => {
      let totalAmount = new BigNumber(0);
      _.forEach(getters.getReferralTransactions, tx => totalAmount = totalAmount.plus(tx.amount));
      return totalAmount.toString();
    },
    getCashbackEarnings: (state, getters) => {
        let totalAmount = new BigNumber(0);
        _.forEach(getters.getReferralTransactions, tx => {
            (tx.level === 'cashback') && (totalAmount = totalAmount.plus(tx.amount));
        });

        return totalAmount.toString();
    },

    getReferralsAwardList: (state, getters) => {
      const awardsByReferral = {};
      _.forEach(getters.getReferralTransactions, tx => {
          if (tx.level !== 'cashback') {
              awardsByReferral[tx.key] = awardsByReferral[tx.key] || {
                  key: tx.key,
                  totalAmount: '0',
                  lastActivity: 0,
                  counter: 0,
                  refLevels: {}
              };
              awardsByReferral[tx.key].lastActivity = Math.max(awardsByReferral[tx.key].lastActivity, tx.timestamp);
              awardsByReferral[tx.key].totalAmount = new BigNumber(awardsByReferral[tx.key].totalAmount)
                  .plus(tx.amount).toString();
              awardsByReferral[tx.key].counter += 1;
              awardsByReferral[tx.key].refLevels[tx.level] = tx.level;
          }
      });
      return awardsByReferral;
    },
    getActiveReferralsCount: (state, getters) => {
        return _.keys(getters.getReferralsAwardList)
            .filter(key => key !== getters.currentUserAddress)
            .length;
    },
    getTotalReferralsCount: (state, getters) => (getters.getReferrals || []).length,
    getReferralLink: (state, getters) => `${config.referralPrefix}${getters.currentUserAddress}`,
    getAllTxs: (state, getters) => {
        const allTxs = [];
        const withdrawTxs = getters.getWithdrawTxs;
        const referralTx = getters.getReferralTransactions;
        if (!withdrawTxs || !referralTx) {
            return null;
        }
        _.forEach(withdrawTxs, tx => {
            allTxs.push({
                type: 'Withdrawal',
                amount: tx.amount,
                timestamp: tx.timestamp,
                txId: tx.txId,
                asset: tx.asset,
            });
        });
        _.forEach(referralTx, tx => {
            allTxs.push({
                type: tx.level === 'cashback' ? 'Cashback' : 'Referral',
                amount: tx.amount,
                timestamp: tx.timestamp,
                txId: tx.txId,
                asset: tx.asset,
            });
        });

        return allTxs;
    }
  },
})
