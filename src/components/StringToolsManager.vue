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
      <v-col>
        <v-card>
          <v-card-title>
            <span class="text-h5">Text Input</span>
          </v-card-title>

          <v-card-text>
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

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-tooltip text="Format text to Lowercase" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="blue-darken-1" text @click="reformatAsLowerCase" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-format-letter-case-lower">
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Format text to Uppercase" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="blue-darken-2" text @click="reformatAsUpperCase" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-format-letter-case-upper">
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Format text to list of Numbers" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="amber-darken-1" text @click="reformatListOfNumbers" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-format-list-numbered">
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Format text to list of Strings" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="amber-darken-2" text @click="reformatListOfStrings" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-format-list-bulleted">
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Format text to list of Quoted Strings" location="top" offset="0">
              <template v-slot:activator="{props}">
                <v-btn v-bind="props"
                  color="amber-darken-3" text @click="reformatListOfQuotedStrings" :disabled="!text.origin || submittingText" :loading="submittingText"
                  icon="mdi-format-list-bulleted-square">
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
          </v-card-actions>
        </v-card>
      </v-col>


      <v-col>
        <v-card>
          <v-card-title>
            <span class="text-h5">Text Output</span>
          </v-card-title>

          <v-card-text>
            <v-textarea
              v-model="formattedTextDestination"
              variant="outlined"
              label=""
              readonly="readonly"
              class="textarea-common"
            >
                <template v-slot:prepend-inner><div>
                  <v-tooltip text="Toggle IN ()" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" @click="sqlInMode = !sqlInMode" :color="sqlInMode ? 'success' : 'error'" small>
                        {{ sqlInMode ? 'mdi-database' : 'mdi-database-off'}}
                      </v-icon>
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Toggle one per line display" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" @click="inlineMode = !inlineMode" :color="inlineMode ? 'error' : 'success'" small>
                        mdi-keyboard-return
                      </v-icon>
                    </template>
                  </v-tooltip>
                </div></template>            
            </v-textarea>
          </v-card-text>

          <v-card-actions>
            <v-row>
              <v-col cols="2">
                <v-btn color="primary" variant="tonal" @click="sendOutputToInput"
                  :disabled="!text.destination || text.origin === text.destination" :loading="submittingText" icon="mdi-chevron-left">
                  <v-tooltip activator="parent" location="top">
                    Send Output to Input
                  </v-tooltip>
                  <v-icon></v-icon>
                </v-btn>
              </v-col>
              <v-col cols="10" class="align-self-center">
                <v-btn color="success" variant="tonal" @click="copyToClipboard(formattedTextDestination)" block
                  :disabled="!text.destination" :loading="submittingText">
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

export default {
  components: {
  },
  data() {
    return {
      snackbar: false, // To display the snackbar
      snackbarMessage: '', // Snackbar's message
      snackbarType: 'success', // Default color for snackbar ('success' or 'error')
      text: {
        origin: '',
        destination: [],
      },
      submittingText: false,
      sqlInMode: false,
      inlineMode: true,
    };
  },
  computed: {
    ...mapGetters(['getServerURL', 'getUser']),
    formattedTextDestination() {
      if (!this.text.destination) return "";
      const mode = this.inlineMode ? ', ' : (this.sqlInMode ? ',\n': '\n');
      let data;
      if (typeof this.text.destination === "string")
        data = this.text.destination;
      else
        data = this.text.destination.join(mode);
      return this.sqlInMode ? 'IN (' + data + ')' : data;
    },
  },
  methods: {
    ...mapActions(['setUser']),

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
            this.snackbarMessage = "Text pasted from clipboard!";
            this.snackbarType = 'success';
          })
          .catch(err => {
            if (err.name === 'NotAllowedError') {
              this.snackbarMessage = "Clipboard permission denied. Please allow access.";
              this.snackbarType = 'error';
            } else {
              console.error("Error while pasting text from clipboard: ", err);
              this.snackbarMessage = "Clipboard not supported in this browser.";
              this.snackbarType = 'error';
            }
          })
          .finally(() => {
            this.snackbar = true;
          });
      } else {
        // No fallback - just show informative message
        this.snackbarMessage = "Clipboard paste not supported in this browser. Use Ctrl+V.";
        this.snackbarType = 'error';
        this.snackbar = true;
      }
    },

    sendOutputToInput() {
      this.text.origin = typeof this.text.destination === "object" ? this.text.destination.join() : this.text.destination;
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
    
    reformatListOfNumbers() {
      this.submittingText = true;
      const result = this.formatListOfNumbers(this.text.origin);

      this.snackbarMessage = result.message;
      this.snackbarType = result.type;
      this.snackbar = true;

      if (result.type == 'success')
        this.text.destination = result.data;

      this.submittingText = false;
    },
    
    formatListOfNumbers(text) {
      if (!text || typeof text !== 'string') {
        return {message: "Input must be a non-empty string", type: 'error'};
      }

      // Remove quotes and normalize common separators to commas
      let processedText = text.replace(/["']/g, '')
                            .replace(/\s*et\s*|\s*&\s*/gi, ', ')
                            .trim();

      if (!processedText) {
        return {message: "No valid content found after processing", type: 'error'};
      }

      // Split by multiple separators: space, newline, tab, comma, semicolon, pipe, dash, slash
      const separators = /[\s\n\t,;|/]+/;
      const elements = processedText.split(separators)
                                  .map(item => item.trim())
                                  .filter(item => item.length > 0);

      if (elements.length === 0) {
        return {message: "No elements found after processing", type: 'error'};
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

    reformatListOfStrings() {
      this.submittingText = true;
      const result = this.formatListOfStrings(this.text.origin);

      this.snackbarMessage = result.message;
      this.snackbarType = result.type;
      this.snackbar = true;

      if (result.type == 'success') {
        this.text.destination = result.data;
      }
      this.submittingText = false;
    },
    
    formatListOfStrings(text){
      if (!text || typeof text !== 'string') {
        return {message: "Input must be a non-empty string", type: 'error'};
      }

      let processedText = text.replace(/;/g, ',')
        .replace(/\s*et\s*|\s*&\s*/gi, ',')
        .trim();

      if (!processedText) {
        return {message: "No valid content found after processing", type: 'error'};
      }

      let elements;

      // Detect separation method: comma or newline
      if (processedText.includes(',') || processedText.includes('\n')) {
        elements = processedText.replace(/\n/g, ',')
          .split(',')
          .map(item => item.trim());
      } else {
        // Split by multiple spaces
        elements = processedText.split(/\s+/)
          .map(item => item.trim());
      }

      // Filter empty elements
      elements = elements.filter(item => item.length > 0);

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

    reformatListOfQuotedStrings() {
      this.submittingText = true;
      const result = this.formatListOfQuotedStrings(this.text.origin);

      this.snackbarMessage = result.message;
      this.snackbarType = result.type;
      this.snackbar = true;

      if (result.type == 'success')
        this.text.destination = result.data;

      this.submittingText = false;
    },

    formatListOfQuotedStrings(text) {
      if (!text || typeof text !== 'string') {
        return {message: "Input must be a non-empty string", type: 'error'};
      }

      let processedText = text.replace(/;/g, ',')
        .replace(/\s*et\s*|\s*&\s*/gi, ',')
        .trim();

      if (!processedText) {
        return {message: "No valid content found after processing", type: 'error'};
      }

      let elements;

      // Detect separation method: comma or newline
      if (processedText.includes(',') || processedText.includes('\n')) {
        elements = processedText.replace(/\n/g, ',')
          .split(',')
          .map(item => item.trim());
      } else {
        // Split by multiple spaces
        elements = processedText.split(/\s+/)
          .map(item => item.trim());
      }

      // Filter empty elements
      elements = elements.filter(item => item.length > 0);

      if (elements.length === 0) {
        return {message: "No valid elements found after processing", type: 'error'};
      }

      const reformattedElements = elements.map(element => {
        // Remove existing double quotes and trim
        const cleanElement = element.replace(/"/g, "'").trim();

        // If already properly quoted with single quotes, leave as is
        if (cleanElement.startsWith("'") && cleanElement.endsWith("'")) {
          return cleanElement;
        }

        // Otherwise wrap in single quotes, handling existing mismatched quotes
        const unquotedElement = cleanElement.replace(/(^')|('$)/g, '');
        return `'${unquotedElement}'`;
      });

      return {message: "Data reformatted successfully", type: 'success', data: reformattedElements};
    },

    reformatAsUpperCase() {
      this.submittingText = true;
      const result = this.formatAsUpperCase(this.text.origin);

      this.snackbarMessage = result.message;
      this.snackbarType = result.type;
      this.snackbar = true;

      if (result.type == 'success')
        this.text.destination = [result.data];

      this.submittingText = false;
    },

    formatAsUpperCase(text) {
      return { message: "Data reformatted successfully", type: "success", data: text.toUpperCase() };
    },

    reformatAsLowerCase() {
      this.submittingText = true;
      const result = this.formatAsLowerCase(this.text.origin);

      this.snackbarMessage = result.message;
      this.snackbarType = result.type;
      this.snackbar = true;

      if (result.type == 'success')
        this.text.destination = result.data;

      this.submittingText = false;
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

      this.snackbarMessage = result.message;
      this.snackbarType = result.type;
      this.snackbar = true;

      if (result.type == 'success') {
        this.text.destination = result.data;
        if (result.data.length && mode == 'cleanLine')
          this.inlineMode = false;
      }

      this.submittingText = false;
    },
    
    checkNoDuplicates(text) {
      if (!text || typeof text !== 'string') {
        return {message: "Input must be a non-empty string", type: "error"};
      }

      const result = this.formatListOfStrings(text);
      if (result.type !== 'success') return result;
      const elements = result.data;

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
      if (!text || typeof text !== 'string') {
        return {message: "Input must be a non-empty string", type: "error"};
      }

      // Remove quotes and split by separators
      const processedText = text.replace(/["']/g, '');
      const separators = /[\s\n\t,;|-]+/;
      const elements = processedText.split(separators)
                                  .map(item => item.trim())
                                  .filter(item => item.length > 0);

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
      if (!text || typeof text !== 'string') {
        return {message: "Input must be a non-empty string", type: "error"};
      }

      // Remove quotes and split by separators
      const processedText = text.replace(/["']/g, '');
      const separators = /[\s\n\t,;|-]+/;
      const elements = processedText.split(separators)
                                  .map(item => item.trim())
                                  .filter(item => item.length > 0);

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
      if (!text || typeof text !== 'string') {
        return {message: "Input must be a non-empty string", type: "error"};
      }

      // Split text into lines and strip whitespace
      const elements = text.split('\n')
                          .map(line => line.trim())
                          .filter(line => line.length > 0);

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
      
      return {
        message: `Removed ${duplicatesRemoved} duplicate lines.`,
        type: "success",
        data: uniqueElements
      };
    },
  },

  async mounted() {
    await this.fetchCurrentUser();
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
