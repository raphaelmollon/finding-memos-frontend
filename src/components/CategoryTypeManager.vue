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
            <p>
                <strong><em>Note:</em></strong> Categories and Types can <u>not</u> be added or deleted here as they are automatically managed depending on Memos using them.
                Although, you can rename them here, which will affect all Memos they reference.<br/>Feel free to create any Category or Type of your choice by just typing 
                their name while creating/updating a Memo.
            </p>
        </v-col>
    </v-row>
    <v-row>
      <!-- Categories -->
      <v-col cols="12" md="6">
        <v-data-table
          :headers="headers"
          :items="categories"
          :search="searchC"
          class="elevation-1"
          :items-per-page="10"
          item-key="id"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Category Management</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="searchC"
                prepend-inner-icon="mdi-magnify"
                label="Search"
                single-line
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-toolbar>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn-group>
                <v-btn icon @click="openEditDialog('category', item)">
                <v-icon color="warning">mdi-pencil</v-icon>
                </v-btn>
            </v-btn-group>
          </template>
        </v-data-table>
      </v-col>
      <!-- Types -->
      <v-col cols="12" md="6">
        <v-data-table
          :headers="headers"
          :items="types"
          :search="searchT"
          class="elevation-1"
          :items-per-page="10"
          item-key="id"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Types Management</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="searchT"
                prepend-inner-icon="mdi-magnify"
                label="Search"
                single-line
                variant="outlined"
                hide-details
              ></v-text-field>
            </v-toolbar>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn-group>
                <v-btn icon @click="openEditDialog('type', item)">
                <v-icon color="warning">mdi-pencil</v-icon>
                </v-btn>
            </v-btn-group>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
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
      categories: [],
      types: [],
      headers: [
        { title: 'ID', value: 'id', align:'left' },
        { title: 'Name', value: 'name', align:'left' },
        { title: 'Actions', value: 'actions', align:'end', sortable: false },
      ],
      searchC: '',
      searchT: '',
      dialog: false,
      editedProp: {},
      snackbar: false,
      snackbarMessage: '',
      snackbarType: '',
    };
  },
  computed: {
    ...mapGetters(['getServerURL'])
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await fetch(this.getServerURL+'/categories', {
          credentials: 'include'  // include session cookie
        });
        if (!response.ok) {
          throw new Error('Failed to retrieve categories.');
        }
        const data = await response.json();
        this.categories = data;
      } catch (error) {
        console.error('Error while retrieving categories:', error);
      }
    },
    async fetchTypes() {
      try {
        const response = await fetch(this.getServerURL+'/types', {
          credentials: 'include'  // include session cookie
        });
        if (!response.ok) {
          throw new Error('Failed to retrieve types.');
        }
        const data = await response.json();
        this.types = data;
      } catch (error) {
        console.error('Error while retrieving types:', error);
      }
    },
    openEditDialog(type, item) {
      this.editedProp = { ...item, type: type };
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    async saveProp() {
      if (!this.editedProp.name) {
        this.$refs.form.validate();
        return;
      }

      try {
        switch (this.editedProp.type) {
          case 'category':
            await this.saveCategory();
            this.fetchCategories();
            this.snackbarMessage = 'Category renamed successfully!';
            break;
          case 'type':
            await this.saveType();
            this.fetchTypes();
            this.snackbarMessage = 'Type renamed successfully!';
            break;
        }
        this.dialog = false;
        this.snackbarType = 'success';
        this.snackbar = true;

      } catch (error) {
        this.snackbarMessage = error.message;
        this.snackbarType = 'error';
        this.snackbar = true;
      }
    },

    async saveCategory() {
      try {
        let response;
        response = await fetch(this.getServerURL+`/categories/${this.editedProp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.editedProp),
          credentials: 'include'  // include session cookie
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save the category.');
        }
      } catch (error) {
        console.error('Failed while updating category:', error);
        this.snackbarMessage = error.message;
        this.snackbarType = 'error';
        this.snackbar = true;
      }
    },
    async saveType() {
      try {
        let response;
        response = await fetch(this.getServerURL+`/types/${this.editedProp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.editedProp),
          credentials: 'include'  // include session cookie
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save the type.');
        }
      } catch (error) {
        console.error('Failed while updating type:', error);
        this.snackbarMessage = error.message;
        this.snackbarType = 'error';
        this.snackbar = true;
      }
    },
  },
  mounted() {
    this.fetchCategories();
    this.fetchTypes();
  },
};
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
