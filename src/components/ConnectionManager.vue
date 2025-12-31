<template>
  <v-container fluid>
    <!-- Top 5 Connections Section -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-card variant="outlined">
          <v-card-title class="text-subtitle-1 bg-primary">
            <v-icon class="mr-2">mdi-fire</v-icon>
            Top 5 Most Used Connections
          </v-card-title>
          <v-card-text v-if="loadingTopConnections" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
            <p class="mt-3 text-grey">Loading...</p>
          </v-card-text>
          <v-card-text v-else-if="topUsedConnections.length === 0" class="text-center py-4 text-grey">
            <v-icon size="48" color="grey-lighten-1">mdi-database-off</v-icon>
            <p class="mt-2">No usage data yet</p>
          </v-card-text>
          <v-list v-else dense>
            <v-list-item
              v-for="(conn, index) in topUsedConnections"
              :key="conn.id"
              @click="showDetailDialog(null, { item: conn })"
              class="cursor-pointer"
            >
              <template v-slot:prepend>
                <v-avatar :color="index === 0 ? 'amber' : (index === 1 ? 'grey' : (index === 2 ? 'orange' : 'primary'))" size="32">
                  <span class="text-white font-weight-bold">{{ index + 1 }}</span>
                </v-avatar>
              </template>
              <v-list-item-title>
                {{ conn.company_name || '-' }} > {{ conn.site_name || '-' }} > {{ conn.application_name || 'Unknown' }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ conn.url_server_type || '-' }}
                {{ conn.url_type ? ' • ' + conn.url_type : '' }}
              </v-list-item-subtitle>
              <v-list-item-subtitle  class="text-caption font-italic text-grey">
                {{ conn.url_server_comment || '&nbsp;' }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <div class="d-flex align-center ga-2">
                  <v-tooltip v-if="conn.user_rating == 'down' || conn.rating_down > conn.rating_up" 
                    text="This connection is probably broken" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        color="warning"
                      >
                        mdi-alert-outline
                      </v-icon>
                    </template>
                  </v-tooltip>
                  <v-tooltip v-if="conn.has_url" text="Visit URL & copy credentials" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        color="success"
                        class="clickable-icon"
                        @click.stop="quickOpenURL(conn.id)"
                      >
                        mdi-open-in-new
                      </v-icon>
                    </template>
                  </v-tooltip>
                  <v-chip size="small" color="primary">
                    <v-icon start size="small">mdi-eye</v-icon>
                    {{ conn.usage_count }}
                  </v-chip>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card variant="outlined">
          <v-card-title class="text-subtitle-1 bg-success">
            <v-icon class="mr-2">mdi-clock-outline</v-icon>
            Top 5 Recently Used
          </v-card-title>
          <v-card-text v-if="loadingTopConnections" class="text-center py-8">
            <v-progress-circular indeterminate color="success" size="48"></v-progress-circular>
            <p class="mt-3 text-grey">Loading...</p>
          </v-card-text>
          <v-card-text v-else-if="topRecentConnections.length === 0" class="text-center py-4 text-grey">
            <v-icon size="48" color="grey-lighten-1">mdi-history</v-icon>
            <p class="mt-2">No recent activity</p>
          </v-card-text>
          <v-list v-else dense>
            <v-list-item
              v-for="(conn, index) in topRecentConnections"
              :key="conn.id"
              @click="showDetailDialog(null, { item: conn })"
              class="cursor-pointer"
            >
              <template v-slot:prepend>
                <v-avatar color="success" size="32">
                  <span class="text-white font-weight-bold">{{ index + 1 }}</span>
                </v-avatar>
              </template>
              <v-list-item-title>
                {{ conn.company_name || '-' }} > {{ conn.site_name || '-' }} > {{ conn.application_name || 'Unknown' }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ conn.url_server_type || '-' }}
                {{ conn.url_type ? ' • ' + conn.url_type : '' }}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="text-caption font-italic text-grey">
                {{ conn.url_server_comment || '&nbsp;' }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <div class="d-flex align-center ga-2">
                  <v-tooltip v-if="conn.user_rating == 'down' || conn.rating_down > conn.rating_up" 
                    text="This connection is probably broken" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        color="warning"
                      >
                        mdi-alert-outline
                      </v-icon>
                    </template>
                  </v-tooltip>
                  <v-tooltip v-if="conn.has_url" text="Visit URL & copy credentials" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        color="success"
                        class="clickable-icon"
                        @click.stop="quickOpenURL(conn.id)"
                      >
                        mdi-open-in-new
                      </v-icon>
                    </template>
                  </v-tooltip>
                  <v-chip size="small" color="success" variant="tonal">
                    <v-icon start size="small">mdi-clock</v-icon>
                    {{ formatTimeAgo(conn.user_last_used_at) }}
                  </v-chip>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Standard Search (unencrypted fields) -->
    <v-row>
      <v-col cols="12" md="6" class="my-0 pb-0">
        <v-text-field
          v-model="searchTerm"
          placeholder="Search by Company, Site, Application, Service, or Server Type"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hint="Searches across all organizational fields with relevance scoring (instant)"
          persistent-hint
          clearable
        ></v-text-field>
      </v-col>
    <!-- </v-row> -->

    <!-- Encrypted Search (sensitive fields) -->
    <!-- <v-row class="mt-2"> -->
      <v-col cols="12" md="6" class="my-0 pb-0">
        <v-text-field
          v-model="encryptedSearchTerm"
          placeholder="Search in Server IP, URL, Username, Comments"
          prepend-inner-icon="mdi-shield-search"
          variant="outlined"
          hint="⚠️ Requires server side query & decryption - might take some time (press Enter to search)"
          persistent-hint
          clearable
          :loading="loadingEncryptedSearch"
          @keyup.enter="performEncryptedSearchDebounced"
          @click:clear="clearEncryptedSearch"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Options -->
    <v-row class="align-content-center justify-center">
      <v-col cols="auto" class="align-content-center justify-center">
        <v-switch v-model="defaultDisplay"
          :label="defaultDisplay?'Show all the connections':'Show only if URL exists (Turn on to show all)'"
          inset color="primary" hide-details="true" class="py-0"></v-switch>
      </v-col>
      <v-col cols="auto" class="align-content-center justify-center">
        <v-switch v-model="strictSearch"
          :label="strictSearch?'Strict search (all words must match)':'Flexible search (any word can match)'"
          inset color="primary" hide-details="true" class="py-0"></v-switch>
      </v-col>
    </v-row>

    <!-- Nb connections + legend -->
    <v-row v-if="!loadingConnections">
      <v-col class="align-content-end justify-start" order="4" order-sm="1">
        {{ filteredConnectionsCount }} connection{{ filteredConnectionsCount > 1 ? "s" : "" }} found:
      </v-col>
      <v-col class="align-content-center justify-start" order="1" order-sm="2">
        <v-badge right color="success" class="mr-7" offset-x="-12" dot><span>Savoyeline genuine</span></v-badge>
        <v-badge right color="primary" class="mr-7" offset-x="-12" dot><span>Savoyeline recalculated</span></v-badge>
        <v-badge right color="warning" offset-x="-12" dot><span>Fully invented</span></v-badge>
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
        :items="flatConnections"
        item-key="id"
        density="compact"
        :items-per-page="perPage"
        fixed-header
        :fixed-footer="true"
        striped="odd"
        @click:row="showDetailDialog"
        class="clickable-rows"
        hide-default-footer
        :loading="loadingSearch"
        loading-text="Filtering connections..."
      >
        <template v-slot:[`item.searchScore`]="{ item }">
          <v-chip v-if="item.searchScore && item.searchScore > 0" size="small" :color="item.searchScore >= 10 ? 'success' : (item.searchScore >= 5 ? 'primary' : 'grey')">
            {{ item.searchScore }}
          </v-chip>
          <span v-else>-</span>
        </template>

        <template v-slot:[`item.application`]="{ item }">
          <v-badge location="top right" :color="item.color" dot :offset-x="-12">
            {{ item.company_name }} / {{ item.site_name }} / {{ item.application_name }}
          </v-badge>
        </template>

        <template v-slot:[`item.server_type`]="{ item }">
          <div>
            {{ item.url_server_type || '-' }}
            <span v-if="item.url_server_comment" class="text-caption font-italic text-grey">
              ({{ item.url_server_comment }})
            </span>
          </div>
        </template>

        <template v-slot:[`item.url_type`]="{ item }">
          {{ item.url_type || '-' }}
        </template>

        <template v-slot:[`item.url_service`]="{ item }">
          {{ item.url_service || '-' }}
        </template>

        <template v-slot:[`item.last_update`]="{ item }">
          {{ item.connection_last_update ? new Date(item.connection_last_update).toLocaleDateString() : '-' }}
        </template>

        <template v-slot:[`item.rating_usage`]="{ item }">
          <div class="d-flex align-center justify-center ga-1">
            <v-btn
              icon
              size="x-small"
              :variant="item.user_rating === 'down' ? 'tonal' : 'text'"
              color="error"
              @click.stop="rateConnection(item.id, 'down')"
            >
              <v-icon size="small" :class="{ 'font-weight-bold': item.user_rating === 'down' }">
                mdi-thumb-down
              </v-icon>
            </v-btn>
            <span class="text-caption">{{ item.rating_down || 0 }}</span>

            <v-divider vertical class="mx-1"></v-divider>

            <v-tooltip location="top">
              <template v-slot:activator="{ props }">
                <div v-bind="props" class="d-flex align-center ga-1">
                  <v-icon size="small" color="primary">mdi-eye</v-icon>
                  <span class="text-caption">{{ item.usage_count || 0 }}</span>
                </div>
              </template>
              <span>You used this {{ item.user_usage_count || 0 }} time(s)</span>
              <span v-if="item.user_last_used_at"><br>Last used: {{ new Date(item.user_last_used_at).toLocaleString() }}</span>
            </v-tooltip>

            <v-divider vertical class="mx-1"></v-divider>

            <span class="text-caption">{{ item.rating_up || 0 }}</span>
            <v-btn
              icon
              size="x-small"
              :variant="item.user_rating === 'up' ? 'tonal' : 'text'"
              color="success"
              @click.stop="rateConnection(item.id, 'up')"
            >
              <v-icon size="small" :class="{ 'font-weight-bold': item.user_rating === 'up' }">
                mdi-thumb-up
              </v-icon>
            </v-btn>
          </div>
        </template>

        <template v-slot:[`item.has_url`]="{ item }">
          <v-tooltip v-if="item.has_url" text="Visit URL & copy credentials" location="top">
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                color="success"
                class="clickable-icon"
                @click.stop="quickOpenURL(item.id)"
              >
                mdi-open-in-new
              </v-icon>
            </template>
          </v-tooltip>
          <v-icon v-else color="grey">mdi-close-circle</v-icon>
        </template>

        <template v-slot:[`item.has_credentials`]="{ item }">
          <v-icon v-if="item.has_credentials" color="success">mdi-check-circle</v-icon>
          <v-icon v-else color="grey">mdi-close-circle</v-icon>
        </template>
      </v-data-table>

      <!-- Pagination Controls -->
      <v-row class="mt-2" v-if="!loadingConnections">
        <v-col class="d-flex justify-center align-center">
          <v-pagination
            v-model="page"
            :length="totalPages"
            :total-visible="7"
            @update:modelValue="changePage"
          ></v-pagination>
        </v-col>
      </v-row>
    </v-row>

    <!-- Connection Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="900px" scrollable>
      <v-card v-if="selectedConnection">
        <v-card-title class="text-h5 d-flex align-center">
          <span>Connection Details</span>
          <v-chip class="ml-2" variant="flat" :color="selectedConnection.color">{{ selectedConnection.url_mode }}</v-chip>
          <v-spacer></v-spacer>
          <v-btn class="ml-2"
            icon="mdi-close-box"
            color="error"
            variant="plain"
            @click="detailDialog = false"
          ></v-btn>
        </v-card-title>
        <v-card-text v-if="loadingDecrypted" class="text-center">
          <v-progress-circular indeterminate color="primary" class="my-6"></v-progress-circular>
          <p>Decrypting connection data...</p>
        </v-card-text>

        <v-card-text v-else-if="decryptedConnection">
          <!-- Hierarchy Section -->
          <v-card class="mb-4" variant="outlined">
            <v-card-subtitle class="bg-light-blue-darken-3 py-1">Connection Path</v-card-subtitle>
            <v-card-text>
              <v-row align="center" class="my-0 py-0">
                <v-col><strong>Company:</strong> {{ decryptedConnection.company_name }}</v-col>
                <v-col><strong>Site:</strong> {{ decryptedConnection.site_name }}</v-col>
                <v-col><strong>Application:</strong> {{ decryptedConnection.application_name }}</v-col>
              </v-row>
              <v-row align="center" class="my-0 py-0">
                <v-col v-if="decryptedConnection.url_server_type">
                  <strong>Server Type:</strong> {{ decryptedConnection.url_server_type }}
                  <span v-if="decryptedConnection.url_server_comment" class="font-italic text-grey ml-1">
                    ({{ decryptedConnection.url_server_comment }})
                  </span>
                </v-col>
                <v-col v-if="decryptedConnection.url_service"><strong>Service:</strong> {{ decryptedConnection.url_service }}</v-col>
                <v-col v-if="decryptedConnection.server_ip">
                  <strong>Server IP:</strong> {{ decryptedConnection.server_ip }}
                  <v-btn size="small" icon="mdi-content-copy" color="success"
                    variant="text" @click="copyText(decryptedConnection.server_ip)">
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- URL & Credentials Section -->
          <v-card class="mb-4" variant="outlined">
            <v-card-subtitle class="bg-light-blue-darken-3 py-1">Connection Information</v-card-subtitle>
            <v-card-text>
              <v-row align="center">
                <v-col cols="4" v-if="decryptedConnection.url_type">
                  <strong>URL Type:</strong> {{ decryptedConnection.url_type }}
                </v-col>
                <v-col cols="8" v-if="decryptedConnection.url">
                  <strong>URL:</strong>
                  <a :href="decryptedConnection.url" target="_blank" class="ml-2">
                    {{ decryptedConnection.url }}
                  </a>
                  <v-btn size="small" icon="mdi-content-copy" color="success"
                    variant="text" @click="copyURL(decryptedConnection.url, decryptedConnection.url_id)">
                  </v-btn>
                </v-col>
              </v-row>
              <v-row align="center" v-if="decryptedConnection.user || decryptedConnection.pwd">
                <v-col cols="2"><strong>Credentials:</strong></v-col>
                <v-col v-if="decryptedConnection.user">
                  Username: {{ decryptedConnection.user }}
                  <v-btn size="small" icon="mdi-content-copy" color="success"
                    variant="text" @click="copyText(decryptedConnection.user); trackUsage(decryptedConnection.url_id)">
                  </v-btn>
                </v-col>
                <v-col v-if="decryptedConnection.pwd">
                  Password: {{ decryptedConnection.pwd }}
                  <v-btn size="small" icon="mdi-content-copy" color="success"
                    variant="text" @click="copyText(decryptedConnection.pwd); trackUsage(decryptedConnection.url_id)">
                  </v-btn>
                </v-col>
                <v-col v-if="decryptedConnection.user && decryptedConnection.pwd">
                  <v-btn size="small" prepend-icon="mdi-content-copy" color="success"
                    variant="tonal" @click="copyCredentials(decryptedConnection)">
                    Copy Both
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- User Statistics Section -->
          <v-card class="mb-4" variant="outlined">
            <v-card-subtitle class="bg-purple-darken-2 py-1">Your Activity</v-card-subtitle>
            <v-card-text>
              <v-row align="center">
                <v-col cols="12" md="4">
                  <div class="d-flex align-center">
                    <v-icon color="primary" size="large" class="mr-2">mdi-eye</v-icon>
                    <div>
                      <div class="text-h6">{{ decryptedConnection.user_usage_count || 0 }}</div>
                      <div class="text-caption text-grey">Times you used this</div>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="d-flex align-center">
                    <v-icon color="success" size="large" class="mr-2">mdi-clock-outline</v-icon>
                    <div>
                      <div class="text-subtitle-1">
                        {{ decryptedConnection.user_last_used_at ? formatTimeAgo(decryptedConnection.user_last_used_at) : 'Never' }}
                      </div>
                      <div class="text-caption text-grey">Last used by you</div>
                      <div v-if="decryptedConnection.user_last_used_at" class="text-caption text-grey">
                        {{ new Date(decryptedConnection.user_last_used_at).toLocaleString() }}
                      </div>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="d-flex flex-column">
                    <div class="d-flex align-center mb-2">
                      <div class="mr-2">
                        <v-icon v-if="decryptedConnection.user_rating === 'up'" color="success" size="large">mdi-thumb-up</v-icon>
                        <v-icon v-else-if="decryptedConnection.user_rating === 'down'" color="error" size="large">mdi-thumb-down</v-icon>
                        <v-icon v-else color="grey" size="large">mdi-thumbs-up-down</v-icon>
                      </div>
                      <div>
                        <div class="text-subtitle-1">
                          {{ decryptedConnection.user_rating === 'up' ? 'According to you, this connection works' : (decryptedConnection.user_rating === 'down' ? 'According to you, this connection does not work' : 'You didn\'t give your opinion yet') }}
                        </div>
                      </div>
                    </div>
                    <div class="d-flex ga-2">
                      <v-btn
                        size="small"
                        :color="decryptedConnection.user_rating === 'up' ? 'success' : 'grey'"
                        :variant="decryptedConnection.user_rating === 'up' ? 'tonal' : 'outlined'"
                        @click="rateConnectionInDialog('up')"
                      >
                        <v-icon start>mdi-thumb-up</v-icon>
                        Works
                      </v-btn>
                      <v-btn
                        size="small"
                        :color="decryptedConnection.user_rating === 'down' ? 'error' : 'grey'"
                        :variant="decryptedConnection.user_rating === 'down' ? 'tonal' : 'outlined'"
                        @click="rateConnectionInDialog('down')"
                      >
                        <v-icon start>mdi-thumb-down</v-icon>
                        Broken
                      </v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>
              <v-divider class="my-3"></v-divider>
              <v-row align="center">
                <v-col cols="12">
                  <div class="text-caption text-grey mb-2">Global Statistics</div>
                  <div class="d-flex align-center ga-4">
                    <div class="d-flex align-center">
                      <v-icon color="primary" size="small" class="mr-1">mdi-eye</v-icon>
                      <span class="text-body-2">{{ decryptedConnection.usage_count || 0 }} total uses</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon color="success" size="small" class="mr-1">mdi-thumb-up</v-icon>
                      <span class="text-body-2">{{ decryptedConnection.rating_up || 0 }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon color="error" size="small" class="mr-1">mdi-thumb-down</v-icon>
                      <span class="text-body-2">{{ decryptedConnection.rating_down || 0 }}</span>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Comment URLs Section -->
          <v-card class="mb-4" variant="outlined" v-if="decryptedConnection.comment_urls && decryptedConnection.comment_urls.length > 0">
            <v-card-subtitle class="bg-light-blue-darken-3 py-1">Extracted URLs from comments</v-card-subtitle>
            <v-card-text>
              <v-row><v-col cols="12" class="ml-2"><ul>
                <li v-for="(commentUrl, index) in decryptedConnection.comment_urls" :key="index">
                  <a :href="commentUrl" target="_blank">{{ commentUrl }}</a>
                </li>
              </ul></v-col></v-row>
            </v-card-text>
          </v-card>

          <!-- Comments Section -->
          <v-card class="mb-4" variant="outlined" v-if="decryptedConnection.comments">
            <v-card-subtitle class="bg-light-blue-darken-3 py-1">Raw Comments</v-card-subtitle>
            <v-card-text>
              <div class="comments-text" v-html="decodeHtmlEntities(decryptedConnection.comments)"></div>
            </v-card-text>
          </v-card>

          <!-- Metadata Section -->
          <v-card variant="outlined">
            <v-card-subtitle class="bg-light-blue-darken-3 py-1">Last Updated</v-card-subtitle>
            <v-card-text>
              <div v-if="decryptedConnection.url_last_update">
                <strong>URL:</strong> {{ new Date(decryptedConnection.url_last_update).toLocaleString() }}
              </div>
              <div v-if="decryptedConnection.server_last_update">
                <strong>Server:</strong> {{ new Date(decryptedConnection.server_last_update).toLocaleString() }}
              </div>
              <div v-if="decryptedConnection.application_last_update">
                <strong>Application:</strong> {{ new Date(decryptedConnection.application_last_update).toLocaleString() }}
              </div>
              <div v-if="decryptedConnection.url_mode">
                <strong>Mode:</strong> {{ decryptedConnection.url_mode }}
                {{ decryptedConnection.url_mode === 'classic' ? ' (Genuine data from Savoyeline)' :
                  (decryptedConnection.url_mode === 'recalculated' ? ' (Recalculated from badly set up data in Savoyeline)' :
                  ' (Fully invented from what it should be according to what it looks like ^^)') }}
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { preferences } from '@/plugins/preferences';
import _ from 'lodash';

export default {
  data() {
    return {
      defaultDisplay: false,
      strictSearch: true,
      originalConnections: [], // Original full dataset from API (never modified)
      allConnections: [], // Working copy for filtering/searching
      flatConnections: [], // Filtered/searched/paginated connections for display
      headers: [
        { title: 'Score', key: 'searchScore', width: '80px' },
        { title: 'Application', key: 'application', value: item => `${item.company_name || ''} ${item.site_name || ''} ${item.application_name || ''}` },
        { title: 'Server', key: 'server_type', value: 'url_server_type' },
        { title: 'URL Type', key: 'url_type' },
        { title: 'Service', key: 'url_service' },
        { title: 'Last Update', key: 'last_update', value: 'connection_last_update' },
        { title: 'Rating & Usage', key: 'rating_usage', width: '150px', sortable: false },
        { title: 'Has URL', key: 'has_url' },
        { title: 'Has Credentials', key: 'has_credentials' }
      ],
      // Standard search (unencrypted fields)
      searchTerm: '',
      // Encrypted search (searches ALL encrypted fields)
      encryptedSearchTerm: '',
      cachedEncryptedResults: [], // Cache of encrypted search results from backend
      // Top connections
      topUsedConnections: [],
      topRecentConnections: [],
      loadingTopConnections: true,
      // Pagination
      page: 1,
      perPage: 50,
      totalConnections: 0,
      // Loading states
      loadingConnections: true,
      loadingDecrypted: false,
      loadingEncryptedSearch: false,
      loadingSearch: false,
      savingPreferences: false,
      // Dialogs
      detailDialog: false,
      selectedConnection: null,
      decryptedConnection: null,
      // Debounce timers
      searchDebounceTimer: null,
    };
  },
  computed: {
    ...mapGetters(['getServerURL']),
    filteredConnectionsCount() {
      return this.totalConnections;
    },
    totalPages() {
      return Math.ceil(this.totalConnections / this.perPage);
    },
    isEncryptedSearch() {
      return this.encryptedSearchTerm && this.encryptedSearchTerm.trim().length > 0;
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
    decodeHtmlEntities(text) {
      if (!text) return '';
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      // Preserve line breaks and basic formatting
      return textarea.value.replace(/\n/g, '<br>');
    },
    formatTimeAgo(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);

      if (seconds < 60) return 'just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      const weeks = Math.floor(days / 7);
      if (weeks < 4) return `${weeks}w ago`;
      return date.toLocaleDateString();
    },
    async fetchTopConnections() {
      this.loadingTopConnections = true;
      try {
        const [usedResponse, recentResponse] = await Promise.all([
          fetch(this.getServerURL + '/connections/my-top-used?limit=5', {
            credentials: 'include'
          }),
          fetch(this.getServerURL + '/connections/my-recently-used?limit=5', {
            credentials: 'include'
          })
        ]);

        if (usedResponse.ok) {
          this.topUsedConnections = await usedResponse.json();
        } else {
          this.topUsedConnections = [];
        }

        if (recentResponse.ok) {
          this.topRecentConnections = await recentResponse.json();
        } else {
          this.topRecentConnections = [];
        }
      } catch (error) {
        console.error("Error fetching top connections:", error);
        // Set empty arrays on error so UI shows "no data" message
        this.topUsedConnections = [];
        this.topRecentConnections = [];
      } finally {
        this.loadingTopConnections = false;
      }
    },
    async showDetailDialog(event, { item }) {
      this.selectedConnection = item;
      this.decryptedConnection = null;
      this.detailDialog = true;

      // Fetch decrypted data
      await this.fetchDecryptedConnection(item.id);
    },
    async fetchDecryptedConnection(connectionId) {
      this.loadingDecrypted = true;
      try {
        const response = await fetch(this.getServerURL + `/connections/${connectionId}/decrypt`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch decrypted connection: ${response.status}`);
        }
        this.decryptedConnection = await response.json();
      } catch (error) {
        console.error("Error fetching decrypted connection:", error);
        this.$store.dispatch('triggerSnackbar', {
          message: 'Failed to load connection details: ' + error.message,
          type: 'error'
        });
      } finally {
        this.loadingDecrypted = false;
      }
    },
    async quickOpenURL(connectionId) {
      try {
        // Fetch decrypted connection data
        const response = await fetch(this.getServerURL + `/connections/${connectionId}/decrypt`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch connection: ${response.status}`);
        }
        const connection = await response.json();

        // Copy credentials to clipboard FIRST (while user activation is fresh)
        if (connection.user && connection.pwd) {
          const credentials = `${connection.user} / ${connection.pwd}`;
          this.copyText(credentials, 'URL opened and credentials copied to clipboard!');
        } else if (connection.url) {
          this.$store.dispatch('triggerSnackbar', {
            message: 'URL opened (no credentials available)',
            type: 'info'
          });
        }

        // Then open URL in new tab
        if (connection.url) {
          window.open(connection.url, '_blank');
        }

        // Track usage
        await this.trackUsage(connectionId);
      } catch (error) {
        console.error("Error opening URL:", error);
        this.$store.dispatch('triggerSnackbar', {
          message: 'Failed to open URL: ' + error.message,
          type: 'error'
        });
      }
    },
    async rateConnection(connectionId, rating) {
      try {
        const response = await fetch(
          this.getServerURL + `/connections/${connectionId}/rate?rating=${rating}`,
          {
            method: 'POST',
            credentials: 'include'
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to rate connection: ${response.status}`);
        }

        // Update the local connection data
        const updateConnection = (conn) => {
          if (conn.id === connectionId) {
            // Handle user changing their rating
            const previousRating = conn.user_rating;

            if (previousRating === rating) {
              // User clicked same rating - do nothing (backend handles this)
              return conn;
            }

            // Remove previous rating count if exists
            if (previousRating === 'up') {
              conn.rating_up = Math.max(0, (conn.rating_up || 0) - 1);
            } else if (previousRating === 'down') {
              conn.rating_down = Math.max(0, (conn.rating_down || 0) - 1);
            }

            // Add new rating count
            if (rating === 'up') {
              conn.rating_up = (conn.rating_up || 0) + 1;
            } else {
              conn.rating_down = (conn.rating_down || 0) + 1;
            }

            // Set user's current rating
            conn.user_rating = rating;
          }
          return conn;
        };

        this.originalConnections = this.originalConnections.map(updateConnection);
        this.allConnections = this.allConnections.map(updateConnection);
        this.flatConnections = this.flatConnections.map(updateConnection);
        this.topUsedConnections = this.topUsedConnections.map(updateConnection);
        this.topRecentConnections = this.topRecentConnections.map(updateConnection);

        this.$store.dispatch('triggerSnackbar', {
          message: `Rating ${rating === 'up' ? '👍' : '👎'} recorded!`,
          type: 'success'
        });
      } catch (error) {
        console.error("Error rating connection:", error);
        this.$store.dispatch('triggerSnackbar', {
          message: 'Failed to rate connection: ' + error.message,
          type: 'error'
        });
      }
    },
    async rateConnectionInDialog(rating) {
      if (!this.decryptedConnection) return;

      const connectionId = this.decryptedConnection.id;
      const previousRating = this.decryptedConnection.user_rating;

      // Call the main rating method to update backend and all lists
      await this.rateConnection(connectionId, rating);

      // Update the decryptedConnection object for the dialog
      if (previousRating !== rating) {
        // Remove previous rating count if exists
        if (previousRating === 'up') {
          this.decryptedConnection.rating_up = Math.max(0, (this.decryptedConnection.rating_up || 0) - 1);
        } else if (previousRating === 'down') {
          this.decryptedConnection.rating_down = Math.max(0, (this.decryptedConnection.rating_down || 0) - 1);
        }

        // Add new rating count
        if (rating === 'up') {
          this.decryptedConnection.rating_up = (this.decryptedConnection.rating_up || 0) + 1;
        } else {
          this.decryptedConnection.rating_down = (this.decryptedConnection.rating_down || 0) + 1;
        }

        // Set user's current rating
        this.decryptedConnection.user_rating = rating;
      }
    },
    async trackUsage(connectionId) {
      try {
        const response = await fetch(
          this.getServerURL + `/connections/${connectionId}/track-usage`,
          {
            method: 'POST',
            credentials: 'include'
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to track usage: ${response.status}`);
        }

        // Update the local connection data
        const updateConnection = (conn) => {
          if (conn.id === connectionId) {
            conn.usage_count = (conn.usage_count || 0) + 1;
            conn.user_usage_count = (conn.user_usage_count || 0) + 1;
            conn.user_last_used_at = new Date().toISOString();
          }
          return conn;
        };

        this.originalConnections = this.originalConnections.map(updateConnection);
        this.allConnections = this.allConnections.map(updateConnection);
        this.flatConnections = this.flatConnections.map(updateConnection);

        // Refresh top connections after tracking usage
        await this.fetchTopConnections();
      } catch (error) {
        console.error("Error tracking usage:", error);
        // Silently fail - don't show error to user for tracking
      }
    },
    copyURL(url, connectionId) {
      this.copyText(url);
      if (connectionId) {
        this.trackUsage(connectionId);
      }
    },
    copyCredentials(connection) {
      const text = `${connection.user} / ${connection.pwd}`;
      this.copyText(text);
      if (connection.url_id) {
        this.trackUsage(connection.url_id);
      }
    },
    copyText(text, customMessage = null) {
      const successMessage = customMessage || 'Copied to clipboard!';

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(() => {
            this.$store.dispatch('triggerSnackbar', {
              message: successMessage,
              type: 'success'
            });
          })
          .catch(err => {
            console.error('Copy failed:', err);
            this.$store.dispatch('triggerSnackbar', {
              message: 'Failed to copy',
              type: 'error'
            });
          });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          this.$store.dispatch('triggerSnackbar', {
            message: successMessage,
            type: 'success'
          });
        } catch (err) {
          this.$store.dispatch('triggerSnackbar', {
            message: 'Failed to copy',
            type: 'error'
          });
        } finally {
          document.body.removeChild(textArea);
        }
      }
    },
    async fetchAllConnections() {
      this.loadingConnections = true;
      try {
        const url = this.getServerURL + '/connections';
        const params = new URLSearchParams();
        params.append('all', 'true');

        const response = await fetch(`${url}?${params.toString()}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch connections: ${response.status}`);
        }

        const connections = await response.json();

        // Process connections with color based on mode
        const processedConnections = connections.map((conn) => ({
          ...conn,
          color: conn.url_mode === "classic" ? "success" :
                 (conn.url_mode === "recalculated" ? "primary" :
                 (conn.url_mode === "extrapolated" ? "warning" : "error"))
        }));

        // Store in both original (cached) and working copy
        this.originalConnections = processedConnections;
        this.allConnections = [...processedConnections];

        // Fetch top connections
        await this.fetchTopConnections();

        // Apply filtering, searching, and pagination
        this.applyFiltersAndPagination();

      } catch (error) {
        console.error("Error fetching connections:", error);
        this.$store.dispatch('triggerSnackbar', {
          message: 'Failed to load connections: ' + error.message,
          type: 'error'
        });
      } finally {
        this.loadingConnections = false;
      }
    },
    async performEncryptedSearch(forceApiCall = false) {
      // Step 1: Apply regular search filters to frontend cache
      let regularFilteredConnections = [...this.originalConnections];

      // Apply has_url filter
      if (!this.defaultDisplay) {
        regularFilteredConnections = regularFilteredConnections.filter(conn => conn.has_url);
      }

      // Apply standard search scoring if search term exists
      if (this.searchTerm && this.searchTerm.trim()) {
        const searchTerms = this.searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
        regularFilteredConnections = regularFilteredConnections.map(conn => {
          let score = 0;
          const matchedTerms = new Set();

          const applicationFields = { application_name: conn.application_name || '' };
          const mediumPriorityFields = {
            url_server_type: conn.url_server_type || '',
            url_type: conn.url_type || ''
          };
          const lowPriorityFields = {
            company_name: conn.company_name || '',
            site_name: conn.site_name || '',
            url_service: conn.url_service || ''
          };

          searchTerms.forEach(term => {
            let termMatched = false;

            Object.entries(applicationFields).forEach(([, value]) => {
              const lowerValue = value.toLowerCase();
              if (lowerValue === term) { score += 30; termMatched = true; }
              else if (lowerValue.startsWith(term)) { score += 15; termMatched = true; }
              else if (lowerValue.includes(term)) { score += 6; termMatched = true; }
            });

            Object.entries(mediumPriorityFields).forEach(([, value]) => {
              const lowerValue = value.toLowerCase();
              if (lowerValue === term) { score += 20; termMatched = true; }
              else if (lowerValue.startsWith(term)) { score += 10; termMatched = true; }
              else if (lowerValue.includes(term)) { score += 4; termMatched = true; }
            });

            Object.entries(lowPriorityFields).forEach(([, value]) => {
              const lowerValue = value.toLowerCase();
              if (lowerValue === term) { score += 10; termMatched = true; }
              else if (lowerValue.startsWith(term)) { score += 5; termMatched = true; }
              else if (lowerValue.includes(term)) { score += 2; termMatched = true; }
            });

            if (termMatched) matchedTerms.add(term);
          });

          if (this.strictSearch && matchedTerms.size < searchTerms.length) {
            score = 0;
          }

          return { ...conn, searchScore: score };
        });

        // Only include connections that match the standard search
        regularFilteredConnections = regularFilteredConnections.filter(conn => conn.searchScore > 0);
      }

      // Step 2: If no encrypted search, use regular filter results only
      if (!this.isEncryptedSearch) {
        this.allConnections = regularFilteredConnections;
        this.cachedEncryptedResults = []; // Clear cache when no encrypted search
        this.applyFiltersAndPagination();
        return;
      }

      // Step 3: If encrypted search exists, fetch from backend only if forced or cache is empty
      if (forceApiCall || this.cachedEncryptedResults.length === 0) {
        this.loadingEncryptedSearch = true;
        try {
          const url = this.getServerURL + '/connections/search';
          const params = new URLSearchParams();

          // Use the new unified search parameter
          params.append('all_encrypted_fields', this.encryptedSearchTerm.toLowerCase());

          // Fetch all results (backend cache handles it)
          params.append('all', 'true');

          // Only return sensitive data + IDs (we have the rest cached)
          params.append('short', 'true');

          const response = await fetch(`${url}?${params.toString()}`, {
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error(`Failed to search encrypted fields: ${response.status}`);
          }

          const results = await response.json();

          // Cache the encrypted results
          this.cachedEncryptedResults = results;

        } catch (error) {
          console.error("Error performing encrypted search:", error);
          this.$store.dispatch('triggerSnackbar', {
            message: 'Failed to search encrypted fields: ' + error.message,
            type: 'error'
          });
          this.loadingEncryptedSearch = false;
          return;
        } finally {
          this.loadingEncryptedSearch = false;
        }
      }

      // Step 4: Intersect regular filter results with cached encrypted search results
      const encryptedResultIds = new Set(this.cachedEncryptedResults.map(r => r.url_id));
      this.allConnections = regularFilteredConnections.filter(conn =>
        encryptedResultIds.has(conn.url_id)
      );

      // Apply filtering and pagination
      this.applyFiltersAndPagination();
    },
    applyFiltersAndPagination() {
      let filtered = [...this.allConnections];

      // Apply has_url filter based on defaultDisplay toggle
      if (!this.defaultDisplay) {
        filtered = filtered.filter(conn => conn.has_url);
      }

      // Apply standard search with scoring (only if not using encrypted search)
      if (this.searchTerm && this.searchTerm.trim() && !this.isEncryptedSearch) {
        const searchTerms = this.searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);

        filtered = filtered.map(conn => {
          let score = 0;
          const matchedTerms = new Set();

          // Priority 1: Application (highest weight)
          const applicationFields = {
            application_name: conn.application_name || '',
          };

          // Priority 2: Server and URL Type (medium weight)
          const mediumPriorityFields = {
            url_server_type: conn.url_server_type || '',
            url_type: conn.url_type || ''
          };

          // Priority 3: Other fields (lower weight)
          const lowPriorityFields = {
            company_name: conn.company_name || '',
            site_name: conn.site_name || '',
            url_service: conn.url_service || ''
          };

          // Calculate relevance score with priorities
          searchTerms.forEach(term => {
            let termMatched = false;

            // Check Priority 1: Application (x3 multiplier)
            Object.entries(applicationFields).forEach(([, value]) => {
              const lowerValue = value.toLowerCase();
              if (lowerValue === term) {
                score += 30; // Exact match in application
                termMatched = true;
              } else if (lowerValue.startsWith(term)) {
                score += 15; // Starts with in application
                termMatched = true;
              } else if (lowerValue.includes(term)) {
                score += 6; // Contains in application
                termMatched = true;
              }
            });

            // Check Priority 2: Server and URL Type (x2 multiplier)
            Object.entries(mediumPriorityFields).forEach(([, value]) => {
              const lowerValue = value.toLowerCase();
              if (lowerValue === term) {
                score += 20; // Exact match in server/url_type
                termMatched = true;
              } else if (lowerValue.startsWith(term)) {
                score += 10; // Starts with in server/url_type
                termMatched = true;
              } else if (lowerValue.includes(term)) {
                score += 4; // Contains in server/url_type
                termMatched = true;
              }
            });

            // Check Priority 3: Other fields (x1 multiplier)
            Object.entries(lowPriorityFields).forEach(([, value]) => {
              const lowerValue = value.toLowerCase();
              if (lowerValue === term) {
                score += 10; // Exact match in other fields
                termMatched = true;
              } else if (lowerValue.startsWith(term)) {
                score += 5; // Starts with in other fields
                termMatched = true;
              } else if (lowerValue.includes(term)) {
                score += 2; // Contains in other fields
                termMatched = true;
              }
            });

            if (termMatched) {
              matchedTerms.add(term);
            }
          });

          // In strict mode, all terms must match
          if (this.strictSearch && matchedTerms.size < searchTerms.length) {
            score = 0;
          }

          return { ...conn, searchScore: score };
        });

        // Filter out items with score 0 and sort by score descending
        filtered = filtered.filter(conn => conn.searchScore > 0);
        filtered.sort((a, b) => b.searchScore - a.searchScore);
      } else {
        // No search, ensure all items have a score of 0 for display
        filtered = filtered.map(conn => ({ ...conn, searchScore: 0 }));
      }

      // Update total count
      this.totalConnections = filtered.length;

      // Apply pagination
      const startIndex = (this.page - 1) * this.perPage;
      const endIndex = startIndex + this.perPage;
      this.flatConnections = filtered.slice(startIndex, endIndex);
    },
    performStandardSearch() {
      // Clear any existing debounce timer
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }

      // Show loading state immediately
      this.loadingSearch = true;

      // Set a new debounce timer
      this.searchDebounceTimer = setTimeout(() => {
        // Reset to page 1 when searching
        this.page = 1;
        this.applyFiltersAndPagination();
        // Hide loading state after filtering is done
        this.loadingSearch = false;
      }, 300); // 300ms debounce delay
    },
    async performEncryptedSearchDebounced() {
      if (!this.isEncryptedSearch) {
        return;
      }
      // Reset to page 1 when searching
      this.page = 1;
      // Force API call since encrypted search term changed
      await this.performEncryptedSearch(true);
    },
    async clearEncryptedSearch() {
      // Clear the search term and restore from cached connections
      this.encryptedSearchTerm = '';
      this.page = 1;
      // Restore allConnections from the original cached copy
      this.allConnections = [...this.originalConnections];
      this.applyFiltersAndPagination();
    },
    changePage(newPage) {
      this.page = newPage;
      this.applyFiltersAndPagination();
    },
    async handlePreferenceChange(preference, value) {
      this[preference] = value;
      await this.saveUserPreferences();
    },
    saveUserPreferences: _.debounce(async function() {
      // Update the connections section in user's preferences
      try {
        this.savingPreferences = true;
        const response = await preferences.updateSection(this.getServerURL, 'connections', {
          showAll: this.defaultDisplay,
          strictSearch: this.strictSearch,
        });
        if (response.ok) {
          this.$store.dispatch('triggerSnackbar', {
            message: 'Preferences saved!',
            type: 'success'
          });
        }
      } catch (error) {
        this.$store.dispatch('triggerSnackbar', {
          message: 'Error saving preferences: ' + error,
          type: 'error'
        });
      } finally {
        this.savingPreferences = false;
      }
    }, 500),
  },
  async mounted() {
    // Load user preferences
    const connectionsPrefs = await preferences.getSection(this.getServerURL, 'connections');
    this.defaultDisplay = connectionsPrefs.showAll || false;
    this.strictSearch = connectionsPrefs.strictSearch !== undefined ? connectionsPrefs.strictSearch : true;

    await this.fetchAllConnections();
  },
  watch: {
    defaultDisplay() {
      // Re-filter using cached results (no API call needed)
      if (this.isEncryptedSearch) {
        this.performEncryptedSearch(); // Uses cached encrypted results
      } else {
        this.performStandardSearch();
      }
    },
    searchTerm() {
      // Re-filter using cached results (no API call needed)
      if (this.isEncryptedSearch) {
        this.performEncryptedSearch(); // Uses cached encrypted results
      } else {
        this.performStandardSearch();
      }
    },
    strictSearch() {
      // Re-filter using cached results (no API call needed)
      if (this.isEncryptedSearch) {
        this.performEncryptedSearch(); // Uses cached encrypted results
      } else {
        this.performStandardSearch();
      }
    },
    encryptedSearchTerm(newValue) {
      // If the user erases the encrypted search input, treat it as clearing
      if (!newValue || newValue.trim() === '') {
        this.clearEncryptedSearch();
      }
    },
  },
};
</script>

<style scoped lang="scss">
  .clickable-rows :deep(tbody tr) {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .clickable-rows :deep(tbody tr:hover) {
    background-color: rgba(0, 0, 0, 0.04);
  }

  .clickable-icon {
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .clickable-icon:hover {
    transform: scale(1.2);
    opacity: 0.8;
  }

  .comments-text {
    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
    font-family: 'Courier New', Courier, monospace;
    line-height: 1.6;
  }
</style>
