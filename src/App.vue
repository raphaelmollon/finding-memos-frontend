<template>
  <v-app>
    <v-snackbar v-model="$store.state.snackbar" :timeout="$store.state.snackbarType === 'success' ? 3000 : 6000"
      :color="$store.state.snackbarType" location="top" timer="darkgrey">
      <template v-slot:actions>
        <v-btn color="white" text @click="$store.commit('hideSnackbar')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
      <v-icon left>
        {{ $store.state.snackbarType === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
      </v-icon>
      {{ $store.state.snackbarMessage }}
    </v-snackbar>

    <v-app-bar app image="vcard_background.webp">
      <template v-slot:prepend>
        <v-avatar class="mx-2" image="favicon_128.png" max-height="40" max-width="40" contain style="cursor: pointer" @click="$router.push('/')"></v-avatar>
      </template>
      <v-toolbar-title style="cursor: pointer" @click="$router.push('/')">
        <!-- <v-img class="mx-2" src="favicon_128.png" max-height="40" max-width="40" contain></v-img> -->
        {{ documentTitle }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items v-if="!loading">
        <v-btn v-if="isAuthenticated" :to="{ name: 'Memos' }">Memos</v-btn>
        <v-btn v-if="isAuthenticated" :to="{ name: 'Connections' }">Connections</v-btn>
        <v-btn v-if="isAuthenticated" :to="{ name: 'Procedures' }">Recovery Procedures</v-btn>
        <v-btn v-if="isAuthenticated" :to="{ name: 'StringTools' }">String Tools</v-btn>
        <v-btn v-if="isAuthenticated && isSuperuser" :to="{ name: 'CategoriesTypes' }">Categories/Types</v-btn>
        <v-btn v-if="isAuthenticated && isSuperuser" :to="{ name: 'AdminPage' }">Administration</v-btn>
        <v-btn v-if="!isAuthenticated" :to="{ name: 'SignIn' }">Sign in</v-btn>
        <v-btn v-if="!isAuthenticated" :to="{ name: 'SignUp' }">Sign up</v-btn>
        <v-btn v-if="isAuthenticated" :to="{ name: 'ProfilePage' }"><v-icon>mdi-account</v-icon></v-btn>
        <v-btn v-if="isAuthenticated" @click="signOut"><v-icon color="error">mdi-lock-outline</v-icon></v-btn>
      </v-toolbar-items>
    </v-app-bar>


    <v-main v-if="loading" class="d-flex align-center justify-center" style="min-height: 300px;">
      <v-progress-circular indeterminate size="64" color="light-blue"></v-progress-circular>
    </v-main>
    <v-main v-else>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>


<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'App',

  components: {
  },

  data: () => ({
    documentTitle: "Finding Memos",
    loading:true,
  }),

  computed: {
    ...mapGetters(['isAuthenticated', 'isSuperuser', 'getUser', 'getServerURL']),
  },

  methods: {
    ...mapActions(['triggerSnackbar']),
    async signOut() {
      const response = await fetch(this.getServerURL+'/auth/sign-out', {
        method: 'POST',
        credentials: 'include'  // include session cookie
      });

      if (response.ok) {
        this.triggerSnackbar({message: 'Good bye!'})
      }
      this.$router.push('/signin');
    },
  },

  mounted() {
    document.title = this.documentTitle;
    this.loading = false;
  }
}
</script>
