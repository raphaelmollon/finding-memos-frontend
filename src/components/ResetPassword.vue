<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-center">
            <v-icon color="primary" size="64" class="mb-4">mdi-key</v-icon>
            <div class="text-h4">Set New Password</div>
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="resetPassword">
              <v-text-field
                v-model="newPassword"
                label="New Password"
                :type="showPassword ? 'text' : 'password'" 
                required
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
              ></v-text-field>

              <v-text-field
                v-model="confirmPassword"
                label="Confirm New Password"
                :type="showPassword ? 'text' : 'password'" 
                required
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                :error="!passwordsMatch && confirmPassword !== ''"
                :error-messages="!passwordsMatch && confirmPassword !== '' ? 'Passwords do not match' : ''"
              ></v-text-field>

              <v-btn 
                type="submit" 
                :loading="loading"
                :disabled="!passwordsMatch" variant="text" color="success" block
              >
                Reset Password
              </v-btn>
            </v-form>

            <p class="text-body-1 mt-2"><router-link to="/signin" class="primary text-decoration-none">Back to Sign in<v-icon icon="mdi-chevron-right"></v-icon></router-link></p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ResetPassword',
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      loading: false,
      token: null,
      showPassword: false,
    }
  },
  computed: {
    getServerURL() {
      return this.$store.state.serverURL
    },
    passwordsMatch() {
      return this.newPassword === this.confirmPassword
    }
  },
  methods: {
    ...mapActions(['triggerSnackbar']),
    async resetPassword() {
      if (!this.passwordsMatch) {
        this.triggerSnackbar({ message: 'Passwords do not match', type: 'error' });
        return
      }

      if (this.newPassword.length < 8) {
        this.triggerSnackbar({ message: 'Password must be at least 8 characters long', type: 'error' });
        return
      }

      this.loading = true
      try {
        const response = await fetch(`${this.getServerURL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            token: this.token,
            new_password: this.newPassword 
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to reset password')
        }

        this.triggerSnackbar(data.message || 'Password reset successfully!');

        this.$router.push('/signin')

      } catch (error) {
        console.error('Reset password error:', error)
        this.triggerSnackbar({ message: error.message, type: 'error' });
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    // Récupérer le token depuis l'URL
    const urlParams = new URLSearchParams(window.location.search)
    this.token = urlParams.get('token')

    if (!this.token) {
      this.triggerSnackbar({ message: 'No reset token found in URL', type: 'error' });
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