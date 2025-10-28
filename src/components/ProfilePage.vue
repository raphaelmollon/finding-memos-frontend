<template>
  <v-container fluid>
    <v-snackbar v-model="snackbar" 
      :timeout="snackbarType === 'success' ? 2000 : 5000" 
      :color="snackbarType" 
      location="top"
    >
      <template v-slot:actions>
        <v-btn
          color="white"
          text
          @click="snackbar = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
      {{ snackbarMessage }}
    </v-snackbar>

    <v-row justify="center">
      <v-col cols="6">
        <v-card
          :prepend-avatar="getUserAvatarUrl(user.avatar)"
          class="mx-auto"
          title="My information"
          subtitle="At least what I can see...">
          <template v-slot:append>
            <v-icon color="warning" icon="mdi-pencil" @click="openEditDialog"></v-icon>
          </template>
          <v-card-text class="mx-auto">
            Email: {{ user.email }} <br/>
            Username: {{ user.username || "undefined" }} <br/>
            Status: {{ user.is_superuser ? "ADMIN" : "Regular user" }} <br/>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Profile Dialog -->
    <edit-profile-dialog
      ref="editDialog"
      :user="user"
      @profile-updated="onProfileUpdated"
    ></edit-profile-dialog>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import EditProfileDialog from './EditProfileDialog.vue';

export default {
  components: {
    EditProfileDialog
  },
  data() {
    return {
      snackbar: false,
      snackbarMessage: '',
      snackbarType: '',
      dialog: false,
      editedProp: {},
      user: {},
    };
  },
  computed: {
    ...mapGetters(['getServerURL'])
  },
  methods: {
    getUserAvatarUrl(filename) {
      // console.log(`${this.getServerURL}/static/avatars/${filename || '0.png'}`)
      return `${this.getServerURL}/static/avatars/${filename || '0.png'}`
    },
    async fetchProfile() {
      try {
        const response = await fetch(this.getServerURL + '/users/me', {
          credentials: 'include'  // include session cookie
        });
        if (!response.ok) {
          throw new Error('Failed to retrieve user information.');
        }
        const data = await response.json();
        // console.log(data);
        this.user = data.user;
      } catch (error) {
        console.error('Error while retrieving user information:', error);
      }
    },
    openEditDialog() {
      this.$refs.editDialog.openDialog()
    },
    onProfileUpdated() {
      this.fetchProfile() // Refresh user data
    },
    closeDialog() {
      this.dialog = false;
    },
    async saveProp() {
      if (!this.editedProp.email) {
        this.$refs.form.validate();
        return;
      }

      try {
        this.dialog = false;
        this.snackbarType = 'success';
        this.snackbar = true;

      } catch (error) {
        this.snackbarMessage = error.message;
        this.snackbarType = 'error';
        this.snackbar = true;
      }
    },
  },
  mounted() {
    this.fetchProfile();
  },
};
</script>

<style scoped>

</style>
