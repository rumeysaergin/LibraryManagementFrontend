<template>
  <div>
    <Header v-if="!isAdminRoute" />

    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>