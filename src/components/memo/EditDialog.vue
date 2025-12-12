<template>
    <v-dialog v-model="memoDialog" max-width="80%">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ mode === 'add' ? 'Add memo' : 'Update memo' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="$emit('submit', localMemo)">
            <v-text-field
              v-model="localMemoname"
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
                  v-model="localMemocategory_name"
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
                  v-model="localMemotype_name"
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
              <prism-editor class="my-editor-form-sql" v-model="localMemocontent" :highlight="highlighterSQL" placeholder="Paste your script here..."></prism-editor>
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
                    v-model="localMemodescription" 
                    :editor="editor"
                    class="pa-2 tiptaptoe"
                  ></tiptap-editor>
                  <prism-editor v-else class="my-editor-form-html" v-model="localMemodescription" :highlight="highlighterHTML" :placeholder="defaultDescription"></prism-editor>
                </v-col>
              </v-row>
            </v-input>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="$emit('update:modelValue', false)" :disabled="submittingMemo">
            Cancel
          </v-btn>
          <v-btn color="success" text @click="$emit('submit')" :disabled="!localMemoname || !localMemocontent || !localMemocategory_name || !localMemotype_name || submittingMemo" :loading="submittingMemo">
            {{ mode === 'add' ? 'Add' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markup';
import { Editor, EditorContent } from '@tiptap/vue-3'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'


export default {
    name: 'MemoEditDialog',
    components: {
        PrismEditor,
        TiptapEditor: EditorContent,
    },
    props: {
        ùpdemValue: {
            type: Boolean,
            default: false,
        },
        mode: {
            type: String,
            default: 'add'
        },
        memo: {
            type: Object,
            required: true
        }
    }
}
</script>