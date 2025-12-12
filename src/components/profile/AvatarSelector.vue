<template>
  <v-dialog v-model="dialog" max-width="800px">
    <v-card
      title="Choose your Avatar"
      prepend-icon="mdi-account-circle">
      <template v-slot:append>
        <v-icon @click="dialog = false">mdi-close</v-icon>
      </template>
      
      <v-card-text>
        <v-row>
          <v-col
            v-for="avatar in avatars"
            :key="avatar.filename"
            
            cols="auto"
            style="min-width: 12.5%; flex-basis: 12.5%"
          >
            <v-card
              :class="['avatar-card', { 'selected-avatar': selectedAvatar === avatar.filename }]"
              @click="selectAvatar(avatar)"
              variant="outlined"
            >
              <v-img
                :src="getAvatarUrl(avatar.filename)"
                :alt="avatar.filename"
                aspect-ratio="1"
                
                cover
              ></v-img>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text >Cancel</v-btn>
      </v-card-actions> -->
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AvatarSelector',
  props: {
    currentAvatar: String
  },
  data() {
    return {
      dialog: false,
      avatars: [],
      selectedAvatar: this.currentAvatar || '',
      loading: false
    }
  },
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.loadAvatars()
      }
    }
  },
  methods: {
    async loadAvatars() {
      try {
        const response = await this.$store.dispatch('fetchAvatars')
        this.avatars = response.avatars || []
      } catch (error) {
        console.error('Error loading avatars:', error)
        this.$store.dispatch('showSnackbar', {
          message: 'Error loading avatars',
          type: 'error'
        })
      }
    },
    getAvatarUrl(filename) {
      return `${this.$store.state.serverURL}/static/avatars/${filename}`
    },
    selectAvatar(avatar) {
      this.selectedAvatar = avatar.filename
      this.$emit('avatar-updated', this.selectedAvatar)
      this.dialog = false
    },
    openDialog() {
      this.selectedAvatar = this.currentAvatar || ''
      this.dialog = true  
    }
  }
}
</script>

<style scoped>
.avatar-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-card:hover {
  transform: scale(1.05);
}

.selected-avatar {
  border: 3px solid #4F46E5 !important;
  transform: scale(1.05);
}
</style>