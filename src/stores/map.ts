import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { LocationListItem, CompanyListItem, CountryListItem, Event } from '@/model/event'; // models

import destinations from "@/assets/southAfrica.json"; // db
import { findUnique, findUniqueCompany, findUniqueCountry } from '@/utils/unique';  // util functions

// setup function
export const useMapStore = defineStore('map', () =>{
    // refs become state
    // const count = ref<number>(0)
    // computed becomes getters
    // const doubleCount = computed(() => count.value * 2)
    // functions become actions
    // function increment() {
        //     count.value++
        // }
 
    // setup the data
    // get the db from JSON into string format
    const eventString = JSON.stringify(destinations)
    // parse the data into Events object array
    const allEvents: any | Event[] = JSON.parse(eventString);
    // the filtered events state 
    let filteredEvents: Event[] = ref(allEvents);
    // *************************************** define the filters ************************************
    // is location filtered
    const locFiltered = ref(false);
    // is company filtered
    const companyFiltered = ref(false);
    // is country filtered
    const countryFiltered = ref(false);
    // *************************************** define the filtered arrays *****************************
    // filtered selection for location
    let filteredLocationEvents: Event[] = [];
    // filtered selection for company
    let filteredCompanyEvents: Event[] = [];
    // filtered selection for country
    let filteredCountryEvents: Event[] = [];
    
    // *************************************** define the selectors ************************************
    // selector list for locations
    let locationSelections: LocationListItem[] = [];
    // selector list for companies
    let companySelections: CompanyListItem[] = [];
    // selector list for countries
    let countrySelections: CountryListItem[] = [];
    // *************************************** define the getters **************************************

    const reset = computed(() => {
        // console.log("reset called");
        return filteredEvents = ref(allEvents);
    });
    
    // *************************************** define the actions **************************************
    // if filtered applied update the selectors
    function updateSelectors(): [LocationListItem[] | CompanyListItem[], CompanyListItem[] | CountryListItem[]] | null {
        // console.log("upDateSelectors called");
        if (locFiltered.value) {
            //find the company that satisfies the location filter - stored in filteredLocationEvents
            // set the company selectors
            companySelections = selectCompany(filteredLocationEvents);
            // console.log("in updateSelections:companySelections: " + JSON.stringify(companySelections));
            // set the country selectors
            countrySelections = selectCountry(filteredLocationEvents);
            return [companySelections, countrySelections];
        } 
        if (companyFiltered.value) {
            //find the company that satisfies the company filter - stored in filteredCompanyEvents
            // set the country selectors
            countrySelections = selectCountry(filteredCompanyEvents);
            // set the location selectors
            locationSelections = selectLocation(filteredCompanyEvents);
            return [locationSelections, countrySelections];
        }
        if (countryFiltered.value) {
            //find the company that satisfies the company filter - stored in filteredCountryEvents
            // set the company selectors
            companySelections = selectCompany(filteredCountryEvents);
            // set the location selectors
            locationSelections = selectLocation(filteredCountryEvents);
            return [locationSelections, companySelections];
        }
        return null;
    };

    // filter by the country
    function filterByLocation(locationName:string, db:Event[]) :Event[]{
        if (locationName != "All") {
            locFiltered.value = true;
            filteredLocationEvents = db.filter(event => event.name === locationName);
            // console.log("in filterbyLocation :" + JSON.stringify(filteredLocationEvents));
            updateSelectors();
            return filteredLocationEvents;
        } else {
            return db
        }
    }
    // filter by the company
    function filterByCompany(companyName:string, db:Event[]) :Event[]{
        if (companyName != "All") {
            // update the filter
            companyFiltered.value = true;
            // update the filtered events
            filteredCompanyEvents =  db.filter(event => event.company === companyName);
            // console.log("in filterbyCompany :" + JSON.stringify(filteredCompanyEvents));
            updateSelectors();
            return filteredCompanyEvents;
        } else {
            return db
        }   
    }

    // filter by the country
    function filterByCountry(countryName:string, db:Event[]) :Event[]{
        if (countryName != "All") {
            countryFiltered.value = true;
            filteredCountryEvents = db.filter(event => event.country === countryName);
            // console.log("in filterbyCountry :" + JSON.stringify(filteredCountryEvents));
            updateSelectors();
            return filteredCountryEvents;
        } else {
            return db
        }
    } 


    // ********************************* define the selections for selector actions *********************
    // company seletor list
    function selectCompany(db:Event[]) :CompanyListItem[] {
        // find only the unique entries
        return findUniqueCompany(db);
    }

    // country seletor list
    function selectCountry(db:Event[]) :CountryListItem[] {
        // find only the unique entries
        return findUniqueCountry(db);
    }

    // country seletor list
    function selectLocation(db:Event[]) :LocationListItem[] {
        // find only the unique entries
        // console.log("before find unique location: " + JSON.stringify(db));
        return findUnique(db);
    }
    // select all selectors
    function allSelectors(db:Event[]) :void {
        locFiltered.value = false;
        companyFiltered.value = false; 
        countryFiltered.value = false;
    }
    // ********************************* resetting the store events to db values *********************
    // function reset() :void {
    //     filteredEvents = ref(allEvents);
    //     console.log("reset called");
    // }

  return {  
            allEvents,
            filteredEvents,
            allSelectors,
            filterByCompany,
            filterByCountry,
            filterByLocation,
            selectCompany, 
            selectCountry,
            selectLocation,
            locFiltered,
            companyFiltered,
            countryFiltered,
            reset,
            filteredLocationEvents,
            filteredCompanyEvents,
            filteredCountryEvents,
            updateSelectors,
            locationSelections,
            companySelections,
            countrySelections,
         }
})