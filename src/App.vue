<template>
    <v-app v-if="isLoggedIn" :dark="getDarkMode">
        <TheHeader></TheHeader>
        <v-content>
            <RouterView/>
        </v-content>
        <v-footer class="pr-4 mt-5">
            <v-spacer></v-spacer>
            <div class="caption">Bettex project &copy; {{ new Date().getFullYear() }}</div>
        </v-footer>
    </v-app>
    <v-app v-else>
        <BaseLogin/>
    </v-app>
</template>

<script>
    import {mapGetters, mapMutations} from "vuex";
    import BaseLogin from './components/BaseLogin';
    import TheHeader from './components/TheHeader';

    export default {
        computed: {
            ...mapGetters(['isLoggedIn', 'loggedUser', 'loginError', 'getDarkMode']),
        },

        components: {
            BaseLogin,
            TheHeader
        },
        methods: {

            ...mapMutations(['setLoginError']),
            goto(url) {
                this.$router.push(url)
            },
        },


    }
</script>


<style>
    html {
        min-width: 1280px;
        overflow: scroll;
    }

    .theme--light.application {
        background: #F9FAFC;

        background-image: linear-gradient(180deg, #edf2f8 2%, #F0F4F7 96%);


    }

    .theme--light.v-footer {
        background: transparent;

    }

    .theme--light .primary {
        /*color:red;*/
    }

    .theme--dark .primary {
        /*color:red;*/
    }

    .theme--dark {
        --v-primary-base: rgb(71, 96, 166);
        --v-accent-base: rgb(71, 96, 166);
    }

</style>
