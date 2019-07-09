<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
  <v-data-table
    :headers="headers"
    :items="getReferralTransactions || []"
    class="elevation-1"
  >
    <template v-slot:items="props">
      <td>{{ props.item.key }}</td>
      <td>{{ props.item.level }}</td>
      <td>{{ props.item.amount / 100000000 }}</td>
      <td>{{ moment(props.item.timestamp).format('DD-MM-YYYY HH:mm') }}</td>
    </template>
  </v-data-table>
  </div>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import moment from 'moment';

    export default {
        computed: {
            ...mapGetters(['getReferralTransactions']),
        },
        methods: {
            ...mapActions(['fetchReferralTransactions']),
            moment(x) { return moment(x) },
        },
        mounted() {
          this.fetchReferralTransactions();
        },
        data () {
            return {
                headers: [
                    {
                        text: 'Key',
                        align: 'left',
                        value: 'key'
                    },
                    {
                        text: 'Level',
                        align: 'left',
                        value: 'level'
                    },
                    {
                        text: 'Amount',
                        align: 'left',
                        value: 'amount'
                    },
                    {
                        text: 'Time',
                        align: 'left',
                        value: 'timestamp'
                    },
                ],
            }
        }
    }
</script>
