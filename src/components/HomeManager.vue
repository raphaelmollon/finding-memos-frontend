<template>
  <v-container fluid height="100%">
    <v-row class="mx-auto" style="margin:0 auto; max-width:1000px; position:relative;top:50%;transform: translateY(-50%)">
      <v-col v-for="section, key in sections" :key="key" 
        cols="12" 
        md="6" 
        transition="fade-transition">
        <v-card @click="$router.push(section.link)">
          <v-card-title style="cursor:pointer"><v-icon>{{ section.icon }}</v-icon> {{section.title}}</v-card-title>
          <v-card-subtitle>
            <span v-if="section.count"><strong>{{ section.count }}</strong> {{ key }}
              <span v-if="section.distinct_authors"> - <strong>{{ section.distinct_authors }}</strong> authors</span>
              <span v-if="section.distinct_categories"> - <strong>{{ section.distinct_categories }}</strong> categories</span>
              <span v-if="section.distinct_types"> - <strong>{{ section.distinct_types }}</strong> types</span>
              <span v-if="section.unique_companies"> - <strong>{{ section.unique_companies }}</strong> companies</span>
              <span v-if="section.unique_sites"> - <strong>{{ section.unique_sites }}</strong> sites</span>
              <span v-if="section.unique_applications"> - <strong>{{ section.unique_applications }}</strong> applications</span>
            </span>
            <span v-else><v-progress-circular indeterminate :size="12" :width="1"></v-progress-circular></span>
          </v-card-subtitle>
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
      sections: {
        memos: {
          title: "Memos",
          link: 'memos',
          count: 0,
          distinct_authors: 0,
          distinct_categories: 0,
          distinct_types: 0,
          icon:"mdi-note-multiple-outline",
        },
        connections: {
          title: "Web Connections",
          link: 'connections',
          icon: "mdi-web",
          count: 0,
          unique_companies: 0,
          unique_sites: 0,
          unique_applications: 0,
        },
        procedures: {
          title: "Recovery Procedures",
          link: 'procedures',
          icon:"mdi-file-cog-outline",
        },
        tools: {
          title: "String Tools",
          link: 'string-tools',
          count: 8,
          icon:"mdi-tools",
        },
      },
    };
  },
  computed: {
    ...mapGetters(['getServerURL','getUser']),
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
    async fetchMemoStats() {
      try {
        const response = await fetch(this.getServerURL + '/memos/stats', {
          credentials: 'include'  // include session cookie
        });
        if (!response.ok) {
          throw new Error('Failed to retrieve memo stats.');
        }
        const data = await response.json();
        this.sections.memos.count = data.count;
        this.sections.memos.distinct_authors = data.authors;
        this.sections.memos.distinct_categories = data.categories;
        this.sections.memos.distinct_types = data.types;
      } catch (error) {
        console.error('Error while retrieving memo stats:', error);
      }
    },
    async fetchConnectionStats() {
      try {
        const response = await fetch(this.getServerURL + '/connections/stats', {
          credentials: 'include'  // include session cookie
        });
        if (!response.ok) {
          throw new Error('Failed to retrieve connection stats.');
        }
        const data = await response.json();
        this.sections.connections.count = data.total_connections;
        this.sections.connections.unique_companies = data.unique_companies;
        this.sections.connections.unique_sites = data.unique_sites;
        this.sections.connections.unique_applications = data.unique_applications;
      } catch (error) {
        console.error('Error while retrieving connection stats:', error);
      }
    },
  },
  async mounted() {
    await this.fetchCurrentUser();
    await this.fetchMemoStats();
    await this.fetchConnectionStats();
  },
  beforeUnmount() {
  },
  watch: {
  },
};
</script>

<style scoped lang="scss">
  html, body, #app { height: 100%; margin: 0; }

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
