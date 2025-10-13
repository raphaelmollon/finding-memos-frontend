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
              <v-toolbar-title>Users</v-toolbar-title>
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
          <template v-slot:[`item.is_superuser`]="{ item }">
            <v-switch :model-value="item.is_superuser" color="success" hide-details inset readonly></v-switch>
            <!-- {{ item.is_superuser }} -->
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn-group density="compact">
                <v-btn icon @click="openEditDialog('user', item)">
                  <v-icon color="warning">mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="openDeleteDialog('user', item)">
                  <v-icon color="error">mdi-delete</v-icon>
                </v-btn>
            </v-btn-group>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Edit Dialog -->
    <v-dialog v-model="eDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Edit {{ editedProp.email }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveProp">
            <v-text-field
              v-model="editedProp.is_superuser"
              label="Admin"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="closeEDialog">Cancel</v-btn>
          <v-btn color="green darken-1" text @click="saveEProp">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="dDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Rename {{ editedProp.type }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveProp">
            <v-text-field
              v-model="editedProp.name"
              label="Name"
              :rules="[v => !!v || 'Name is required']"
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
      users: [],
      headers: [
        { title: 'ID', value: 'id', align:'left' },
        { title: 'Email', value: 'email', align:'left' },
        { title: 'Username', value: 'username', align:'left' },
        { title: 'Admin?', value: 'is_superuser', align:'left' },
        { title: 'Preferences', value: 'preferences', align:'left' },
        { title: 'Settings', value: 'settings', align:'left' },
        { title: 'Actions', value: 'actions', align:'end', sortable: false },
      ],
      searchU: '',
    };
  },
  computed: {
    ...mapGetters(['getServerURL'])
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await fetch(this.getServerURL + '/users', {
          credentials: 'include'  // include session cookie
        });
        if (!response.ok) {
          throw new Error('Failed to retrieve users.');
        }
        const data = await response.json();
        // console.log(data);
        this.users = data;
      } catch (error) {
        console.error('Error while retrieving users:', error);
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>
