

import type { InjectionKey } from "vue";
import type { SharedState } from '@/model/event';


export const activeInjectionKey: InjectionKey<SharedState> = Symbol('SharedState');
