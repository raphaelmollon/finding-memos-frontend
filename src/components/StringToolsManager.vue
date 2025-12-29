<template>
  <v-container v-if="loading" class="d-flex align-center justify-center" style="min-height: 300px;">
    <v-progress-circular indeterminate size="64" color="light-blue"></v-progress-circular>
  </v-container>
  <v-container fluid v-else>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <span class="text-h5">Text Input</span>
          </v-card-title>

          <v-card-text class="mb-0 pb-0">
            <!-- Separator selector (insert before the <v-form>) -->
            <v-chip-group v-model="selectedSeparators"
              multiple column>
              <v-chip v-for="sep in separators" :key="sep.key"
                label
                color="primary"
                :value="sep.key"
                @click="saveUserPreferences"
              >
                <v-tooltip location="bottom" activator="parent">
                  <span v-html="sep.tooltip"></span>
                </v-tooltip>
                <template v-if="sep.icon">
                  <v-icon>{{ sep.icon }}</v-icon>
                </template>
                <template v-else>
                  {{ sep.label }}
                </template>
              </v-chip>
            </v-chip-group>

            <v-form @submit.prevent="">
              <v-textarea
                v-model="text.origin"
                placeholder="Paste your text"
                required
                variant="outlined"
                :autofocus="true"
                label=""
                prepend-inner-icon=""
                @click:prepend-inner="pasteClipboard('text.origin')"
                class="textarea-common"
                :hide-details="true"
              >
                <template v-slot:prepend-inner>
                  <v-tooltip text="Click to Paste or use Ctrl+V" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" @click="pasteClipboard('text.origin')" color="success">mdi-content-paste</v-icon>
                    </template>
                  </v-tooltip>
                </template>
              </v-textarea>
            </v-form>
          </v-card-text>

          <v-card-actions class="mt-0 pt-0">
            <v-spacer></v-spacer>
          <v-responsive>
            <v-tooltip text="Format text to Lowercase" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="blue-darken-1" text @click="reformatCase(false)" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-format-letter-case-lower">
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Format text to Uppercase" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="blue-darken-2" text @click="reformatCase(true)" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-format-letter-case-upper">
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Format text to list of Numbers" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="amber-darken-1" text @click="callFormatList('number')" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-format-list-numbered">
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Format text to list of Strings" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="amber-darken-2" text @click="callFormatList" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-format-list-bulleted">
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Return unique data from text" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="teal-darken-1" text @click="callDuplicateMethod('noDup')" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-numeric-1-box-multiple-outline">
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Return duplicated data from text" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="teal-darken-2" text @click="callDuplicateMethod('dup')" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-numeric-2-box-multiple-outline">
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Clean text from duplicates values" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="teal-darken-3" text @click="callDuplicateMethod('clean')" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-image-filter-none">
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Clean text from duplicates lines" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="brown" text @click="callDuplicateMethod('cleanLine')" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-text-box-minus-outline">
                </v-btn>
              </template>
            </v-tooltip>
            </v-responsive>
          </v-card-actions>
        </v-card>
      </v-col>


      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <span class="text-h5">Text Output</span>
          </v-card-title>

          <v-card-text class="mb-0 pb-0">
          <div class="d-inline-flex align-center flex-wrap">
            <v-chip-group v-model="selectedFormatters"
              multiple column class="d-flex flex-wrap">
              <v-chip v-for="f in formatters" :key="f.key"
                label
                color="primary"
                :value="f.key"
                @click="saveUserPreferences"
              >
                <v-tooltip location="bottom" activator="parent">
                  <span v-html="f.tooltip"></span>
                </v-tooltip>
                <template v-if="f.icon">
                  <v-icon>{{ (f.iconOff && !selectedFormatters.includes(f.key)) ? f.iconOff : f.icon }}</v-icon>
                </template>
                <template v-else>
                  {{ f.label }}
                </template>
              </v-chip>
            </v-chip-group>
            <!-- Reset all formatters -->
            <v-chip label :color="selectedFormatters.length ? 'red' : ''" 
              @click="selectedFormatters = []; saveUserPreferences()">
              <v-tooltip location='bottom' activator="parent">Clear all</v-tooltip>
              <v-icon>mdi-eraser</v-icon>
            </v-chip>
            </div>
            <v-textarea
              v-model="formattedTextDestination"
              variant="outlined"
              label=""
              readonly="readonly"
              class="textarea-common"
              :hide-details="true"
              :loading="submittingText"
            >
            </v-textarea>
          </v-card-text>

          <v-card-actions class="mt-0 pt-0">
            <v-row>
              <v-col cols="2">
                <v-btn color="primary" variant="tonal" @click="sendOutputToInput"
                  :disabled="!text.destination.length" :loading="submittingText" icon="mdi-chevron-left">
                  <v-tooltip activator="parent" location="top">
                    Send Output to Input
                  </v-tooltip>
                  <v-icon></v-icon>
                </v-btn>
              </v-col>
              <v-col cols="10" class="align-self-center">
                <v-btn color="success" variant="tonal" @click="copyToClipboard(formattedTextDestination)" block
                  :disabled="!text.destination.length" :loading="submittingText">
                  <v-tooltip activator="parent" location="top">
                    Copy to clipboard
                  </v-tooltip>
                  <v-icon>mdi-content-copy</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { preferences } from '@/plugins/preferences';
import _ from 'lodash';

export default {
  components: {
  },
  data() {
    return {
      loading: true,
      text: {
        origin: '',
        destination: [],
      },
      submittingText: false,
      savingPreferences: false,
      selectedFormatters: [],
      selectedSeparators: [],   // e.g. ['comma','newline']
      separators: [
        { key: 'comma',     pattern: ',',           label: ',',     icon: 'mdi-comma',            tooltip: 'abc, def, ghi' },
        { key: 'newline',   pattern: '\\n',         label: '↵',     icon: 'mdi-keyboard-return',  tooltip: 'abc<br/>def<br/>ghi' },
        { key: 'space',     pattern: '\\s+',        label: 'space', icon: 'mdi-keyboard-space',   tooltip: 'abc def ghi' },
        { key: 'semicolon', pattern: ';',           label: ';',     icon: null,                   tooltip: 'abc ; def ; ghi' },
        { key: 'pipe',      pattern: '\\|',         label: '|',     icon: null,                   tooltip: 'abc | def | ghi' },
        { key: 'slash',     pattern: '\\/',         label: '/',     icon: 'mdi-slash-forward',    tooltip: 'abc / def / ghi' },
        { key: 'dash',      pattern: '-',           label: '-',     icon: null,                   tooltip: 'abc - def - ghi' },
        { key: 'tab',       pattern: '\\t',         label: '↹',     icon: 'mdi-keyboard-tab',     tooltip: 'abc&nbsp;&nbsp;&nbsp;&nbsp;def&nbsp;&nbsp;&nbsp;&nbsp;ghi' },
        { key: 'et',        pattern: '\\s+et\\s+',  label: 'et',    icon: null,                   tooltip: 'abc et def' },
        { key: 'and',       pattern: '\\s+and\\s+', label: 'and',   icon: null,                   tooltip: 'abc and def' },
        { key: 'amp',       pattern: '\\s*&\\s*',   label: '&',     icon: 'mdi-ampersand',        tooltip: 'abc & def' }
      ],
      formatters: [
        { key: 'comma',   label: ',',     icon: 'mdi-comma',                                  tooltip: 'elt1, elt2, elt3' },
        { key: 'newline', label: '↵',     icon: 'mdi-keyboard-return',                        tooltip: 'elt1<br/>elt2<br/>elt3' },
        { key: 'space',   label: 'space', icon: 'mdi-keyboard-space',                         tooltip: 'elt1 elt2 elt3' },
        { key: 'sqlIn',   label: 'IN ()', icon: 'mdi-database', iconOff: 'mdi-database-off',  tooltip: 'IN (elt1, elt2, elt3)' },
        { key: 'quoted',  label: "' '",   icon: 'mdi-format-quote-close',                     tooltip: "'elt1', 'elt2', 'elt3'" },
        { key: 'pipe',    label: '|',     icon: null,                                         tooltip: 'abc|def|ghi (useful for RegExp)' },
      ],
    };
  },
  computed: {
    ...mapGetters(['getServerURL', 'getUser']),
    formattedTextDestination() {
      if (!this.text.destination) return "";
      let data;
      if (typeof this.text.destination === "string")
        data = this.text.destination;
      else {
        const items = this.text.destination.map(elt => {
          if (this.selectedFormatters.includes('quoted')) {
            // Wrap in single quotes, escaping existing single quotes
            const cleanElt = elt.replace(/'/g, "''");
            return `'${cleanElt}'`;
          }
          return elt;
        });
        data = items.join(this.joinMode);
      }
      return this.selectedFormatters.includes('sqlIn') ? 'IN (' + data + ')' : data;
    },
    joinMode() {
      let join = '';
      if (this.selectedFormatters.includes('comma')) join += ',';
      if (this.selectedFormatters.includes('space')) join += ' ';
      if (this.selectedFormatters.includes('pipe')) join += '|';
      if (this.selectedFormatters.includes('newline')) join += '\n';
      return join || ',';  // default to comma if none selected
    },
  },
  methods: {
    ...mapActions(['setUser', 'triggerSnackbar']),

    parseElements(text) {
      if (!text || typeof text !== 'string') return [];

      const trimmed = text.trim().replace(/\u00A0/g, ' '); // trim and replace non-breaking spaces

      // Build the split regex from selectedSeparators
      let splitRegex;
      if (this.selectedSeparators && this.selectedSeparators.length > 0) {
        // map selected keys to patterns from separators array
        const parts = this.selectedSeparators
          .map(k => {
            const s = this._sepMap[k];
            return s ? s : null;
          })
          .filter(Boolean)
          // keep general whitespace pattern last so more specific tokens match first
          .sort((a, b) => (a === '\\s+' ? 1 : 0) - (b === '\\s+' ? 1 : 0));

        const alternation = parts.join('|');
        splitRegex = new RegExp('(?:' + alternation + ')+', 'i');
      } else {
        // fallback auto-detection (original behavior)
        splitRegex = /[\s\n\t,;|/-]+/;
      }

      // Split, trim, filter out empties
      const raw = trimmed.split(splitRegex)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Remove surrounding quotes from each element (if present)
      return raw.map(el => {
        if ((el.startsWith("'") && el.endsWith("'")) || (el.startsWith('"') && el.endsWith('"'))) {
          return el.slice(1, -1).trim();
        }
        return el;
      });
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

    saveUserPreferences: _.debounce(async function() {
      // Update just the memos section in user's preferences
      try {
        this.savingPreferences = true;
        const response = await preferences.updateSection(this.getServerURL, 'tools', {
          separators: this.selectedSeparators,
          formatters: this.selectedFormatters,
        });
        if (response.ok) {
          this.triggerSnackbar("Preferences saved!");
        }
      } catch (error) {
        this.triggerSnackbar({ message: "Error: " + error, type: 'error' });
      } finally {
        this.savingPreferences = false;
      }
    }, 500),

    async initUserPreferences() {
      // Init the memos section in user's preferences
      try {
        this.savingPreferences = true;
        await preferences.updateSection(this.getServerURL, 'tools', {
          separators: this.selectedSeparators,
          formatters: this.selectedFormatters,
        });
      } catch (error) {
        console.log(error);
        this.triggerSnackbar({ message: "Error: " + error + ' while initializing preferences', type: 'error' });
      } finally {
        this.savingPreferences = false;
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
            this.triggerSnackbar({message:"Memo couldn't be copied.", type: 'error'});
          })
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

    setNestedProperty(obj, path, value) {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const target = keys.reduce((current, key) => current[key] || {}, obj);
      target[lastKey] = value;
    },

    pasteClipboard(propertyPath) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.readText()
          .then((txt) => {
            this.setNestedProperty(this, propertyPath, txt);
            this.triggerSnackbar("Text pasted from clipboard!");
          })
          .catch(err => {
            if (err.name === 'NotAllowedError') {
              this.triggerSnackbar({ message: "Clipboard permission denied. Please allow access.", type: 'error' });
            } else {
              console.error("Error while pasting text from clipboard: ", err);
              this.triggerSnackbar({ message: "Clipboard not supported in this browser.", type: 'error'});
            }
          })
      } else {
        // No fallback - just show informative message
        this.triggerSnackbar({message: "Clipboard paste not supported in this browser. Use Ctrl+V.", type:'error'});
      }
    },

    sendOutputToInput() {
      this.text.origin = typeof this.text.destination === "object" ? this.text.destination.join(this.joinMode) : this.text.destination;
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
    
    callFormatList(type='text') {
      this.submittingText = true;
      let result;
      if (type == 'number')
        result = this.formatListOfNumbers(this.text.origin);
      else
        result = this.formatListOfStrings(this.text.origin);

      this.triggerSnackbar({ message: result.message, type: result.type });

      if (result.type == 'success')
        this.text.destination = result.data;

      this.submittingText = false;
    },
    
    formatListOfNumbers(text) {
      const elements = this.parseElements(text);
      if (elements.length === 0) {
        return {message: "No valid elements found after processing", type: 'error'};
      }

      const reformattedNumbers = [];

      for (const element of elements) {
        // Handle floating point numbers and negative numbers
        const isNumeric = /^-?\d*\.?\d+$/.test(element);
        
        if (!isNumeric) {
          return {message: `'${element}' is not a valid number`, type: 'error'};
        }

        const intElt = parseInt(element);
        const floatElt = parseFloat(element);
        if (parseFloat(intElt) === floatElt)
          reformattedNumbers.push(intElt);
        else
          reformattedNumbers.push(floatElt);
      }

      return {message: "Data reformatted successfully", type: 'success', data: reformattedNumbers};
    },
 
    formatListOfStrings(text){
      const elements = this.parseElements(text);
      if (elements.length === 0) {
        return {message: "No valid elements found after processing", type: 'error'};
      }

      const reformattedElements = elements.map(element => {
        // Remove surrounding quotes but preserve apostrophes inside the string
        // Remove quotes only from start/end, not from within the content
        let cleanElement = element.trim();
        
        // Remove surrounding single or double quotes
        if ((cleanElement.startsWith("'") && cleanElement.endsWith("'")) || 
            (cleanElement.startsWith('"') && cleanElement.endsWith('"'))) {
          cleanElement = cleanElement.slice(1, -1);
        }
        
        // Trim again after removing quotes
        return cleanElement.trim();
      });

      return {message: "Data reformatted successfully", type: 'success', data: reformattedElements};
    },

    reformatCase(upper=true) {
      this.submittingText = true;
      let result = '';
      if (upper)
        result = this.formatAsUpperCase(this.text.origin);
      else
        result = this.formatAsLowerCase(this.text.origin);

      this.triggerSnackbar({ message: result.message, type: result.type });

      if (result.type == 'success')
        this.text.destination = [result.data];

      this.submittingText = false;
    },

    formatAsUpperCase(text) {
      return { message: "Data reformatted successfully", type: "success", data: text.toUpperCase() };
    },

    formatAsLowerCase(text) {
        return { message: "Data reformatted successfully", type: "success", data: text.toLowerCase() };
    },

    callDuplicateMethod(mode) {
      this.submittingText = true;
      let result = {};
      switch (mode) {
        case 'noDup':
          result = this.checkNoDuplicates(this.text.origin);
          break;
        case 'dup':
          result = this.checkDuplicates(this.text.origin);
          break;
        case 'clean':
          result = this.cleanDuplicates(this.text.origin);
          break;
        case 'cleanLine':
          result = this.cleanDuplicatesByLine(this.text.origin);
          break;
      }

      this.triggerSnackbar({ message: result.message, type: result.type });

      if (result.type == 'success') {
        this.text.destination = result.data;
        if (result.data.length && mode == 'cleanLine')
          this.inlineMode = false;
      }

      this.submittingText = false;
    },
    
    checkNoDuplicates(text) {
      const elements = this.parseElements(text);
      if (elements.length === 0) {
        return {message: "No valid elements found after processing", type: "error"};
      }

      // Find elements that appear only once, preserving original order
      const elementCount = {};
      elements.forEach(element => {
        elementCount[element] = (elementCount[element] || 0) + 1;
      });

      const noDuplicates = elements.filter(element => elementCount[element] === 1);
      
      if (noDuplicates.length > 0) {
        return {message: `${noDuplicates.length} unique values found`, type: "success", data: noDuplicates};
      } else {
        return {message: "Only duplicates found in the list", type: "success", data:""};
      }
    },

    checkDuplicates(text) {
      const elements = this.parseElements(text);
      if (elements.length === 0) {
        return {message: "No valid elements found after processing", type: "error"};
      }

      // Find duplicate elements, preserving order of first occurrence
      const elementCount = {};
      const duplicates = [];
      const seen = new Set();
      
      elements.forEach(element => {
        elementCount[element] = (elementCount[element] || 0) + 1;
        if (elementCount[element] > 1 && !seen.has(element)) {
          duplicates.push(element);
          seen.add(element);
        }
      });

      if (duplicates.length > 0) {
        return {
          message: `${duplicates.length} duplicate groups found`, 
          type: "success", 
          data: duplicates
        };
      } else {
        return {
          message: "No duplicates found in the list", 
          type: "success", 
          data: ""
        };
      }
    },

    cleanDuplicates(text) {
      const elements = this.parseElements(text);
      if (elements.length === 0) {
        return {message: "No valid elements found after processing", type: "error"};
      }

      // Remove duplicates while preserving order
      const uniqueElements = [];
      const seen = new Set();
      
      elements.forEach(element => {
        if (!seen.has(element)) {
          seen.add(element);
          uniqueElements.push(element);
        }
      });

      const duplicatesRemoved = elements.length - uniqueElements.length;
      
      return {
        message: `Removed ${duplicatesRemoved} duplicates.`,
        type: "success",
        data: uniqueElements
      };
    },

    cleanDuplicatesByLine(text) {
      const tmpSeparators = this.selectedSeparators;
      this.selectedSeparators = ['newline'];

      const elements = this.parseElements(text);
      if (elements.length === 0) {
        return {message: "No valid lines found after processing", type: "error"};
      }

      // Remove duplicates while preserving order
      const uniqueElements = [];
      const seen = new Set();
      
      elements.forEach(element => {
        if (!seen.has(element)) {
          seen.add(element);
          uniqueElements.push(element);
        }
      });

      const duplicatesRemoved = elements.length - uniqueElements.length;

      this.selectedSeparators = tmpSeparators;

      return {
        message: `Removed ${duplicatesRemoved} duplicate lines.`,
        type: "success",
        data: uniqueElements
      };
    },
  },

  async mounted() {
    await this.fetchCurrentUser();
    // Load just the tools preferences
    const toolsPrefs = await preferences.getSection(this.getServerURL, 'tools');
    if (!_.isEmpty(toolsPrefs)) {
      this.selectedSeparators = Array.isArray(toolsPrefs.separators) ? toolsPrefs.separators : [];
      this.selectedFormatters = Array.isArray(toolsPrefs.formatters) ? toolsPrefs.formatters : [];
    } else {
      this.initUserPreferences();
    }
    // to improve performance, create a map of separator patterns
    this._sepMap = this.separators.reduce((m, s) => { m[s.key] = s.pattern; return m; }, {});

    this.loading = false;
  },

  beforeUnmount() {
  },

  watch: {
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
 
  .v-card-text :deep(ol),
  .v-card-text :deep(ul) {
    padding-left:20px;
  }

  .textarea-common {
    font-family: 'Courier New', Courier, monospace;
  }

</style>
