<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <div class="v-layout">
        <Sidebar/>
        <v-container grid-list-lg fluid pa-0 pr-4 ma-0>
            <v-layout row wrap align-content-start>
                <v-flex xs6 class="v-widget">
                    <div class="v-widget-wrapper">
                        <div class="widget-title  subheading font-weight-light mb-3 ">Total referral income</div>
                        <div class="v-chart">
                            <LineChart v-if="getAllTxs && getAllTxs.length" :chart-data="chartData"
                                       :options="chartOptions"/>
                            <div v-else class="v-chart-empty  text--accent-1 blue-grey--text lighten-5">
                                No data
                            </div>

                        </div>
                    </div>
                </v-flex>
                <v-flex xs6 class="v-widget">
                    <div class="v-widget-wrapper">
                        <div class="widget-title subheading font-weight-light mb-3">Transactions</div>
                        <v-chip
                                v-for="(mnemonic) in ['All', 'Referral', 'Cashback', 'Withdrawal']"
                                :key="mnemonic"
                                :color="txFilter === mnemonic ? 'primary' : 'default'"
                                @click="txFilter=mnemonic">{{ mnemonic }}
                        </v-chip>
                        <v-data-table
                                :headers="txHeaders"
                                :loading="!allTxsFiltered"
                                :items="allTxsFiltered || []"
                                :pagination.sync="txSort"
                                class=" mt-4"
                        >

                            <template v-slot:items="props">
                                <td class="text-xs-left">{{ moment(props.item.timestamp) }}
                                </td>
                                <td class="text-xs-left">{{ props.item.type }}</td>
                                <td class="text-xs-left">{{ props.item.amount }}</td>
                                <td class="text-xs-left"><a :href="`${explorerPrefix}${props.item.txId}`"
                                                            target="_blank">tx</a></td>
                            </template>
                        </v-data-table>
                    </div>
                </v-flex>
                <v-flex xs12 class="v-widget">
                    <div class="v-widget-wrapper">
                        <div class="widget-title subheading font-weight-light mb-3 ">Referred users</div>
                        <v-chip
                                :color="isAwardFilterEmpty ? 'primary' : 'default'"
                                @click="awardLevelFilters={}">All
                        </v-chip>
                        <v-chip
                                v-for="(mnemonic, key) in {l1: 'Level 1', l2: 'Level 2', l3: 'Level 3'}"
                                :color="awardLevelFilters[key] ? 'primary' : 'default'"
                                :key="key"
                                @click="toggleAwardLevelFilter(key)">{{ mnemonic }}
                        </v-chip>
                        <v-data-table
                                :headers="awardHeaders"
                                :items="awardList"
                                :pagination.sync="awardsSort"
                                class=" mt-4"
                        >
                            <template v-slot:items="props">
                                <td class="text-xs-left">{{ props.item.refLevels }}</td>
                                <td class="text-xs-left">{{ moment(props.item.lastActivity) }}</td>
                                <td class="text-xs-left">{{ props.item.key }}</td>
                                <td class="text-xs-left">{{ props.item.totalAmount }}</td>
                                <td class="text-xs-left">{{ props.item.counter }}</td>
                            </template>
                        </v-data-table>
                    </div>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import moment from "moment";
    import _ from 'lodash';
    import Vue from "vue";
    import LineChart from './LineChart';
    import Sidebar from './Sidebar';
    import config from '../config';

    let refreshInterval = null;

    export default {
        components: {
            Sidebar,
            LineChart,
        },
        methods: {
            ...mapActions(['fetchReferralTransactions', 'fetchReferrals', 'fetchWithdrawTransactions', 'fetchMyBalance']),
            toggleAwardLevelFilter(level) {
                Vue.set(this.awardLevelFilters, level, !this.awardLevelFilters[level]);
            },
            moment(x) {
                return moment(parseInt(x)).format('DD-MM-YYYY HH:mm');
            },
            refreshData() {
                this.fetchMyBalance();
                this.fetchReferralTransactions();
                this.fetchWithdrawTransactions();
                this.fetchReferrals();
            },
        },
        computed: {
            ...mapGetters(['getWithdrawTxs', 'getReferralsAwardList', 'getAllTxs', 'getReferralTransactions']),
            explorerPrefix() {
                return config.explorerPrefix;
            },
            chartData() {
                const labels = [];
                const data = [];
                const sortedTx = (this.getReferralTransactions || []).sort((a, b) => a.timestamp - b.timestamp)
                    .filter(tx => tx.level !== 'cashback');

                let aggregateSum = 0;
                _.forEach(sortedTx, tx => {
                    aggregateSum = Math.round((aggregateSum + tx.amount) * 100000000) / 100000000;
                    labels.push(moment(tx.timestamp).format('DD-MM-YYYY'));
                    data.push(aggregateSum);
                });

                return {
                    labels,
                    datasets: [
                        {
                            label: 'Total referral income',
                            backgroundColor: '#344C80',
                            data,
                        },
                    ],
                };
            },
            chartOptions() {
                return {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }],
                    },
                    legend: {
                        display: false
                    },
                }
            },
            allTxsFiltered() {
                const allTxs = this.getAllTxs;
                return allTxs && _.filter(allTxs, i => this.txFilter === 'All' || this.txFilter === i.type);
            },
            isAwardFilterEmpty() {
                let isEmpty = true;
                _.forEach(this.awardLevelFilters, f => isEmpty = isEmpty && !f);
                return isEmpty;
            },
            awardList() {
                return _.values(this.getReferralsAwardList)
                    .filter(i => {
                        if (this.isAwardFilterEmpty) {
                            return true;
                        }
                        let hasIntersections = false;
                        _.forEach(i.refLevels,
                            refLevel => hasIntersections = hasIntersections || this.awardLevelFilters[refLevel]);
                        return hasIntersections;
                    })
                    .map(i => ({...i, refLevels: _.keys(i.refLevels).join(',')}));
            },
        },
        mounted() {
            this.refreshData();
            refreshInterval = setInterval(() => this.refreshData(), config.refreshInterval);
        },
        beforeDestroy() {
            refreshInterval && clearInterval(refreshInterval);
        },
        data() {
            return {
                right: null,
                awardLevelFilters: {},
                txFilter: 'All',
                txHeaders: [
                    {text: 'date', value: 'timestamp'},
                    {text: 'type', value: 'type'},
                    {text: 'amount', value: 'amount'},
                    {text: 'tx id', value: 'txid'},
                ],
                txSort: {
                    descending: true,
                    sortBy: 'timestamp',
                },
                awardsSort: {
                    descending: true,
                    sortBy: 'lastActivity',
                },
                awardHeaders: [
                    {text: 'Ref level', value: 'refLevels'},
                    {text: 'Last activity', value: 'lastActivity'},
                    {text: 'User key', value: 'key'},
                    {text: 'Total amount', value: 'totalAmount'},
                    {text: 'Tx counter', value: 'counter'},
                ],
            }
        }
    }
</script>

<style>
    .v-layout {
        display: flex;
        align-items: flex-start;
        align-content: flex-start;
    }

    .v-content {
        display: flex;
        justify-content: space-between;
        padding-right: 32px;
    }

    .v-widget-wrapper {
        background: #FFFFFF;
        /*border: 1px solid #DFDFDF;*/
        border-radius: 8px;
        padding: 24px;
        height: 100%;
        position: relative;
    }

    .theme--dark .v-widget-wrapper {
        background: #2a2a2a;
    }

    .theme--dark .v-widget-wrapper div, .theme--dark .v-widget-wrapper .v-table {
        background: transparent !important;
    }

    table.v-table th {
        font-size: 10px;
        color: #292929;
        letter-spacing: 1.5px;
        line-height: 16px;
        text-transform: uppercase;
        padding: 0 !important;
        padding-left: 10px !important;
    }

    .v-table tbody td {
        padding-left: 10px !important;
    }


    .theme--light.v-table tbody tr:hover:not(.v-datatable__expand-row) {
        background: var(--v-secondary-lighten1);
    }

    .v-chart-empty {
        padding: 40px 0;
        text-align: center;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        height: max-content;

    }


    .theme--light.v-chip {
        background: transparent;
        color: black;
    }

    .theme--light.v-chip.primary {
        color: white;
    }

    .theme--dark.v-expansion-panel .v-expansion-panel__container {
        background: transparent;
    }
</style>
