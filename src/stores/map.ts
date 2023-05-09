import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Event } from '@/model/event';
import type { LocationListItem } from '@/model/event';

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

    // *************************************** define the actions ************************************
    
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
        const locs = db.filter(event => event.country === locationName)
        console.log("locs : " + JSON.stringify(locs));
        return locs
    }

    // ********************************* define the selections for selector actions *********************
    // company seletor list
    function selectCompany(db:Event[]) :string[] {
        const companyList: string[] = [];
        for (const company of db) {
            companyList.push(company.company);
        }
        return companyList
    }

    // country seletor list
    function selectCountry(db:Event[]) :string[] {
        const countryList: string[] = [];
        for (const country of db) {
            countryList.push(country.country);
        }
        return countryList
    }

    // country seletor list
    function selectLocation(db:Event[]) :LocationListItem[] {
        // find only the unique entries
        const uniquedb = findUnique(db);
        // add an index
        // console.log("locations before : " + JSON.stringify(uniquedb));

        const locationList: LocationListItem[] = [];
        // build the location slector list
        // start by adding the ALL location
        locationList.push({id: 0, location: "All"});
        for (const location of uniquedb) {
            locationList.push({id: location.id, location: location.name});
        }
        // console.log("locations after: " + JSON.stringify(locationList));
        return locationList
    }

    function findUnique(db: Event[]): Event[] {
        const outputdb: Event[] = [];
        let start = false;
        let count = 0;
        // find all unique items
        for ( let i = 0; i < db.length; i++) {
            for (let j =0;j < outputdb.length; j++) {
                if (db[i] == outputdb[j] ) {
                    start = true;
                }
            }
            count++;
            if (count == 1 && start == false) {
                outputdb.push(db[i]);
                start = false;
                count = 0;
            }
        }
        return outputdb;
    }

  return {  
            count,
            doubleCount,
            increment,
            filterByCompany,
            filterByCountry,
            filterByLocation,
            selectCompany, 
            selectCountry,
            selectLocation,
         }
})