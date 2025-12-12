<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="users"
          :search="searchU"
          class="elevation-1"
          :items-per-page="10"
          item-key="id"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Users Management</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="searchU"
                prepend-inner-icon="mdi-magnify"
                label="Search"
                single-line
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-toolbar>
          </template>
          
          <!-- Avatar and Email -->
          <template v-slot:[`item.email`]="{ item }">
            <div class="d-flex align-center">
              <v-avatar :image="getUserAvatarUrl(item.avatar)" size="32" class="mr-2"></v-avatar>
              {{ item.email }}
            </div>
          </template>

          <!-- Status with colored badge -->
          <template v-slot:[`item.status`]="{ item }">
            <v-chip :color="getStatusColor(item.status)" size="small">
              {{ item.status }}
            </v-chip>
          </template>

          <!-- Switch Admin with direction edition -->
          <template v-slot:[`item.is_superuser`]="{ item }">
            <v-switch 
              v-model="item.is_superuser" 
              color="success" 
              hide-details 
              inset
              @change="toggleAdminStatus(item)"
            ></v-switch>
          </template>

          <!-- Formatted dates -->
          <template v-slot:[`item.created_at`]="{ item }">
            {{ formatDate(item.created_at) }}
          </template>

          <template v-slot:[`item.updated_at`]="{ item }">
            {{ formatDate(item.updated_at) }}
          </template>

          <!-- Actions -->
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn-group>
              <v-btn 
                icon 
                @click="openEditDialog(item)"
                size="small"
                color="warning"
              >
                <v-icon>mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="top">Edit User</v-tooltip>
              </v-btn>
              <v-btn 
                icon 
                @click="openDeleteDialog(item)"
                size="small"
                color="error"
                :disabled="item.id === currentUserId"
              >
                <v-icon>mdi-delete</v-icon>
                <v-tooltip activator="parent" location="top">Delete User</v-tooltip>
              </v-btn>
            </v-btn-group>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Edit User Dialog -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Edit User {{ editedUser.email }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="editForm">
            <v-text-field
              v-model="editedUser.username"
              label="Username"
              variant="outlined"
              class="mb-4"
            ></v-text-field>
            
            <v-select
              v-model="editedUser.status"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              class="mb-4"
            ></v-select>

            <v-checkbox
              v-model="editedUser.is_superuser"
              label="Administrator"
              color="success"
            ></v-checkbox>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="closeEditDialog">Cancel</v-btn>
          <v-btn color="green darken-1" text @click="saveUser" :loading="loading">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <DeleteDialog v-model="deleteDialog"
      thingLabel="User" :thing="editedUser.email"
      @confirm-delete="deleteUser"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import DeleteDialog from './common/DeleteDialog.vue';

export default {
  name: 'AdminPage',
  components: {
    DeleteDialog,
  },
  data() {
    return {
      
      users: [],
      headers: [
        { title: 'ID', value: 'id', align: 'left', width: '80px' },
        { title: 'Email', value: 'email', align: 'left' },
        { title: 'Username', value: 'username', align: 'left' },
        { title: 'Status', value: 'status', align: 'left' },
        { title: 'Admin', value: 'is_superuser', align: 'left', width: '100px' },
        { title: 'Created', value: 'created_at', align: 'left' },
        { title: 'Updated', value: 'updated_at', align: 'left' },
        { title: 'Actions', value: 'actions', align: 'end', sortable: false, width: '180px' },
      ],
      searchU: '',
      editDialog: false,
      deleteDialog: false,
      loading: false,
      editedUser: {},
      originalUser: {},
      statusOptions: [
        { title: 'NEW', value: 'NEW' },
        { title: 'VALID', value: 'VALID' },
        { title: 'CLOSED', value: 'CLOSED' }
      ],
      currentUserId: null
    };
  },
  computed: {
    ...mapGetters(['getServerURL'])
  },
  methods: {
    ...mapActions(['triggerSnackbar']),
    async fetchUsers() {
      try {
        const response = await fetch(this.getServerURL + '/users', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to retrieve users.');
        }
        const data = await response.json();
        this.users = data;
      } catch (error) {
        console.error('Error while retrieving users:', error);
        this.triggerSnackbar({message:'Failed to load users', type:'error'});
      }
    },

    async fetchCurrentUser() {
      try {
        const response = await fetch(this.getServerURL + '/users/me', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          this.currentUserId = data.user.id;
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    },

    getUserAvatarUrl(filename) {
      return `${this.getServerURL}/static/avatars/${filename || '0.png'}`;
    },

    getStatusColor(status) {
      const colors = {
        'NEW': 'warning',
        'VALID': 'success',
        'CLOSED': 'error'
      };
      return colors[status] || 'grey';
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);

      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }).replace(/ /, ' at ');
    },

    // Edit User
    openEditDialog(user) {
      this.editedUser = { ...user };
      this.originalUser = { ...user };
      this.editDialog = true;
    },

    closeEditDialog() {
      this.editDialog = false;
      this.editedUser = {};
      this.originalUser = {};
    },

    async saveUser() {
      this.loading = true;
      try {
        const response = await fetch(`${this.getServerURL}/users/${this.editedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            username: this.editedUser.username,
            status: this.editedUser.status,
            is_superuser: this.editedUser.is_superuser
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update user');
        }

        this.triggerSnackbar('User updated successfully');
        this.fetchUsers();
        this.closeEditDialog();
      } catch (error) {
        console.error('Error updating user:', error);
        this.triggerSnackbar({message:error.message, type:'error'});
      } finally {
        this.loading = false;
      }
    },

    // Toggle Admin Status (direct switch)
    async toggleAdminStatus(user) {
      try {
        const response = await fetch(`${this.getServerURL}/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            is_superuser: user.is_superuser
          })
        });

        if (!response.ok) {
          // Revert the switch if failed
          user.is_superuser = !user.is_superuser;
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update admin status');
        }

        this.triggerSnackbar(`Admin status ${user.is_superuser ? 'granted' : 'revoked'}`);
      } catch (error) {
        console.error('Error toggling admin status:', error);
        this.triggerSnackbar({message:error.message, type:'error'});
      }
    },

    // Delete User
    openDeleteDialog(user) {
      this.editedUser = { ...user };
      this.deleteDialog = true;
    },

    closeDeleteDialog() {
      this.deleteDialog = false;
      this.editedUser = {};
    },

    async deleteUser() {
      this.loading = true;
      try {
        const response = await fetch(`${this.getServerURL}/users/${this.editedUser.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete user');
        }

        this.triggerSnackbar('User deleted successfully');
        this.fetchUsers();
        this.closeDeleteDialog();
      } catch (error) {
        console.error('Error deleting user:', error);
        this.triggerSnackbar({message:error.message, type:'error'});
      } finally {
        this.loading = false;
      }
    },
  },
  async mounted() {
    await this.fetchCurrentUser();
    this.fetchUsers();
  },
};
</script>

<style scoped>
.v-data-table {
  margin-top: 20px;
}
</style>