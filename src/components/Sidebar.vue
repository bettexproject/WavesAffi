<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <div class="sidebar ">
        <div class="sidebar-account mb-4">
            <div class="sidebar-title title mb-4 font-weight-light">Account</div>
            <div class="sidebar-balance mb-2" v-for="(balance, asset) in getMyBalance" :key="asset">{{ balance }} {{ asset }}</div>
            <v-btn :disabled="minimalBalance" @click="doWithdraw" class="ml-0 mb-2 mt-3 text-none font-weight-regular"
                   color="primary">Withdraw All
            </v-btn>
            <div v-show="minimalBalance">Min withdraw amount is {{ minWithdraw }} {{ affiliateAssetSymbol }}</div>
            <div class="caption" v-show="!minimalBalance">Coins will be sent to your address</div>
        </div>

        <!--<div class="v-divider mb-3 mt-3"></div>-->
        <div class="sidebar-referral mb-4">
            <div class="sidebar-title title mb-3 font-weight-light">Invite referrals</div>
            <div class="sidebar-referral__text caption mb-2">
                Click link to copy referral url
            </div>
            <div class="sidebar-referral__url text-truncate" @click.stop.prevent="copyLink">
                {{ getReferralLink.slice(7) }}
            </div>
            <div class="success--text caption d-none">Copied!</div>
            <input type="hidden" id="testing-code" :value="getReferralLink">
            <social-sharing :url="getReferralLink"
                            :description="description"
                            :title="description"
                            inline-template>
                <div class="share-list mt-3">
                    <network network="email">
                        <div class="fa fa-envelope" title="Email">
                        </div>
                    </network>
                    <network network="facebook">
                        <div class="fa fa-facebook" title="Facebook"></div>
                    </network>
                    <network network="telegram">
                        <div class="fa fa-telegram" title="Telegram"></div>
                    </network>
                    <network network="twitter">
                        <div class="fa fa-twitter" title="Twitter"></div>
                    </network>
                    <network network="vk">
                        <div class="fa fa-vk " title="VK"></div>
                    </network>
                </div>
            </social-sharing>
        </div>

        <div class="sidebar-statistic">
            <div class="title mb-3 font-weight-light">Statistic</div>
            <div class="sidebar-statistic-item mb-3">
                <div class="sidebar-statistic-item__title subheading">
                    Total direct referrals
                </div>
                <div class="sidebar-statistic-item__digit text--black">
                    {{ getTotalReferralsCount }}
                </div>
            </div>
            <div class="sidebar-statistic-item mb-3">
                <div class="sidebar-statistic-item__title subheading">
                    Active (sub)referrals
                </div>
                <div class="sidebar-statistic-item__digit text--black">
                    {{ getActiveReferralsCount }}
                </div>
            </div>
            <div class="sidebar-statistic-item mb-3">
                <div class="sidebar-statistic-item__title subheading">
                    Amount earned
                    <span>in {{ affiliateAssetSymbol }}</span>
                </div>
                <div class="sidebar-statistic-item__digit">
                    {{ getTotalEarnings }}
                </div>
            </div>
            <div class="sidebar-statistic-item mb-3">
                <div class="sidebar-statistic-item__title subheading">
                    Cashback earned
                    <span>in {{ affiliateAssetSymbol }}</span>
                </div>
                <div class="sidebar-statistic-item__digit">
                    {{ getCashbackEarnings }}
                </div>
            </div>
        </div>
        <!--<div class="v-divider"></div>-->
        <div class="sidebar-settings">
            <div class="title mb-2 font-weight-light">Settings</div>
            <div class="sidebar-settings-item">
                <div class="sidebar-settings-item__digit text--black">
                    <v-switch class="ma-0" v-model="darkMode"></v-switch>
                </div>
                <div class="sidebar-settings-item__title subheading">
                    Dark mode
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {mapGetters, mapActions, mapMutations} from 'vuex';
    import config from '../config';

    export default {
        computed: {
            ...mapGetters([
                'getMyBalance',
                'getActiveReferralsCount',
                'getTotalReferralsCount',
                'getTotalEarnings',
                'getReferralLink',
                'getDarkMode',
                'getCashbackEarnings',
            ]),
            minimalBalance() {
                return this.getMyBalance <= this.minWithdraw
            },
            minWithdraw() {
                return config.minWithdraw;
            },
            darkMode: {
                get() {
                    return this.getDarkMode;
                },
                set() {
                    this.toggleDarkMode();
                },
            },
        },
        methods: {
            ...mapActions(['withdraw']),
            ...mapMutations(['toggleDarkMode']),

            copyLink() {
                let testingCodeToCopy = document.querySelector('#testing-code');
                testingCodeToCopy.setAttribute('type', 'text');
                testingCodeToCopy.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                }
                testingCodeToCopy.setAttribute('type', 'hidden');
                window.getSelection().removeAllRanges();
                document.querySelector('.success--text').classList.remove('d-none');
            },
            doWithdraw() {
                this.withdraw();
            },
        },
        mounted() {
        },

        data() {
            return {
                affiliateAssetSymbol: config.affiliateAsset.symbol,
                switch1: false,
                switch2: false,
                description: "It's affiliate!"
            }
        }
    }

</script>
<style>
    .v-expansion-panel__header {
        padding: 0;
    }

    .fa {
        background: red;
        display: block;
        height: 40px;
        color: white;
        font-size: 16px;
        text-align: center;
        line-height: 40px;
    }

    .fa-vk {
        background: #507299;
    }

    .fa-facebook {
        background: #365899;
    }

    .fa-twitter {
        background: #1DA1F2;
    }

    .fa-telegram {
        background: #35A6DE;
    }

    .fa-envelope {
        background: #F26D1D;
    }

    .share-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .share-list span {
        display: inline-block;
        height: 40px;
        width: calc(100% / 4 - 9px);
        margin-bottom: 8px;
    }

    .theme--light.v-expansion-panel .v-expansion-panel__container {
        box-shadow: none;
    }

    .sidebar {
        min-width: 290px;
        width: 290px;
        margin-right: 25px;
        background: #FFFFFF;
        padding: 25px;
        /*border: 1px solid #DFDFDF;*/
        border-radius: 0 10px 10px 0;
    }

    .theme--dark .sidebar {
        background: #2a2a2a;
    }

    .sidebar-balance {
        font-size: 32px;
        color: #344C80;
        letter-spacing: 0.34px;
        line-height: 24px;
        font-weight: 600;
    }

    .sidebar-statistic-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .sidebar-statistic-item__title span {
        display: block;
        font-size: 14px;
        line-height: 14px;
        color: #C0C0C0;
        letter-spacing: 0;
    }

    .sidebar-statistic-item__digit {
        font-size: 16px;
        /*color: #181B18;*/
        letter-spacing: 0.15px;
        text-align: right;
        line-height: 24px;
        font-weight: 600;
    }

    .sidebar-settings {
        padding: 16px 0;
    }

    .sidebar-settings-item {
        display: flex;
        /*justify-content: space-between;*/
        align-items: self-start;
    }

    .sidebar-settings-item__title span {
        display: block;
        font-size: 14px;
        line-height: 14px;
        color: #C0C0C0;
        letter-spacing: 0;
    }

    .sidebar-settings-item__digit {
        font-size: 16px;
        color: #181B18;
        letter-spacing: 0.15px;
        text-align: right;
        line-height: 24px;
    }

    .sidebar-settings-item__title {
        line-height: 33px;
    }

    .sidebar-referral__url {
        font-size: 21px;
        color: var(--v-primary-base);
        letter-spacing: 0.45px;
        text-align: left;
        font-weight: 500;
        cursor: pointer;
    }


</style>