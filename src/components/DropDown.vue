<template>
    <div id="app">
      <AppDropdown>
        <slot name="toggler">
          <button>Toggle</button>
        </slot>
        <AppDropdownContent>
          <AppDropdownItem>Action 1</AppDropdownItem>
          <AppDropdownItem>Action 2</AppDropdownItem>
          <AppDropdownItem>Action 3</AppDropdownItem>
        </AppDropdownContent>
      </AppDropdown>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
    import AppDropdown from '@/components/AppDropdown.vue';
    import AppDropdownContent from '@/components/AppDropdownContent.vue';
    import AppDropdownItem from '@/components/AppDropdownItem.vue'
    export default defineComponent({
      name: 'app',
      components: {
        AppDropdown,
        AppDropdownContent,
        AppDropdownItem,
      }
    });
  </script>
  