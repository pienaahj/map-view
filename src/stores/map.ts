import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Event } from '@/model/event';

// setup function
export const useMapStore = defineStore('map', () => {
    // refs become state
    const count = ref<number>(0)
    // computed becomes getters
    const doubleCount = computed(() => count.value * 2)
    // functions become actions
    function increment() {
        count.value++
    }

    // define the actions
    // filter by the company
    function filterByCompany(companyName:string, db:Event[]) :Event[]{
        return db.filter(event => event.company === companyName)
    }

    // filter by the country
    function filterByCountry(countryName:string, db:Event[]) :Event[]{
        return db.filter(event => event.country === countryName)
    }

    // filter by the country
    function filterByLocation(locationName:string, db:Event[]) :Event[]{
        return db.filter(event => event.country === locationName)
    }


    // company seletor list
    function selectCompany(db:Event[]) :string[] {
        const companyList: string[] = [];
        for (const company of db) {
            companyList.push(company.company);
        }
        return companyList
    }

  return {  
            count,
            doubleCount,
            increment,
            filterByCompany,
            filterByCountry,
            filterByLocation,
            selectCompany
         }
})