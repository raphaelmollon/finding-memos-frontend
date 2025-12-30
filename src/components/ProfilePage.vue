<template>
  <v-container fluid>
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

    <!-- Preferences Section -->
    <v-row justify="center" class="mt-4">
      <v-col cols="6">
        <v-card class="mx-auto" title="Preferences">
          <v-card-text>
            <v-row align="center">
              <v-col cols="8">
                <div class="text-subtitle-1">Show Savoyeline Ticket Shortcut</div>
                <div class="text-caption text-grey">Display the quick access field in the toolbar to open Savoyeline tickets</div>
              </v-col>
              <v-col cols="4" class="text-right">
                <v-switch
                  v-model="showTicketField"
                  color="primary"
                  hide-details
                  inset
                  :loading="savingPreferences"
                  @change="savePreferences"
                ></v-switch>
              </v-col>
            </v-row>
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
import { mapGetters, mapActions } from 'vuex';
import EditProfileDialog from './profile/EditProfileDialog.vue';
import { preferences } from '@/plugins/preferences';
import _ from 'lodash';

export default {
  components: {
    EditProfileDialog
  },
  data() {
    return {
      dialog: false,
      editedProp: {},
      user: {},
      showTicketField: false,
      savingPreferences: false,
    };
  },
  computed: {
    ...mapGetters(['getServerURL'])
  },
  methods: {
    ...mapActions(['triggerSnackbar', 'updateShowTicketField']),
    savePreferences: _.debounce(async function() {
      try {
        this.savingPreferences = true;
        const response = await preferences.updateSection(this.getServerURL, 'general', {
          showTicketField: this.showTicketField,
        });
        if (response.ok) {
          // Update Vuex store to immediately reflect in App toolbar
          this.updateShowTicketField(this.showTicketField);
          this.triggerSnackbar("Preferences saved!");
        }
      } catch (error) {
        this.triggerSnackbar({ message: "Error: " + error, type: 'error' });
      } finally {
        this.savingPreferences = false;
      }
    }, 500),
    async loadPreferences() {
      try {
        const generalPrefs = await preferences.getSection(this.getServerURL, 'general');
        if (!_.isEmpty(generalPrefs)) {
          this.showTicketField = generalPrefs.showTicketField !== undefined ? generalPrefs.showTicketField : false;
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    },
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
        this.triggerSnackbar('Your modiciations have been saved!');
      } catch (error) {
        this.triggerSnackbar({ message: error.message, type: 'error' });
      }
    },
  },
  async mounted() {
    await this.fetchProfile();
    await this.loadPreferences();
  },
};
</script>

<style scoped>

</style>
