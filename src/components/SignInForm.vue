<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="text-center justify-center">
        <h1 class="text-h2 d-flex align-center text-center justify-center">
          <v-img
            class="my-6 mr-5"
            max-width="128"
            src="favicon_128.png"
          ></v-img>
          Finding Memos
        </h1>
        <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="800" rounded="lg">
          <v-card-title>To use this app, you need to be connected.</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="signIn">
              <v-text-field 
                v-model="email" 
                label="Email" 
                type="email" 
                required 
                variant="outlined" 
                autofocus
                prepend-inner-icon="mdi-email-outline"
              ></v-text-field>
              <v-text-field
                v-model="password" 
                label="Password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                variant="outlined"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
              ></v-text-field>
              <v-btn type="submit" variant="text" color="success" block>Sign In</v-btn>
            </v-form>
            <p class="text-body-1 mt-2">You don't have an account yet? <router-link to="/signup" class="primary text-decoration-none">Sign up here<v-icon icon="mdi-chevron-right"></v-icon></router-link></p>
            <p class="text-body-1 mt-2">New user, you didn't receive the validation email? 
              <a href="" class="primary text-decoration-none"
                @click.prevent="resendValidation">
                Ask for a new one here 
                <v-icon v-if="!resendLoading" icon="mdi-chevron-right"></v-icon>
                <v-progress-circular v-else indeterminate color="success"></v-progress-circular>
              </a>
            </p>
            <p class="text-body-1 mt-2">Old user, you forgot your password? Shit happens...
              <a href="" class="primary text-decoration-none"
                @click.prevent="forgotPassword">
                Reset it here 
                <v-icon v-if="!forgotPwdLoading" icon="mdi-chevron-right"></v-icon>
                <v-progress-circular v-else indeterminate color="success"></v-progress-circular>
              </a>
            </p>
          </v-card-text>
          <v-card-actions>Still need help ? Ask RAM</v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      resendLoading: false,
      forgotPwdLoading: false,
    };
  },
  computed: {
    ...mapGetters(['getServerURL'])
  },
  methods: {
    ...mapActions(['setUser', 'triggerSnackbar']), 
    async signIn() {
      try {
        const response = await fetch(this.getServerURL+'/auth/sign-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password }),
          credentials: 'include'  // Important for session cookies
        });
        const data = await response.json();
        if (!response.ok) throw new Error(`Invalid credentials: ${data.error}`);
        this.setUser(data.user);
        this.triggerSnackbar({ message: 'Welcome back ' + data.user.email + '!'})
        this.$router.push('/');
      } catch (error) {
        console.error(error);
        this.triggerSnackbar({ message: 'Sign in failed ! ' + error, type: 'error' });
      }
    },
    async resendValidation() {
      this.resendLoading = true;
      if (!this.email) {
        this.triggerSnackbar({
          message: 'Please enter your email address first',
          type: 'warning'
        })
        this.resendLoading = false;
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.triggerSnackbar({
          message: 'Please enter a valid email address',
          type: 'warning'
        })
        this.resendLoading = false;
        return
      }

      try {
        const response = await fetch(`${this.getServerURL}/auth/resend-validation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email }), // Use the already typed email
          credentials: 'include'
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to resend validation email')
        }

        this.triggerSnackbar({
          message: data.message || 'New validation email sent! Check your inbox.',
          type: 'success'
        })

      } catch (error) {
        console.error('Resend validation error:', error)
        this.triggerSnackbar({
          message: error.message,
          type: 'error'
        })
      } finally {
        this.resendLoading = false
      }
    },
    async forgotPassword() {
      this.forgotPwdLoading = true;
      if (!this.email) {
        this.triggerSnackbar({
          message: 'Please enter your email address first',
          type: 'warning'
        })
        this.forgotPwdLoading = false;
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.triggerSnackbar({
          message: 'Please enter a valid email address',
          type: 'warning'
        })
        this.forgotPwdLoading = false;
        return
      }

      try {
        const response = await fetch(`${this.getServerURL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email }),
          credentials: 'include'
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send password reset email')
        }

        this.triggerSnackbar({
          message: data.message || 'Password reset email sent! Check your inbox.',
          type: 'success'
        })

      } catch (error) {
        console.error('Send forgot password email error:', error)
        this.triggerSnackbar({
          message: error.message,
          type: 'error'
        })
      } finally {
        this.forgotPwdLoading = false
      }
    },
  },
};
</script>
