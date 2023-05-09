<template>
    <div @click="toggle">
        <slot name="toggler">
          <button>Select</button>
        </slot>
        <slot/>
    </div>
</template>
  
  <script lang="ts">
    import { defineComponent, provide } from 'vue';
    // import type { InjectionKey } from 'vue';
    import { activeInjectionKey } from '@/injectionKeys/keys';
    import { SharedState } from '@/model/event';
    export default defineComponent ({
        name: 'AppDropDown',
        setup() {
            // const key = Symbol() as InjectionKey<string>
            const sharedState: SharedState = {
                active: false
            };
            provide(activeInjectionKey, sharedState);

            const toggle = () => {
                sharedState.active = !sharedState.active;
            }
            return {
                sharedState,
                toggle,
            };
        }
        
    })
  </script>