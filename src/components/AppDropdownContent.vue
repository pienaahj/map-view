<template>
    <div v-if="active()">
      <slot/>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  import { activeInjectionKey } from '@/injectionKeys/keys';
  import { injectStrict } from '@/utils/injectStrict';

  export default defineComponent({
      name: 'AppDropdownContent',
      setup() {
        const sharedState:any = injectStrict(activeInjectionKey, {active: false});
        const active = () => {
            return sharedState.active;
        }
    return {
        active,
        sharedState
    };
    },
    });
  </script>