<template>
  <v-layout justify-center align-center class="mt-5">
    <v-flex xs6>

      <div v-if="hasReferer" class="join-success text-xs-center mt-5">
        <div class="display-2 mb-5">
          Nice! You are welcome
        </div>
        <div class="subheading mb-3 ">
          You are registered in our affiliate system as <span class="font-weight-medium">{{ currentUserPublicKey }}</span>
          <br/>
          under <span class="font-weight-medium">{{ getReferer }} member
        </span></div>
        <div class="caption"> You will be redirected to main site after {{ redirectTicks }} seconds</div>
      </div>
      <div v-else-if="hasReferer === false">
        <div v-if="miningInProgress" class="text-xs-center">
          <div class="display-2 mb-3">
            Mining proof of work..

          </div>
          <div class="subheading mb-3">
            Wait a minute

          </div>
          <v-progress-circular indeterminate color="primary"/>
        </div>
        <div v-else-if="registerInProgress">
          Waiting for confirmation
          <v-progress-circular indeterminate/>
        </div>

        <div v-else class="join-text text-xs-center">
          <div class="display-2 mb-3">
            Invite to the affiliate program
          </div>
          <div class="subheading ">
            Make money, get honey
          </div>
          <v-btn @click="doRegister" class="ml-0 mb-2 mt-3 text-none font-weight-regular" color="primary">Join
          </v-btn>
        </div>
      </div>

      <div v-if="error" class="join-text text-xs-center">
        <div class="display-2 red&#45;&#45;text">
          Ops
        </div>
        <div class="subheading mb-3 "> {{ error }}
        </div>
      </div>

    </v-flex>
  </v-layout>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import config from '../config';

    let registerCheckInerval = null;
    let redirectInterval = null;

    export default {
        computed: {
            ...mapGetters(['getReferer', 'currentUserPublicKey']),
            hasReferer() {
                const referer = this.getReferer;
                if (referer) {
                    this.setRedirectInterval();
                }
                return referer;
            },
        },
        methods: {
            ...mapActions(['fetchReferer', 'register']),
            redirectToMainProject() {
                window.location.href = config.projectRedirect;
            },
            clearCheckInterval() {
                this.registerInProgress = false;
                this.miningInProgress = false;
                if (registerCheckInerval) {
                    clearInterval(registerCheckInerval);
                }
            },
            clearRedirectInterval() {
                if (redirectInterval) {
                    clearInterval(redirectInterval);
                }
            },
            setRedirectInterval() {
                this.clearRedirectInterval();
                redirectInterval = setInterval(() => {
                    if (this.redirectTicks > 0) {
                        this.redirectTicks--;
                    } else {
                        this.redirectToMainProject();
                    }
                }, 1000);
            },
            createCheckInterval() {
                this.clearCheckInterval();
                registerCheckInerval = setInterval(() => {
                    this.fetchReferer();
                }, 5000);
                this.registerInProgress = true;
            },
            doRegister() {
                this.miningInProgress = true;
                this.error = false;
                this.register({referer: this.$route.params.referer})
                    .then(() => this.createCheckInterval())
                    .catch((error) => {
                        this.error = error.message || error;
                        this.clearCheckInterval()
                    });
            },
        },
        mounted() {
            this.fetchReferer();
        },
        beforeDestroy() {
            this.clearCheckInterval();
        },
        data() {
            return {
                miningInProgress: false,
                registerInProgress: false,
                redirectTicks: 15,
                error: false,
            };
        },
    };
</script>
