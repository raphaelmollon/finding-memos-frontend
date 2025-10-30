<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-center">
            <v-icon color="primary" size="64" class="mb-4">mdi-email-check</v-icon>
            <div class="text-h4">Email Validation</div>
          </v-card-title>

          <v-card-text class="text-center">
            <div v-if="loading" class="my-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              ></v-progress-circular>
              <div class="text-h6 mt-4">Validating your email...</div>
            </div>

            <div v-else-if="validationSuccess" class="my-8">
              <v-icon color="success" size="64" class="mb-4">mdi-check-circle</v-icon>
              <div class="text-h6 mb-2">Email validated successfully!</div>
              <p class="text-body-1">You can now sign in to your account.</p>
              <v-btn 
                color="primary" 
                size="large" 
                @click="$router.push('/signin')"
                class="mt-4"
              >
                Sign In
              </v-btn>
            </div>

            <div v-else class="my-8">
              <v-icon color="error" size="64" class="mb-4">mdi-shield-lock</v-icon>
              <div class="text-h6 mb-2">Confirm your account</div>
              <p class="text-body-1 mb-4">Please enter your password to activate your account</p>

              <v-form @submit.prevent="validateEmail">
                <v-text-field
                  v-model="password"
                  label="Password"
                  type="password"
                  required
                  variant="outlined"
                  class="mb-4"
                  :error-messages="passwordErrors"
                ></v-text-field>

                <v-btn 
                  type="submit"
                  color="primary" 
                  size="large" 
                  block
                  :loading="loading"
                  :disabled="!password"
                >
                  Activate Account
                </v-btn>
              </v-form>

              <div class="text-center mt-4">
                <v-btn 
                  text 
                  color="secondary" 
                  @click="$router.push('/signin')"
                >
                  Back to Sign In
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'ValidateEmail',
  data() {
    return {
      password: '',
      loading: false,
      validationSuccess: false,
      errorMessage: '',
      canRetry: false,
      token: null
    }
  },
  computed: {
    getServerURL() {
      return this.$store.state.serverURL
    },
    passwordErrors() {
      if (!this.password) return ['Password is required']
      return []
    },
  },
  methods: {
    async validateEmail() {
      this.loading = true;
      try {
        const response = await fetch(`${this.getServerURL}/auth/validate-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: this.token,
            password: this.password,
          }),
          credentials: 'include'
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Validation failed')
        }

        this.validationSuccess = true
        this.$store.dispatch('triggerSnackbar', {
          message: data.message || 'Email validated successfully!',
          type: 'success'
        })

      } catch (error) {
        console.error('Email validation error:', error)
        this.$store.dispatch('triggerSnackbar', {
                  message: error.message,
                  type: 'error'
        })
      } finally {
        this.loading = false
      }
    },
  },
  mounted() {
    // Récupérer le token depuis l'URL
    const urlParams = new URLSearchParams(window.location.search)
    this.token = urlParams.get('token')

    if (!this.token) {
      this.$store.dispatch('triggerSnackbar', {
        message: 'No validation token found',
        type: 'error'
      })
      this.$router.push('/signin')
    }
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>