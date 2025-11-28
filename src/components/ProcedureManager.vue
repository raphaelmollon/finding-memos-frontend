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

    <!-- Search bar -->
    <v-row>
      <v-col cols="12" offset-xl="3" xl="6" offset-lg="2" lg="8" offset-md="1" md="10" class="my-0 pb-0">
        <v-text-field
          v-model="searchTerm"
          placeholder="Search"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hint="Research looks into names"
          hide-details="true"
          clearable
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Options -->
    <v-row class="align-content-center justify-center">
      <v-col cols="auto" class="align-content-center justify-center">
        <v-switch v-model="defaultDisplay" :label="defaultDisplay?'Show all the connections':'Show only if URL exists'" 
          inset color="success" hide-details="true" class="py-0"></v-switch>
      </v-col>
    </v-row>

    <!-- Nb connections + Btn Add -->
    <v-row v-if="!loadingConnections">
      <v-col class="align-content-end justify-start" order="4" order-sm="1">
        {{ filteredConnectionsCount }} connection{{ filteredConnectionsCount > 1 ? "s" : "" }} found:
      </v-col>
      <v-col class="align-content-center justify-start" order="1" order-sm="2">
        <v-badge right color="success" class="mr-7" offset-x="-12" dot><span>Savoyeline genuine</span></v-badge>
        <v-badge right color="primary" class="mr-7" offset-x="-12" dot><span>Savoyeline recalculated</span></v-badge>
        <v-badge right color="warning" offset-x="-12" dot><span>Fully invented</span></v-badge>
      </v-col>
      <v-col cols="12" sm="auto" class="align-content-end justify-end" order="3" order-sm="4">
        <v-btn color="success" @click="openConnectionDialog('add')" prepend-icon="mdi-plus" block>
          Add
        </v-btn>
      </v-col>
    </v-row>

    <!-- Connection list -->
    <v-row v-if="loadingConnections" class="mt-6">
      <v-col cols="12" class="text-center mt-6">
        <v-progress-circular
          indeterminate
          color="primary"
          :size="128"
        ></v-progress-circular>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-data-table
        :headers="headers"
        :items="filteredConnections"
        :item-key="server_id"
        density="compact"
        :items-per-page="50"
        fixed-header
        :fixed-footer="true"
        striped="odd"
      >
        <template v-slot:[`item.application`]="{ item }">
          {{ item.company_name }} / {{ item.site_name }} / {{ item.application_name }}
        </template>

        <template v-slot:[`item.server`]="{ item }">
          {{ item.server_ip }} ({{ item.server_type }})
        </template>

        <template v-slot:[`item.url_value`]="{ item }">
          <v-badge location="top right" :color="item.color" dot :offset-x="-12" v-if="item.url_value">
            <a :href="item.url_value" target="_blank">{{ item.url_value }}</a>
          </v-badge>
        </template>

        <template v-slot:[`item.credentials`]="{ item }">
          <v-badge location="top right" :color="item.color" dot :offset-x="-12" v-if="item.url_user || item.url_pwd">
            {{ item.url_user }} {{(item.url_user || item.url_pwd) ? "/" : "-"}} {{ item.url_pwd }}
          </v-badge>
        </template>

        <template v-slot:[`item.comments`]="{ item }">
          {{ item.comments_short }}
        </template>
      </v-data-table>
    </v-row>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" width="auto">
      <v-card class="ma-2">
        <v-card-title>Are you sure you want to delete this connection?</v-card-title>
        <v-card-actions>
          <v-btn color="green darken-1" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red darken-1" text @click="deleteConnection">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Update Dialog -->
    <v-dialog v-model="connectionDialog" max-width="80%">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ connectionDialogMode === 'add' ? 'Add connection' : 'Update connection' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="submitConnection">
            <v-text-field
              v-model="newConnection.name"
              placeholder="Connection name"
              :rules="[v => !!v || 'Name is required']"
              required
              variant="outlined"
              :autofocus="true"
              label="Name"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="connectionDialog = false" :disabled="submittingConnection">
            Cancel
          </v-btn>
          <v-btn color="success" text @click="submitConnection" :disabled="!newConnection.name || !newConnection.content || !newConnection.category_name || !newConnection.type_name || submittingConnection" :loading="submittingConnection">
            {{ connectionDialogMode === 'add' ? 'Add' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
// import { Editor, EditorContent } from '@tiptap/vue-3'
// import Placeholder from '@tiptap/extension-placeholder'
// import StarterKit from '@tiptap/starter-kit'
// import Underline from '@tiptap/extension-underline'
import { mapGetters } from 'vuex';
// import connectionsData from '@/assets/connections.json';

function stripHtml(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

export default {
  components: {
    // TiptapEditor: EditorContent,
  },
  data() {
    return {
      defaultDisplay: false,
      useParams: false,
      connections: [],  // Connection list
      flatConnections: [],
      headers: [
        // { title: 'Groupe', key: 'company_name' },
        // { title: 'Site', key: 'site_name' },
        { title: 'Application', key: 'application' },
        { title: 'Server', key: 'server' },
        { title: 'URL type', key: 'url_type' },
        { title: 'URL', key: 'url_value' },
        { title: 'Credentials', key: 'credentials' },

        { title: 'Comments', key: 'comments' }
      ],
      groupBy: [
        {
          key: 'company_name',
          order: 'asc',
        },
        {
          key: 'site_name',
          order: 'asc',
        },
        {
          key: 'application_name',
          order: 'asc',
        },
      ],
      searchTerm: '',
      newConnection: {
        name: '',
        description: '',
        content: '',
        category_name: null,
        type_name: null,
      },
      snackbar: false, // To display the snackbar
      snackbarMessage: '', // Snackbar's message
      snackbarType: 'success', // Default color for snackbar ('success' or 'error')
      deleteDialog: false,    // To display the Delete Connection Dialog
      currentConnectionId: null,    // Connection ID for modification/suppression
      connectionDialog: false,      // To display the Connection Form Dialog
      connectionDialogMode: 'add',       // 'add' or 'edit' to determiner current action
      editor: null,
      loadingConnections: false,
      submittingConnection: false,
    };
  },
  computed: {
    ...mapGetters(['getServerURL']),
    filteredConnections() {
      if (this.searchTerm && this.searchTerm !== null) {
        const searchTerms = this.searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);

        let filtered = this.flatConnections.filter(connection => {
          const searchableText = [
            connection.company_name,
            connection.site_name,
            connection.application_name,
            connection.server_ip,
            connection.server_type,
            connection.url_type,
            connection.url_value,
          ].join(' ').toLowerCase();

          return searchTerms.every(term => searchableText.includes(term));
        });

        if (this.defaultDisplay)
          return filtered;
        else
          return filtered.filter(f => f.url_value)
      } else {
        if (this.defaultDisplay)
          return this.flatConnections;
        else
          return this.flatConnections.filter(f => f.url_value)
      }
      
    },
    filteredConnectionsCount() {
      return this.filteredConnections.length;
    },
  },
  methods: {
    truncate(str, length) {
      if (str) {
        if (typeof str === 'string') {
          if (str.length < length) return str;
          return str.substring(0, 47) + '...';
        }
        return "ERROR";
      }
      return;
    },
    flattenConnections(data) {
      const flattened = [];
      
      data.connections.forEach(company => {
        company.sites.forEach(site => {
          site.applications.forEach(application => {
            application.servers.forEach(server => {
              server.urls.forEach(url => {
                // Créer un objet plat pour chaque application
                const flatEntry = {
                  // Niveau entreprise
                  company_name: company.company_name,
                  
                  // Niveau site
                  site_name: site.site_name,
                  
                  // Niveau application
                  application_name: application.application_name,
                  application_last_update: application.application_last_update,
                  connection_last_update: application.connection_last_update,
                  comments: application.comments,
                  comments_short: this.truncate(application.comments, 50),
                  comment_urls: application.comment_urls || [],
                  application_service: url.service,
                  
                  server_ip: server.ip,
                  server_last_update: server.last_update,
                  server_type: url.server_type,

                  url_id: url.id,
                  url_last_update: url.last_update,
                  url_mode: url.mode,
                  url_type: url.url_type,
                  url_value: url.url,
                  url_user: url.user,
                  url_pwd: url.pwd,

                  color: url.mode == "classic" ? "success" : (url.mode == "recalculated" ? "primary" : (url.mode == "extrapolated" ? "warning" : "error")),
                };
                
                flattened.push(flatEntry);
              });
            });
          });
        });
      });
      
      return flattened;
    },
    // async fetchConnections() {
    //   this.loadingConnections = true;
    //   try {
    //     const response = await fetch(this.getServerURL+'/connections', {
    //       credentials: 'include'  // include session cookie
    //     });
    //     if (!response.ok) {
    //       throw new Error('Failed to fetch connections. Status code: '+response.status);
    //     }
    //     const connections = await response.json();

    //     // Add display property to each connection
    //     connections.forEach(connection => {
    //       connection.display = this.defaultDisplay;
    //       connection.displayDesc = false;
    //     });


    //     // Sort connections by Category name, then by Connection name
    //     connections.sort((a, b) => {
    //       // Compare Category names
    //       const categoryComparison = a.category_name.localeCompare(b.category_name, 'fr', { ignorePunctuation: true });

    //       if (categoryComparison !== 0) {
    //         // If Categories are different, sort by Category name
    //         return categoryComparison;
    //       } else {
    //         // If Categories are the same, sort by Connection name
    //         return a.name.localeCompare(b.name, 'fr', { ignorePunctuation: true });
    //       }
    //     });

    //     this.connections = connections;
    //   } catch (error) {
    //     console.error("Error while fetching connections:", error);
    //     throw error;
    //   } finally {
    //     this.loadingConnections = false;
    //   }
    // },
    // updateSelectedFilters() {
    //   // Update selectedCategories
    //   const validCategoryIds = new Set(this.categories.map(category => category.id));
    //   this.selectedCategories = this.selectedCategories.filter(categoryId => validCategoryIds.has(categoryId));

    //   // Update selectedTypes
    //   const validTypeIds = new Set(this.types.map(type => type.id));
    //   this.selectedTypes = this.selectedTypes.filter(typeId => validTypeIds.has(typeId));
    // },
    // In methods where you need to refresh data
    // async refreshData() {
    //   try {
    //     await Promise.all([this.fetchCategories(), this.fetchTypes(), this.fetchConnections()]);
    //     this.updateSelectedFilters();
    //   } catch (error) {
    //     console.error("Error while refreshing data:", error);
    //     // Handle error accordingly
    //   }
    // },

    async addConnection() {
      try {
        const response = await fetch(this.getServerURL+'/connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newConnection),
          credentials: 'include'  // include session cookie
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add the connection');
        }
      } catch (error) {
        console.error("Error while adding connection :", error);
        throw error;
      }
    },
    async updateConnection() {
      try {
        const response = await fetch(this.getServerURL+`/connections/${this.currentConnectionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newConnection),
          credentials: 'include'  // include session cookie
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update the connection');
        }
      } catch (error) {
        console.error("Error while updating connection :", error);
        throw error;
      }
    },
    async submitConnection() {
      // this.newConnection.description = this.newConnection.description.match(/<(\w+)><\/\1>/g) ? "" : this.newConnection.description;  // check empty markup

      // let oldDescription = this.newConnection.description;
      // if (oldDescription === this.defaultDescription)
      //   this.newConnection.description = "";
      this.submittingConnection = true; // Lock the button during treatment

      const descriptionText = stripHtml(this.newConnection.description).trim();
      if (!descriptionText /*|| descriptionText === this.defaultDescription*/) {
        this.newConnection.description = '';
      }

      if (!this.newConnection.name || !this.newConnection.content || !this.newConnection.category_name || !this.newConnection.type_name) {
        this.snackbarMessage = "Please fill in all required fields.";
        this.snackbarType = 'error';
        this.snackbar = true;
        return;
      }
  
      try {
        if (this.connectionDialogMode === 'add') {
          console.debug("Adding a connection...")
          await this.addConnection(); // Add a new connection
        } else if (this.connectionDialogMode === 'edit') {
          console.debug("Modifying a connection...")
          await this.updateConnection(); // Update an existing connection
        }
        // If everything went fine, close the dialog
        this.connectionDialog = false;
        this.newConnection = { name: '', description: '', content: '', category_name: '', type_name: '' }; // Reset the form

        // Display a success message
        this.snackbarMessage = this.connectionDialogMode === 'add' ? 'Connection added successfully !' : 'Connection updated successfully !';
        this.snackbarType = 'success';
        this.snackbar = true;

      } catch (error) {
        // If something wrong happened
        console.error("Error while submitting connection :", error);
        this.snackbarMessage = "An error occured. Please check your information. More details in the console.";
        this.snackbarType = 'error';
        this.snackbar = true;

        // We don't close the dialog, instead we redisplay the same old form
        // this.newConnection.description = !descriptionText ? this.defaultDescription : this.newConnection.description;

      } finally {
        this.submittingConnection = false;
        try {
          await this.refreshData();
        } catch (error) {
          // Normally the error is already logged, but let's display a clear message
          this.snackbarMessage = error;
          this.snackbarType = 'error';
          this.snackbar = true;
        }
      }
    },

    showDeleteDialog(id) {
      this.deleteDialog = true;
      this.currentConnectionId = id;
    },
    async deleteConnection() {
      let id = this.currentConnectionId;
      this.deleteDialog = false;
      try {
        const response = await fetch(this.getServerURL+`/connections/${id}`, {
          method: 'DELETE',
          credentials: 'include'  // include session cookie
        });
        // Display a success message
        this.snackbarMessage = 'Connection deleted successfully !';
        this.snackbarType = 'success';
        this.snackbar = true;

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete the connection');
        }
        await this.refreshData();
      } catch (error) {
        console.error("Error while deleting connection :", error);
        this.snackbarMessage = error;
        this.snackbarType = 'error';
        this.snackbar = true;
      }
    },

    copyToClipboard(content) {
      if (navigator.clipboard && window.isSecureContext) {
        // Utiliser l'API clipboard si disponible
        navigator.clipboard.writeText(content)
          .then(() => {
            this.snackbarMessage = "Connection copied to clipboard!";
            this.snackbarType = 'success';
          })
          .catch(err => {
            console.error("Error while copying connection to clipboard: ", err);
            this.snackbarMessage = "Connection couldn't be copied.";
            this.snackbarType = 'error';
          })
          .finally(() => {
            this.snackbar = true;
          });
      } else {
        // Fallback pour les navigateurs qui ne supportent pas l'API
        const textArea = document.createElement("textarea");
        textArea.value = content;
        // Éviter que l'utilisateur ne voie le textarea
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          this.snackbarMessage = "Connection copied to clipboard!";
          this.snackbarType = 'success';
        } catch (err) {
          console.error("Error while copying connection to clipboard: ", err);
          this.snackbarMessage = "Connection couldn't be copied.";
          this.snackbarType = 'error';
        } finally {
          document.body.removeChild(textArea);
          this.snackbar = true;
        }
      }
    },

    toggleCategorySelection(categoryId) {
      if (this.selectedCategories.includes(categoryId)) {
        this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
      } else {
        this.selectedCategories.push(categoryId);
      }
    },
    toggleTypeSelection(typeId) {
      if (this.selectedTypes.includes(typeId)) {
        this.selectedTypes = this.selectedTypes.filter(id => id !== typeId);
      } else {
        this.selectedTypes.push(typeId);
      }
    },  
      
    openConnectionDialog(mode, connection = null) {
      this.connectionDialogMode = (mode == 'duplicate' ? 'add' : mode);
      // according to selected mode
      if (mode === 'edit' && connection) {  // Load the connection in the form
        this.newConnection = {
          name: connection.name,
          description: connection.description, // ? connection.description : this.defaultDescription,
          content: connection.content,
          category_name: connection.category_name,
          type_name: connection.type_name,
        };
        this.currentConnectionId = connection.id;
      } else if (mode === 'duplicate' && connection) {  // Load the connection in the form
        this.newConnection = {
          name: connection.name,
          description: connection.description,
          content: connection.content,
          category_name: connection.category_name,
          type_name: connection.type_name,
        };
        this.currentConnectionId = connection.id;
      } else {  // or set an empty form
        this.newConnection = {
          name: '',
          description: '', // this.defaultDescription,
          content: '',
          category_name: null,
          type_name: null,
        };
        this.currentConnectionId = null;
      }

      // Reconfigurer l'éditeur pour qu'il utilise la bonne description
      if (this.editor) {
        this.editor.commands.setContent(this.newConnection.description || '');
      }

      // Open the dialog
      this.connectionDialog = true;
    },
    switchDescHTMLMode() {
      if (this.descHTMLMode)
        this.descHTMLMode = false;
      else {
        this.descHTMLMode = true;
        this.editor.commands.setContent(this.newConnection.description);
      }
    }
  },
  async mounted() {
    this.loadingConnections = true;
    try {
      const response = await fetch('/connections.json');
      console.log(response);
      const data = await response.json();

      this.connections = data.connections;
      this.flatConnections = this.flattenConnections(data);
    } catch (error) {
      console.error('Error while loading JSON:', error);
    } finally {
      this.loadingConnections = false;
    }
    // Créer l'instance de l'éditeur Tiptap
    // this.editor = new Editor({
    //   extensions: [
    //     StarterKit,
    //     Underline,
    //     Placeholder.configure({
    //       // Use a placeholder:
    //       placeholder: this.defaultDescription,
    //     }),
    //   ],
    //   content: this.newConnection.description,
    //   onUpdate: ({ editor }) => {
    //     // Synchroniser l'éditeur avec newConnection.description
    //     this.newConnection.description = editor.getHTML();
    //   },
    //   editorProps: {
    //     attributes: {
    //       class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
    //     },
    //   },
    // });
  },
  beforeUnmount() {
    // Détruire l'éditeur Tiptap quand le composant est démonté
    if (this.editor) {
      this.editor.destroy();
    }
  },
  watch: {
    defaultDisplay(newVal) {
      this.connections.forEach(connection => {
        connection.display = newVal;
      });
    },
  },
};
</script>

<style scoped lang="scss">
  .fade-transition {
    transition: opacity 0.5s ease;
  }

  .fade-enter-active, .fade-leave-active {
    opacity: 1;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
