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

    <!-- Category Selection -->
    <v-row>
      <v-col cols="12" class="d-flex align-center flex-wrap justify-center" v-if="loadingTypes">
        <v-btn v-for="i in 10" :key="i" variant="tonal" tile :loading="true" size="x-large" class="mx-1" disabled></v-btn>
      </v-col>
      <v-col cols="12" class="d-flex align-center flex-wrap justify-center" v-else>
        <!-- Reset selection -->
        <v-btn
          @click="selectedCategories = []"
          :color="selectedCategories.length === 0 ? 'primary' : ''"
          :variant="selectedCategories.length === 0 ? 'tonal' : 'plain'"
          :active="selectedCategories.length === 0"
          tile
          size="x-large"
        >
          All Categories
        </v-btn>

        <!-- List all selectable categories -->
        <v-btn
          v-for="category in categories"
          :key="category.id"
          @click="toggleCategorySelection(category.id)"
          :color="selectedCategories.includes(category.id) ? 'primary' : ''"
          :variant="selectedCategories.includes(category.id) ? 'tonal' : 'plain'"
          :active="selectedCategories.includes(category.id)"
          tile
          size="x-large"
        >
          {{ category.name }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Type Selection -->
    <v-row>
      <v-col cols="12" class="d-flex align-center flex-wrap justify-center" v-if="loadingCategories">
        <v-btn v-for="i in 5" :key="i" variant="tonal" tile :loading="true" class="mx-1" disabled></v-btn>
      </v-col>
      <v-col cols="12" class="d-flex align-center flex-wrap justify-center" v-else>
        <!-- Reset selection -->
        <v-btn
          @click="selectedTypes = []"
          :color="selectedTypes.length === 0 ? 'primary' : ''"
          :variant="selectedTypes.length === 0 ? 'tonal' : 'plain'"
          :active="selectedTypes.length === 0"
          tile
        >
          All Types
        </v-btn>

        <!-- List all selectable types -->
        <v-btn
          v-for="type in types"
          :key="type.id"
          @click="toggleTypeSelection(type.id)"
          :color="selectedTypes.includes(type.id) ? 'primary' : ''"
          :variant="selectedTypes.includes(type.id) ? 'tonal' : 'plain'"
          :active="selectedTypes.includes(type.id)"
          tile
        >
          {{ type.name }}
        </v-btn>
      </v-col>
    </v-row>

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
        <v-switch v-model="defaultDisplay" label="Open by default" inset color="success" hide-details="true" class="py-0"></v-switch>
      </v-col>
      <v-col cols="auto">
        <v-switch v-model="useParams" label="Activate params (TODO)" inset color="success" hide-details="true" class="py-0"></v-switch>
      </v-col>
    </v-row>

    <!-- Nb memos + Btn Add -->
    <v-row v-if="!loadingMemos">
      <v-col class="align-content-end justify-start" order="4" order-sm="1">
        {{ filteredMemosCount }} memos found:
      </v-col>
      <v-col class="align-content-center justify-start" order="1" order-sm="2">
      </v-col>
      <v-col cols="12" sm="auto" class="align-content-end justify-end" order="3" order-sm="4">
        <v-btn color="success" @click="openMemoDialog('add')" prepend-icon="mdi-plus" block>
          Add
        </v-btn>
      </v-col>
    </v-row>

    <!-- Memo list -->
    <v-row v-if="loadingMemos" class="mt-6">
      <v-col cols="12" class="text-center mt-6">
        <v-progress-circular
          indeterminate
          color="primary"
          :size="128"
        ></v-progress-circular>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col
        v-for="memo in filteredMemos" 
        :key="memo.id" 
        cols="12" 
        md="6" 
        lg="4"
        xl="3"
        transition="fade-transition"
      >
        <v-card 
          density="compact"
        >
          <template v-slot:prepend>
            <v-icon @click="memo.display=!memo.display">mdi-script-text</v-icon>
          </template>
          <template v-slot:title>
            <span @click="memo.display=!memo.display" class="v-card__title">{{ memo.category_name + ' - ' + memo.name }}</span>
          </template>
          <template v-slot:append>
            <v-btn @click="copyToClipboard(memo.content)" v-if="!memo.display" icon="mdi-content-copy" variant="text" density="compact" color="success"></v-btn>
            <v-btn @click="memo.display=!memo.display" :icon="memo.display ? 'mdi-chevron-down' : 'mdi-chevron-right'" variant="text" density="compact"></v-btn>
          </template>
          <template v-slot:subtitle>
            <span class="v-card__subtitle">{{ memo.type_name }}</span>
          </template>
          <v-card-text v-if="memo.display">
            <prism-editor class="my-editor" v-model="memo.content" :highlight="highlighterSQL" readonly></prism-editor>
            <v-card v-if="memo.displayDesc" subtitle="Description / Instructions" flat>
              <v-card-text v-html="memo.description"></v-card-text>
            </v-card>
          </v-card-text>
          <v-card-actions v-if="memo.display">
            <v-btn-group variant="tonal">
              <v-tooltip text="Description / Instructions">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" color="primary" icon="mdi-text" @click="memo.displayDesc=!memo.displayDesc"></v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Duplicate">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" color="success" icon="mdi-content-duplicate" @click="openMemoDialog('duplicate', memo)"></v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Edit">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" color="warning" icon="mdi-pencil" @click="openMemoDialog('edit', memo)"></v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Delete">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" color="error" icon="mdi-delete" @click="showDeleteDialog(memo.id)"></v-btn>
                </template>
              </v-tooltip>
            </v-btn-group>
            <v-spacer></v-spacer>
              <v-tooltip text="Copy to clipboard">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" color="success" @click="copyToClipboard(memo.content)" variant="flat" icon="mdi-content-copy"></v-btn>
                </template>
              </v-tooltip>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" width="auto">
      <v-card class="ma-2">
        <v-card-title>Are you sure you want to delete this memo?</v-card-title>
        <v-card-actions>
          <v-btn color="green darken-1" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red darken-1" text @click="deleteMemo">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Update Dialog -->
    <v-dialog v-model="memoDialog" max-width="80%">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ memoDialogMode === 'add' ? 'Add memo' : 'Update memo' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="submitMemo">
            <v-text-field
              v-model="newMemo.name"
              placeholder="Memo name"
              :rules="[v => !!v || 'Name is required']"
              required
              variant="outlined"
              :autofocus="true"
              label="Name"
            ></v-text-field>
            <v-row>
              <v-col>
                <v-combobox
                  v-model="newMemo.category_name"
                  :items="categories"
                  item-title="name"
                  item-value="name"
                  placeholder="Select a category"
                  :rules="[v => !!v || 'A category is required']"
                  required
                  variant="outlined"
                  auto-select-first="exact"
                  :loading="!categories"
                  :return-object="false"
                  label="Category"
                ></v-combobox>
                  </v-col><v-col>
                <v-combobox
                  v-model="newMemo.type_name"
                  :items="types"
                  item-title="name"
                  item-value="name"
                  placeholder="Select a type"
                  :rules="[v => !!v || 'A type is required']"
                  required
                  variant="outlined"
                  :loading="!types"
                  :return-object="false"
                  label="Type"
                ></v-combobox>
              </v-col>
            </v-row>
            Snippet:
            <v-input>
              <prism-editor class="my-editor-form-sql" v-model="newMemo.content" :highlight="highlighterSQL" placeholder="Paste your script here..."></prism-editor>
            </v-input>
            Description / Instructions:
            <v-input>
              <v-row no-gutters>
                <v-col cols="12"> <!-- Toolbar -->
                  <v-btn-group v-if="descHTMLMode" class="editor-toolbar" variant="text" density="comfortable">
                    <v-btn icon @click="editor.commands.toggleBold" :disabled="!editor.can().toggleBold()">
                      <v-icon>mdi-format-bold</v-icon>
                    </v-btn>
                    <v-btn icon @click="editor.commands.toggleItalic" :disabled="!editor.can().toggleItalic()">
                      <v-icon>mdi-format-italic</v-icon>
                    </v-btn>
                    <v-btn icon @click="editor.commands.toggleUnderline" :disabled="!editor.can().toggleUnderline()">
                      <v-icon>mdi-format-underline</v-icon>
                    </v-btn>
                    <v-btn icon @click="editor.commands.toggleBulletList">
                      <v-icon>mdi-format-list-bulleted</v-icon>
                    </v-btn>
                    <v-btn icon @click="editor.commands.toggleOrderedList">
                      <v-icon>mdi-format-list-numbered</v-icon>
                    </v-btn>
                    <v-btn icon @click="editor.commands.setParagraph">
                      <v-icon>mdi-format-paragraph</v-icon>
                    </v-btn>
                    <v-btn v-for="size in [1,2,3]" :key="size" icon @click="editor.commands.setHeading({level:size})">
                      <v-icon>mdi-format-header-{{ size }}</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="switchDescHTMLMode" size="small">
                      <v-icon>mdi-xml</v-icon>
                    </v-btn>
                  </v-btn-group>
                  <v-btn-group v-else class="editor-toolbar" variant="text" density="comfortable">
                    <v-spacer></v-spacer>
                    <v-btn icon @click="switchDescHTMLMode" size="small">
                      <v-icon>mdi-xml</v-icon>
                    </v-btn>
                  </v-btn-group>
                </v-col>
                <v-col cols="12" class="border-tiptap">
                  <tiptap-editor v-if="descHTMLMode"
                    v-model="newMemo.description" 
                    :editor="editor"
                    class="pa-2 tiptaptoe"
                  ></tiptap-editor>
                  <prism-editor v-else class="my-editor-form-html" v-model="newMemo.description" :highlight="highlighterHTML" :placeholder="defaultDescription"></prism-editor>
                </v-col>
              </v-row>
            </v-input>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="memoDialog = false" :disabled="submittingMemo">
            Cancel
          </v-btn>
          <v-btn color="success" text @click="submitMemo" :disabled="!newMemo.name || !newMemo.content || !newMemo.category_name || !newMemo.type_name || submittingMemo" :loading="submittingMemo">
            {{ memoDialogMode === 'add' ? 'Add' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from 'prismjs/components/prism-core';
// import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markup';
// import 'prismjs/themes/prism-dark.css'; // import syntax highlighting styles
import 'prismjs-themes/dist/prism-vsc-dark-plus.css'

import { Editor, EditorContent } from '@tiptap/vue-3'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

function stripHtml(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

export default {
  components: {
    PrismEditor,
    TiptapEditor: EditorContent,
  },
  data() {
    return {
      defaultDisplay: false,
      useParams: false,
      memos: [],  // Memo list
      categories: [], // Category list
      selectedCategories: [],
      types: [],
      selectedTypes: [],
      searchTerm: '',
      newMemo: {
        name: '',
        description: '',
        content: '',
        category_name: null,
        type_name: null,
      },
      snackbar: false, // To display the snackbar
      snackbarMessage: '', // Snackbar's message
      snackbarType: 'success', // Default color for snackbar ('success' or 'error')
      deleteDialog: false,    // To display the Delete Memo Dialog
      currentMemoId: null,    // Memo ID for modification/suppression
      memoDialog: false,      // To display the Memo Form Dialog
      memoDialogMode: 'add',       // 'add' or 'edit' to determiner current action
      editor: null,
      defaultDescription: "You can give some description/instructions here...",
      descHTMLMode: true,
      loadingMemos: false,
      loadingCategories: false,
      loadingTypes: false,
      submittingMemo: false,
    };
  },
  computed: {
    filteredMemos() {
      let filtered = this.memos.filter(memo => {
        const matchesSearch = memo.name.toLowerCase().includes(this.searchTerm.toLowerCase());

        const matchesCategory = this.selectedCategories.length === 0 ||
          this.selectedCategories.includes(memo.category_id);

        const matchesType = this.selectedTypes.length === 0 ||
          this.selectedTypes.includes(memo.type_id);

        return matchesSearch && matchesCategory && matchesType;
      });

      return filtered;
    },
    filteredMemosCount() {
      return this.filteredMemos.length;
    },
  },
  methods: {
    highlighterSQL(code) {
      return highlight(code, languages.sql);
    },
    highlighterHTML(code) {
      return highlight(code, languages.markup);
    },

    async fetchCategories() {
      this.loadingCategories = true;
      try {
        const response = await fetch('http://127.0.0.1:5000/categories', {
          credentials: 'include'  // include session cookie
        });
        if (!response.ok) {
          throw new Error('Failed to fetch categories. Status code: '+response.status);
        }
        const categories = await response.json();
        // Sort alphabetically
        categories.sort((a, b) => a.name.localeCompare(b.name, 'fr', { ignorePunctuation: true }));

        this.categories = categories;
      } catch (error) {
        console.error("Erreur while fetching categories :", error);
        throw error;
      } finally {
        this.loadingCategories = false;
      }
    },
    async fetchTypes() {
      this.loadingTypes = true;
      try {
        const response = await fetch('http://127.0.0.1:5000/types', {
          credentials: 'include'  // include session cookie
        });
        if (!response.ok) {
          throw new Error('Failed to fetch types. Status code: ' + response.status);
        }
        const types = await response.json();
        // Sort alphabetically
        types.sort((a, b) => a.name.localeCompare(b.name, 'fr', { ignorePunctuation: true }));

        this.types = types;
      } catch (error) {
        console.error("Error while fetching types:", error);
        throw error;
      } finally {
        this.loadingTypes = false;
      }
    },
    async fetchMemos() {
      this.loadingMemos = true;
      try {
        const response = await fetch('http://127.0.0.1:5000/memos', {
          credentials: 'include'  // include session cookie
        });
        if (!response.ok) {
          throw new Error('Failed to fetch memos. Status code: '+response.status);
        }
        const memos = await response.json();

        // Add display property to each memo
        memos.forEach(memo => {
          memo.display = this.defaultDisplay;
          memo.displayDesc = false;
        });


        // Sort memos by Category name, then by Memo name
        memos.sort((a, b) => {
          // Compare Category names
          const categoryComparison = a.category_name.localeCompare(b.category_name, 'fr', { ignorePunctuation: true });

          if (categoryComparison !== 0) {
            // If Categories are different, sort by Category name
            return categoryComparison;
          } else {
            // If Categories are the same, sort by Memo name
            return a.name.localeCompare(b.name, 'fr', { ignorePunctuation: true });
          }
        });

        this.memos = memos;
      } catch (error) {
        console.error("Error while fetching memos:", error);
        throw error;
      } finally {
        this.loadingMemos = false;
      }
    },
    updateSelectedFilters() {
      // Update selectedCategories
      const validCategoryIds = new Set(this.categories.map(category => category.id));
      this.selectedCategories = this.selectedCategories.filter(categoryId => validCategoryIds.has(categoryId));

      // Update selectedTypes
      const validTypeIds = new Set(this.types.map(type => type.id));
      this.selectedTypes = this.selectedTypes.filter(typeId => validTypeIds.has(typeId));
    },
    // In methods where you need to refresh data
    async refreshData() {
      try {
        await Promise.all([this.fetchCategories(), this.fetchTypes(), this.fetchMemos()]);
        this.updateSelectedFilters();
      } catch (error) {
        console.error("Error while refreshing data:", error);
        // Handle error accordingly
      }
    },

    async addMemo() {
      try {
        const response = await fetch('http://127.0.0.1:5000/memos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newMemo),
          credentials: 'include'  // include session cookie
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add the memo');
        }
      } catch (error) {
        console.error("Error while adding memo :", error);
        throw error;
      }
    },
    async updateMemo() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/memos/${this.currentMemoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newMemo),
          credentials: 'include'  // include session cookie
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update the memo');
        }
      } catch (error) {
        console.error("Error while updating memo :", error);
        throw error;
      }
    },
    async submitMemo() {
      // this.newMemo.description = this.newMemo.description.match(/<(\w+)><\/\1>/g) ? "" : this.newMemo.description;  // check empty markup

      // let oldDescription = this.newMemo.description;
      // if (oldDescription === this.defaultDescription)
      //   this.newMemo.description = "";
      this.submittingMemo = true; // Lock the button during treatment

      const descriptionText = stripHtml(this.newMemo.description).trim();
      if (!descriptionText /*|| descriptionText === this.defaultDescription*/) {
        this.newMemo.description = '';
      }

      if (!this.newMemo.name || !this.newMemo.content || !this.newMemo.category_name || !this.newMemo.type_name) {
        this.snackbarMessage = "Please fill in all required fields.";
        this.snackbarType = 'error';
        this.snackbar = true;
        return;
      }
  
      try {
        if (this.memoDialogMode === 'add') {
          console.debug("Adding a memo...")
          await this.addMemo(); // Add a new memo
        } else if (this.memoDialogMode === 'edit') {
          console.debug("Modifying a memo...")
          await this.updateMemo(); // Update an existing memo
        }
        // If everything went fine, close the dialog
        this.memoDialog = false;
        this.newMemo = { name: '', description: '', content: '', category_name: '', type_name: '' }; // Reset the form

        // Display a success message
        this.snackbarMessage = this.memoDialogMode === 'add' ? 'Memo added successfully !' : 'Memo updated successfully !';
        this.snackbarType = 'success';
        this.snackbar = true;

      } catch (error) {
        // If something wrong happened
        console.error("Error while submitting memo :", error);
        this.snackbarMessage = "An error occured. Please check your information. More details in the console.";
        this.snackbarType = 'error';
        this.snackbar = true;

        // We don't close the dialog, instead we redisplay the same old form
        // this.newMemo.description = !descriptionText ? this.defaultDescription : this.newMemo.description;

      } finally {
        this.submittingMemo = false;
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
      this.currentMemoId = id;
    },
    async deleteMemo() {
      let id = this.currentMemoId;
      this.deleteDialog = false;
      try {
        const response = await fetch(`http://127.0.0.1:5000/memos/${id}`, {
          method: 'DELETE',
          credentials: 'include'  // include session cookie
        });
        // Display a success message
        this.snackbarMessage = 'Memo deleted successfully !';
        this.snackbarType = 'success';
        this.snackbar = true;

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete the memo');
        }
        await this.refreshData();
      } catch (error) {
        console.error("Error while deleting memo :", error);
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
            this.snackbarMessage = "Memo copied to clipboard!";
            this.snackbarType = 'success';
          })
          .catch(err => {
            console.error("Error while copying memo to clipboard: ", err);
            this.snackbarMessage = "Memo couldn't be copied.";
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
          this.snackbarMessage = "Memo copied to clipboard!";
          this.snackbarType = 'success';
        } catch (err) {
          console.error("Error while copying memo to clipboard: ", err);
          this.snackbarMessage = "Memo couldn't be copied.";
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
      
    openMemoDialog(mode, memo = null) {
      this.memoDialogMode = (mode == 'duplicate' ? 'add' : mode);
      // according to selected mode
      if (mode === 'edit' && memo) {  // Load the memo in the form
        this.newMemo = {
          name: memo.name,
          description: memo.description, // ? memo.description : this.defaultDescription,
          content: memo.content,
          category_name: memo.category_name,
          type_name: memo.type_name,
        };
        this.currentMemoId = memo.id;
      } else if (mode === 'duplicate' && memo) {  // Load the memo in the form
        this.newMemo = {
          name: memo.name,
          description: memo.description,
          content: memo.content,
          category_name: memo.category_name,
          type_name: memo.type_name,
        };
        this.currentMemoId = memo.id;
      } else {  // or set an empty form
        this.newMemo = {
          name: '',
          description: '', // this.defaultDescription,
          content: '',
          category_name: null,
          type_name: null,
        };
        this.currentMemoId = null;
      }

      // Reconfigurer l'éditeur pour qu'il utilise la bonne description
      if (this.editor) {
        this.editor.commands.setContent(this.newMemo.description || '');
      }

      // Open the dialog
      this.memoDialog = true;
    },
    switchDescHTMLMode() {
      if (this.descHTMLMode)
        this.descHTMLMode = false;
      else {
        this.descHTMLMode = true;
        this.editor.commands.setContent(this.newMemo.description);
      }
    }
  },
  mounted() {
    this.fetchMemos();
    this.fetchCategories();
    this.fetchTypes();

    // Créer l'instance de l'éditeur Tiptap
    this.editor = new Editor({
      extensions: [
        StarterKit,
        Underline,
        Placeholder.configure({
          // Use a placeholder:
          placeholder: this.defaultDescription,
        }),
      ],
      content: this.newMemo.description,
      onUpdate: ({ editor }) => {
        // Synchroniser l'éditeur avec newMemo.description
        this.newMemo.description = editor.getHTML();
      },
      editorProps: {
        attributes: {
          class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
        },
      },
    });
  },
  beforeUnmount() {
    // Détruire l'éditeur Tiptap quand le composant est démonté
    if (this.editor) {
      this.editor.destroy();
    }
  },
  watch: {
    defaultDisplay(newVal) {
      this.memos.forEach(memo => {
        memo.display = newVal;
      });
    },
  },
};
</script>

<style scoped lang="scss">
  .v-card__title {
    font-size:0.8em;
    cursor: pointer;
  }
  .v-card__memo {
    background-color: rgb(255,255,255,0.8);
    border-radius: 4px;
    height:10em;
    overflow: hidden;
    border:12px solid rgb(255,255,255,0.0);
    font-size:0.8em;
    line-height: 1em;
  }
  .v-card__memo-pre {
    padding:0em;
    margin:0em;
  }
  .memo-card {
    border: 1px solid #ccc;
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 4px;
    background-color: #f9f9f9;
  }

  .fade-transition {
    transition: opacity 0.5s ease;
  }

  .fade-enter-active, .fade-leave-active {
    opacity: 1;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
 
  .my-editor {
    border-radius: 4px;
    height:12em;
    background: rgb(45, 45, 45, 0.8);
    color: #ccc;
    overflow:hidden;
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 0.8em;
    line-height: 1em;
    border:10px solid rgb(45, 45, 45, 0);
  }
  .my-editor-form-sql {
    border-radius: 4px;
    height:11.5em;
    background: rgb(45, 45, 45);
    color: #ccc;
    overflow:auto;
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 1em;
    line-height: 1.2em;
    border:10px solid rgb(45, 45, 45, 0);
  }
  .my-editor-form-sql :deep(.prism-editor__container) {
    min-height: 10em; /* Adjust the height as needed */
    cursor: text;
  }

  .my-editor-form-sql :deep(.prism-editor__textarea) {
    min-height: 10em; /* Match the container height */
    height: 100%;
  }

  .my-editor-form-html {
    border-radius: 0px;
    height:11em;
    background: rgb(45, 45, 45);
    color: #ccc;
    overflow:auto;
    font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
    font-size: 1em;
    line-height: 1.2em;
    border:none;
    padding:10px;
  }
  .my-editor-form-html :deep(.prism-editor__container) {
    min-height: 9.5em; /* Adjust the height as needed */
    cursor: text;
  }

  .my-editor-form-html :deep(.prism-editor__textarea) {
    min-height: 9.5em; /* Match the container height */
    height: 100%;
  }

  .editor-toolbar {
    // margin-bottom: 10px;
    background-color:rgb(45, 45, 45);
    display: flex;
    // gap: 8px;
    border-radius:4px 4px 0px 0px;
    color:#ccc;
    padding-top:4px;
    height:32px;
  }
  .border-tiptap {
    border:4px solid rgb(45, 45, 45);
    border-radius:0px 0px 4px 4px;
    height:11.5em;
    overflow:auto;
    transition-duration: 2s;
  }
  /* Remove blue focus border from TipTap editor */
  .tiptaptoe :deep(.ProseMirror:focus) {
    outline: none;
  }

  /* Ensure the editor area is fully clickable */
  .tiptaptoe :deep(.ProseMirror) {
    min-height: 10em; /* Adjust as needed */
    cursor: text;
  }
  .v-card-text :deep(ol),
  .v-card-text :deep(ul) {
    padding-left:20px;
  }
  .tiptaptoe :deep(.desctextarea) {
    border:none;
  }
  .tiptaptoe :deep(p.is-editor-empty:first-child::before) {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
</style>
