<template>
  <v-dialog v-model="dialog" max-width="800px" @keydown.esc="handleEscape">
    <v-card>
      <v-card-title>
        <span class="headline">Edit Profile</span>
      </v-card-title>
      
      <v-card-text>
        <v-form ref="form">
          <!-- Avatar Section -->
          <div class="avatar-section mb-4">
            <v-label class="mb-2">Avatar</v-label>
            <div class="d-flex align-center">
              <v-avatar size="64" class="mr-4"
                @click="openAvatarSelector"
                @mouseenter="showOverlay = !escapePressed"
                @mouseleave="showOverlay = false"
                style="cursor: pointer;"
              >
                <v-img :src="getAvatarUrl(editedUser.avatar)"></v-img>
                <v-overlay
                  :model-value="showOverlay && !escapePressed"
                  contained
                  class="align-center justify-center"
                  scrim="rgba(0,0,0,0.6)"
                >
                  <v-icon color="white" size="24">mdi-pencil</v-icon>
                </v-overlay>
              </v-avatar>
              <span class="text-caption text-medium-emphasis">Click to change</span>
            </div>
          </div>

          <!-- Username Field -->
          <v-text-field
            v-model="editedUser.username"
            label="Username"
            variant="outlined"
          ></v-text-field>

          <!-- Password Change Section -->
          <v-expansion-panels>
            <v-expansion-panel title="Change Password">
              <v-expansion-panel-text>
                <v-text-field
                  v-model="passwordData.old_password"
                  label="Current Password"
                  type="password"
                  variant="outlined"
                ></v-text-field>
                <v-text-field
                  v-model="passwordData.password"
                  label="New Password"
                  type="password"
                  variant="outlined"
                ></v-text-field>
                <v-text-field
                  v-model="passwordData.confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  variant="outlined"
                ></v-text-field>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-1" text @click="closeDialog">Cancel</v-btn>
        <v-btn color="green darken-1" text @click="saveProfile" :loading="loading">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <avatar-selector
    ref="avatarSelector"
    :current-avatar="editedUser.avatar"
    @avatar-updated="onAvatarUpdated"
  ></avatar-selector>
</template>

<script>
import AvatarSelector from './AvatarSelector.vue'
import { mapActions } from 'vuex'

export default {
  name: 'EditProfileDialog',
  components: {
    AvatarSelector
  },
  props: {
    user: Object
    },
  emits: ['profile-updated'],
  data() {
    return {
      dialog: false,
      loading: false,
      showOverlay: false,
      escapePressed: false,
      editedUser: {},
      passwordData: {
        old_password: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    ...mapActions(['triggerSnackbar']),
    openDialog() {
      this.editedUser = { ...this.user }
      this.passwordData = {
        old_password: '',
        password: '',
        confirmPassword: ''
      }
      this.showOverlay = false
      this.escapePressed = false
      this.dialog = true
    },
    closeDialog() {
      this.showOverlay = false
      this.dialog = false
    },
    handleEscape() {
      this.escapePressed = true
      this.showOverlay = false
      setTimeout(() => {
        this.closeDialog()
      }, 10)
    },
    handleEscapeForOverlay() {
      console.log("test")
      this.closeDialog()
    },
    getAvatarUrl(filename) {
      return `${this.$store.state.serverURL}/static/avatars/${filename || '0.png'}`
      },
      openAvatarSelector() {
      this.showOverlay = false
      this.$refs.avatarSelector.openDialog()
    },
    onAvatarUpdated(newAvatar) {
      this.editedUser.avatar = newAvatar
      this.showOverlay = false
    },
    async saveProfile() {
      this.loading = true
      try {
        const profileData = {
          username: this.editedUser.username,
          avatar: this.editedUser.avatar
        }

        // Add password if changing
        if (this.passwordData.password) {
          if (this.passwordData.password !== this.passwordData.confirmPassword) {
            throw new Error('New passwords do not match')
          }
          profileData.password = this.passwordData.password
          profileData.old_password = this.passwordData.old_password
        }

        await this.$store.dispatch('updateUserProfile', profileData)
        this.$emit('profile-updated')
        this.closeDialog()
      } catch (error) {
        this.triggerSnackbar({message: error.message, type: 'error'});
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.clickable-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.clickable-avatar:hover {
  transform: scale(1.05);
}
</style>