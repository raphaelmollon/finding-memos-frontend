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

    <v-row>
      <v-col cols="6">
        <v-card
          prepend-avatar="https://cdn-icons-png.flaticon.com/512/3940/3940417.png"
          class="mx-auto"
          title="My information"
          subtitle="At least what I can see...">
          <template v-slot:append>
            <v-icon color="warning" icon="mdi-pencil" @click="openEditDialog(user)"></v-icon>
          </template>
          <v-card-text class="mx-auto">
            Email: {{ user.email }} <br/>
            Username: {{ user.username || "undefined" }} <br/>
            Status: {{ user.is_superuser ? "ADMIN" : "Regular user" }} <br/>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Edit {{ editedProp.email }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveProp">
            <v-text-field
              v-model="editedProp.email"
              label="Email"
              :rules="[v => !!v || 'Valid email is required']"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="green darken-1" text @click="saveProp">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
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
    async fetchProfile() {
      try {
        const response = await fetch(this.getServerURL + '/users/me', {
          credentials: 'include'  // include session cookie
        });
        if (!response.ok) {
          throw new Error('Failed to retrieve user information.');
        }
        const data = await response.json();
        console.log(data);
        this.user = data.user;
      } catch (error) {
        console.error('Error while retrieving user information:', error);
      }
    },
    openEditDialog(item) {
      console.log("OK!");
      this.editedProp = { ...item };
      this.dialog = true;
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
