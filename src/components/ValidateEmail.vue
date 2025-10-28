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
              <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
              <div class="text-h6 mb-2">Validation failed</div>
              <p class="text-body-1">{{ errorMessage }}</p>
              <p class="text-body-1 mt-2"><router-link to="/signin" class="primary text-decoration-none">Back to Sign in<v-icon icon="mdi-chevron-right"></v-icon></router-link></p>
              <v-btn 
                color="secondary" 
                size="large" 
                @click="retryValidation"
                class="mt-4 ml-2"
                v-if="canRetry"
              >
                Try Again
              </v-btn>
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
      loading: true,
      validationSuccess: false,
      errorMessage: '',
      canRetry: false,
      token: null
    }
  },
  computed: {
    getServerURL() {
      return this.$store.state.serverURL
    }
  },
  methods: {
    async validateEmail() {
      try {
        const response = await fetch(`${this.getServerURL}/auth/validate-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: this.token }),
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
        this.errorMessage = error.message
        this.canRetry = true
      } finally {
        this.loading = false
      }
    },
    retryValidation() {
      this.loading = true
      this.errorMessage = ''
      this.canRetry = false
      this.validateEmail()
    }
  },
  mounted() {
    // Récupérer le token depuis l'URL
    const urlParams = new URLSearchParams(window.location.search)
    this.token = urlParams.get('token')

    if (!this.token) {
      this.errorMessage = 'No validation token found in URL'
      this.loading = false
      this.canRetry = false
      return
    }

    this.validateEmail()
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>