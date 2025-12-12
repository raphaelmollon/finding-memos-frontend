<template>
  <v-container fluid>
    <!-- Category Selection -->
    <FilterAsMenu
      :items="categories"
      :selected-items="selectedCategories"
      :loading="loadingCategories"
      :loading-count="10"
      itemSize="x-large"
      all-label="All Categories"
      @reset-items="selectedCategories = []"
      @toggle-item="toggleCategorySelection"
    />

    <!-- Type Selection -->
    <FilterAsMenu
      :items="types"
      :selected-items="selectedTypes"
      :loading="loadingTypes"
      :loading-count="10"
      itemSize="large"
      all-label="All Types"
      @reset-items="selectedTypes = []"
      @toggle-item="toggleTypeSelection"
    />

    <!-- Search bar -->
    <SearchBar v-model="searchTerm" 
      hintValue="Search into names, descriptions and content. 
        Accept multi terms and sort by accuracy." 
      v-if="!loadingMemos"/>

    <!-- Options -->
    <PreferencesPanel 
      :default-display="defaultDisplay"
      :filter-user="filterUser"
      :use-params="useParams"
      :saving-preferences="savingPreferences"
      @update:defaultDisplay="handlePreferenceChange('defaultDisplay', $event)"
      @update:filterUser="handlePreferenceChange('filterUser', $event)"
      @update:useParams="handlePreferenceChange('useParams', $event)"
      v-if="!loadingMemos"
    />

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
            <v-tooltip :text="memo.category_name + ' - ' + memo.name" location="top">
              <template v-slot:activator="{ props }">
                <span v-bind="props" @click="memo.display=!memo.display" class="v-card__title">{{ memo.category_name + ' - ' + memo.name }}</span>
              </template>
            </v-tooltip>
          </template>
          <template v-slot:append>
            <v-btn @click="copyToClipboard(memo.content)" v-if="!memo.display" icon="mdi-content-copy" variant="text" density="compact" color="success"></v-btn>
            <v-btn @click="memo.display=!memo.display" :icon="memo.display ? 'mdi-chevron-down' : 'mdi-chevron-right'" variant="text" density="compact"></v-btn>
          </template>
          <template v-slot:subtitle>
            <div class="d-flex align-center">
              <span class="v-card__subtitle mr-2">{{ memo.type_name }}</span>
              <v-progress-linear
                v-if="memo.searchScore"
                :model-value="(memo.searchScore/bestSearchScore*100)"
                :color="getAccuracyColor(memo.searchScore)"
                height="16"
                width="60"
                class="mr-2"
              >
                <template v-slot:default="{ value }">
                  <span class="text-caption" :class="getAccuracyTextColor(value)">{{ getAccuracyDescription(value) }}</span>
                </template>
              </v-progress-linear>
            </div>
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
              <v-tooltip text="Edit" v-if="getUser && memo.author_id == getUser.id">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" color="warning" icon="mdi-pencil" @click="openMemoDialog('edit', memo)"></v-btn>
                </template>
              </v-tooltip>
              <v-tooltip text="Delete" v-if="getUser && memo.author_id == getUser.id">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" color="error" icon="mdi-delete" @click="showDeleteDialog(memo.id, memo.name)"></v-btn>
                </template>
              </v-tooltip>
            </v-btn-group>
            <v-spacer></v-spacer>
            <div>
              <v-tooltip :text="'Author: ' + memo.author_email" v-if="getUser && memo.author_id != getUser.id">
                <template v-slot:activator="{ props }">
                  <div v-bind="props" class="d-flex align-center author-compact">
                    <v-icon small class="mr-1">mdi-account-edit</v-icon>
                    <span class="text-caption">
                      {{ getAuthorDisplayName(memo.author_username, memo.author_email) }}
                    </span>
                    <v-avatar :image="getAuthorAvatarUrl(memo.author_avatar)" size="16" class="mx-1"></v-avatar>
                  </div>
                </template>
              </v-tooltip>
              <span class="d-flex align-center author-compact" v-else><v-icon small class="mr-1">mdi-account-edit</v-icon> You
                <v-icon color="red" class="ml-1">mdi-heart</v-icon>
              </span>
              <v-tooltip :text="'Last update: ' + formatDate(memo.updated_at)">
                <template v-slot:activator="{ props }">
                  <div v-bind="props" class="d-flex align-center author-compact">
                    <v-icon small class="mr-1">mdi-clock-outline</v-icon>
                    <span class="text-caption">
                      {{ formatDateShort(memo.updated_at) }}
                    </span>
                  </div>
                </template>
              </v-tooltip>
              <!-- <span class="d-flex align-center author-compact"><v-icon small class="mr-1">mdi-clock-outline</v-icon>{{ formatDate(memo.updated_at) }}</span> -->
            </div>
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
    <DeleteDialog v-model="deleteDialog" 
      thingLabel="Memo" :thing="currentMemoName"
      @confirm-delete="deleteMemo" 
    />

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
import { mapGetters, mapActions } from 'vuex';

import { preferences } from '@/plugins/preferences';
import _ from 'lodash';

import SearchBar from './common/SearchBar.vue';
import PreferencesPanel from './memo/PreferencesPanel.vue';
import FilterAsMenu from './common/FilterAsMenu.vue';
import DeleteDialog from './common/DeleteDialog.vue';

function stripHtml(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

export default {
  name: 'MemoManager',
  components: {
    PrismEditor,
    TiptapEditor: EditorContent,
    SearchBar,
    PreferencesPanel,
    FilterAsMenu,
    DeleteDialog,
  },
  data() {
    return {
      defaultDisplay: false,
      filterUser: false,
      useParams: false,
      memos: [],  // Memo list
      categories: [], // Category list
      selectedCategories: [],
      types: [],
      selectedTypes: [],
      searchTerm: '',
      bestSearchScore: 0,
      newMemo: {
        name: '',
        description: '',
        content: '',
        category_name: null,
        type_name: null,
        author_id: '',
      },
      deleteDialog: false,    // To display the Delete Memo Dialog
      currentMemoId: null,    // Memo ID for modification/suppression
      currentMemoName: '',    // Memo Name for deletion confirmation
      memoDialog: false,      // To display the Memo Form Dialog
      memoDialogMode: 'add',       // 'add' or 'edit' to determiner current action
      editor: null,
      defaultDescription: "You can give some description/instructions here...",
      descHTMLMode: true,
      loadingMemos: true,
      loadingCategories: true,
      loadingTypes: true,
      submittingMemo: false,
      savingPreferences: false,
    };
  },
  computed: {
    ...mapGetters(['getServerURL','getUser']),
    filteredMemos() {
      let filtered = this.memos.filter(memo => {
        let search = "";
        if (this.searchTerm !== null)
          search = this.searchTerm.toLowerCase();
        
        let matchesSearch = true;
        let totalScore = 0;
        
        if (search !== "") {
          const searchTerms = search.split(' ').filter(term => term.length > 2);
          
          if (searchTerms.length > 0) {
            // Calculate score for each term
            searchTerms.forEach(term => {
              let termScore = 0;
              
              // Name = 4 points (most important)
              if (memo.name.toLowerCase().includes(term)) {
                termScore += 4;
              }
              
              // Description = 2 points
              if (memo.description && memo.description.toLowerCase().includes(term)) {
                termScore += 2;
              }
              
              // Content = 1 point
              if (memo.content.toLowerCase().includes(term)) {
                termScore += 1;
              }
              
              totalScore += termScore;
            });

            // At least one term must bring points
            matchesSearch = totalScore > 0;

            // Calculate ideal theoric score
            this.bestSearchScore = searchTerms.length * (4 + 2 + 1) + 5;
          } else {
            // Simple research if only small terms
            let simpleScore = 0;
            if (memo.name.toLowerCase().includes(search)) simpleScore += 4;
            if (memo.description && memo.description.toLowerCase().includes(search)) simpleScore += 2;
            if (memo.content.toLowerCase().includes(search)) simpleScore += 1;
            
            matchesSearch = simpleScore > 0;
            totalScore = simpleScore;
            this.bestSearchScore = 4 + 2 + 1;
          }

          const allTermsFound = searchTerms.length > 0 && 
            searchTerms.every(term => 
              memo.name.toLowerCase().includes(term) ||
              (memo.description && memo.description.toLowerCase().includes(term)) ||
              memo.content.toLowerCase().includes(term)
            );
            
          if (allTermsFound) {
            totalScore += 5; // Bonus for matching all terms
          }
        }

        // Store total score for sorting
        memo.searchScore = totalScore;

        const matchesCategory = this.selectedCategories.length === 0 ||
          this.selectedCategories.includes(memo.category_id);

        const matchesType = this.selectedTypes.length === 0 ||
          this.selectedTypes.includes(memo.type_id);

        const matchesUser = !this.filterUser || 
          (this.getUser && memo.author_id === this.getUser.id);
                              
        return matchesSearch && matchesCategory && matchesType && matchesUser;
      });

      // SORT BY SCORE (decrescent)
      if (this.searchTerm !== null && this.searchTerm !== "") {
        filtered.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
      }

      return filtered;
    },

    filteredMemosCount() {
      return this.filteredMemos.length;
    },
  },
  methods: {
    ...mapActions(['setUser', 'triggerSnackbar']),

    highlighterSQL(code) {
      return highlight(code, languages.sql);
    },
    highlighterHTML(code) {
      return highlight(code, languages.markup);
    },

    getAuthorAvatarUrl(filename) {
      return `${this.getServerURL}/static/avatars/${filename || '0.png'}`;
    },

    getAuthorDisplayName(username, email) {
      if (username && username.trim() !== '') {
        return username;
      }
      // Retourne la partie avant le @ de l'email
      return email ? email.split('@')[0] : 'Unknown';
    },

    getAccuracyColor(score) {
      if (!this.bestSearchScore) return 'blue';
      const percentage = (score / this.bestSearchScore) * 100;
      
      // Thème chaud/froid - du froid (bleu) au chaud (rouge)
      if (percentage >= 80) return 'red';      // Excellent match
      if (percentage >= 60) return 'orange';   // Good match 
      if (percentage >= 40) return 'yellow';   // Fair match
      if (percentage >= 20) return 'cyan';     // Weak match
      return 'blue';                           // Very weak match
    },

    getAccuracyTextColor(percentage) {
      if (percentage >= 80) return 'text-white';
      if (percentage >= 60) return 'text-white';
      if (percentage >= 40) return 'text-black';
      if (percentage >= 20) return 'text-black';
      return 'text-black';
    },

    getAccuracyDescription(percentage) {
      if (percentage >= 80) return '🔥 Excellent match';
      if (percentage >= 60) return '👍 Good match';
      if (percentage >= 40) return '👌 Fair match';
      if (percentage >= 20) return '💤 Weak match';
      return '🥶 Very weak match';
    },

    async fetchCurrentUser() {
      try {
        const response = await fetch(this.getServerURL + '/users/me', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          this.setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    },

    async handlePreferenceChange(preference, value) {
      this[preference] = value;
      await this.saveUserPreferences();
    },
    saveUserPreferences: _.debounce(async function() {
      // Update just the memos section in user's preferences
      try {
        this.savingPreferences = true;
        const response = await preferences.updateSection(this.getServerURL, 'memos', {
          onlyMine: this.filterUser,
          openByDefault: this.defaultDisplay,
          useParams: this.useParams,
        });
        if (response.ok) {
          this.triggerSnackbar("Preferences saved!");
        }
      } catch (error) {
        this.triggerSnackbar({message: "Error: " + error, type:'error'});
      } finally {
        this.savingPreferences = false;
      }
    },500),

    async fetchCategories() {
      this.loadingCategories = true;
      try {
        const response = await fetch(this.getServerURL+'/categories', {
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
        const response = await fetch(this.getServerURL+'/types', {
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
        const response = await fetch(this.getServerURL+'/memos', {
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
        const response = await fetch(this.getServerURL+'/memos', {
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
        const response = await fetch(this.getServerURL+`/memos/${this.currentMemoId}`, {
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
      this.submittingMemo = true; // Lock the button during treatment

      const descriptionText = stripHtml(this.newMemo.description).trim();
      if (!descriptionText) {
        this.newMemo.description = '';
      }

      if (!this.newMemo.name || !this.newMemo.content || !this.newMemo.category_name || !this.newMemo.type_name) {
        this.triggerSnackbar({ message: "Please fill in all required fields.", type: 'error' });
        return;
      }

      this.newMemo.author_id = this.getUser ? this.getUser.id : null;
  
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
        this.triggerSnackbar(this.memoDialogMode === 'add' ? 'Memo added successfully !' : 'Memo updated successfully !');
      } catch (error) {
        // If something wrong happened
        console.error("Error while submitting memo :", error);
        this.triggerSnackbar({ message: "An error occured. Please check your information. More details in the console.", type: 'error' });

        // We don't close the dialog, instead we redisplay the same old form
        // this.newMemo.description = !descriptionText ? this.defaultDescription : this.newMemo.description;

      } finally {
        this.submittingMemo = false;
        try {
          await this.refreshData();
        } catch (error) {
          // Normally the error is already logged, but let's display a clear message
        this.triggerSnackbar({ message: error, type: 'error' });
        }
      }
    },

    showDeleteDialog(id, name) {
      this.deleteDialog = true;
      this.currentMemoId = id;
      this.currentMemoName = name;
    },

    async deleteMemo() {
      let id = this.currentMemoId;
      this.deleteDialog = false;
      try {
        const response = await fetch(this.getServerURL+`/memos/${id}`, {
          method: 'DELETE',
          credentials: 'include'  // include session cookie
        });
        // Display a success message
        this.triggerSnackbar('Memo deleted successfully !');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete the memo');
        }
        await this.refreshData();
      } catch (error) {
        console.error("Error while deleting memo :", error);
        this.triggerSnackbar({ message: error, type: 'error' });
      }
    },

    copyToClipboard(content) {
      if (navigator.clipboard && window.isSecureContext) {
        // Utiliser l'API clipboard si disponible
        navigator.clipboard.writeText(content)
          .then(() => {
            this.triggerSnackbar("Memo copied to clipboard!");
          })
          .catch(err => {
            console.error("Error while copying memo to clipboard: ", err);
            this.triggerSnackbar({ message: "Memo couldn't be copied.", type: 'error' });
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
          this.triggerSnackbar("Memo copied to clipboard!");
        } catch (err) {
          console.error("Error while copying memo to clipboard: ", err);
          this.triggerSnackbar({ message: "Memo couldn't be copied.", type: 'error' });
        } finally {
          document.body.removeChild(textArea);
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

    formatDateShort(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);

      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    },

  },
  async mounted() {
    await this.fetchCurrentUser();

    await this.fetchMemos();
    await this.fetchCategories();
    await this.fetchTypes();

    // Load just the memos preferences
    const memosPrefs = await preferences.getSection(this.getServerURL, 'memos');
    this.filterUser = memosPrefs.onlyMine || false;
    this.defaultDisplay = memosPrefs.openByDefault || false;
    this.useParams = memosPrefs.useParams || false;

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
  
.author-compact {
  font-size: 0.7em;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  margin-bottom: 2px;
}

.author-compact:hover {
  opacity: 1;
}

.author-compact:last-child {
  margin-bottom: 0;
}

.accuracy-bar {
  border-radius: 4px;
}

.accuracy-percentage {
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}

</style>
