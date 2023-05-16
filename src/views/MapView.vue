<template>
    <header>
      <div class="flex-container">
        <nav class="map-selector">
            <div class="selector">
              <label for="">Select location</label>
              <select v-model="locationSelected">
                <option v-for="location in locations" :key="location.id">
                {{ location.location }}
                </option>
              </select>
            </div>
            <div class="selector">
              <label for="">Select company</label>
              <select v-model="companySelected">
                <option v-for="company in companies" :key="company.id">
                {{ company.company }}
                </option>
              </select>
            </div>
            <div class="selector">
              <label for="">Select country</label>
              <select v-model="countrySelected">
                <option v-for="country in countries" :key="country.id">
                {{ country.country }}
                </option>
              </select>
            </div>
        </nav>
      </div>
    </header>
    
        
    <main>
      <div class="map custom-popup" id="mapContainer"></div>
      <div>
        <ul>
          <li v-for="place in eventMarkers" :key="place.id">{{ place.name }}</li>
        </ul>
      </div>
    </main>
  </template>

<script lang="ts">

import L from "leaflet"; //leaflet
import "leaflet.markercluster";

import { defineComponent, toRaw, onMounted, onBeforeUnmount, ref, watch, computed } from "vue";

import { Event, CompanyListItem, CountryListItem, LocationListItem  } from "@/model/event"; //models

import { useMapStore }  from '@/stores/map'; //store


import { getRemainingLocationEvents, getRemainingCompanyEvents, getRemainingCountryEvents } from '@/utils/availableEvents';

export default defineComponent ({
    name: 'MapView',
    setup() {
        // get a mapstore from pinia
        const store = useMapStore();
        // ******************************** map *********************************
        // set up the map defaults
        const center:any = [-29.07, 26.18];
        const default_zoom :number= 5;
        let map: L.Map;
        let cluster:any = null;
        let markers:any = null;
        let eventMarkers:Event[] = [];
        const setupLeafletMap = () => {
          map = L.map("mapContainer").setView(center, default_zoom);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "OpenStreetMap",
            // }).addTo(toRaw(map));
          }).addTo(map);
          markers = L.markerClusterGroup({
            /*unspiderfy: false*/
          });
        }

        // *******************************  markers *******************************
        // set up the custom markers
        const color = "red";
        const weight = 3;
        const opacity = 0.5;

        // create a custom marker colour
        const myCustomColour = '#583470';

        // create a custom marker
        const getMarkerOptions = (myCustomColour:any) => {
          const markerHtmlStyles = `
            background-color: ${myCustomColour};
            width: 2rem;
            height: 2rem;
            display: block;
            left: -1.5rem;
            top: -1.5rem;
            position: relative;
            border-radius: 3rem 3rem 0;
            transform: rotate(45deg);
            border: 1px solid #FFFFFF;`
            
            const icon = L.divIcon({
              className: "my-custom-pin",
              iconAnchor: [0, 24],
              popupAnchor: [0, -36],
              html: `<span style="${markerHtmlStyles}" />`
            })
            // create a custom marker with options
            const markerOptions = {
              icon: icon,
            }
            return markerOptions;
          }
          // create the markers and use the custom marker
          const createMarkers = (events:Event[]) => {
              toRaw(markers).clearLayers();
              events.forEach((place:any) => placeMarkers(place));
  
              toRaw(map).addLayer(toRaw(markers));
          }
          const placeMarkers = function(place:any) {
            const custom = customPopup(place);
            return toRaw(markers).addLayer(L.marker([place.coordinates[0], place.coordinates[1]], {
              title: place.name,
            }).bindPopup(custom, customOptions)
            );
          }
          const clearMarkers = () => {
            markers.forEach((m: any) => map.removeLayer(m));
            markers = [];
          };

        // ****************************** popups **********************************
        // custom popup options
        const customOptions:L.PopupOptions = 
        {
          maxWidth: 280,
          maxHeight: 400,
          // className: 'leaflet-popup-content'
          className: 'custom-popup'
        };

        // clip the coords to 2 decimals
        const fixCoords = function(coords:number[]):number[] {
          let lat:number = parseFloat(coords[0].toFixed(2));
          let lng:number = parseFloat(coords[1].toFixed(2));
          return [lat, lng];
        };

        // create custom popup
        function customPopup(event:{
          id: number;
          name: string;
          date:string;
          coordinates:number[];
          country: string,
          company: string,
        }): string {
          let popupContent = ``;
          let header = `<div class='custom-popup'>`;
            {
              header += `<h4 style='text-align: center; color: blue;' >LCU event</h4>`;
            }
            popupContent += header;
            popupContent += `<br><pre><strong>load carrier id:</strong> ${event.id}
              <br><pre><strong>date:</strong>            ${event.date}
              <br><pre><strong>time:</strong>            ${event.country} 
              <br><pre><strong>location:</strong>        (${fixCoords(event.coordinates)})
              <br><pre><strong>company:</strong>         ${event.company}
              <br><pre><strong>country:</strong>         ${event.country}`;
                      
          popupContent += '</div>';

          return popupContent;
        }

        
        // ****************************** polylines **********************************

        let polyline: L.Polyline | null = null;

        const clearPolyline = () => {
          if (polyline !== null) {
            map.removeLayer(polyline);
          }
        };
        // place the polylines
        const placePolylines = (events:Event[], color:string, weight:number, opacity:number) => {
          // plot polylines ({ lat: number; lng: number })
          let pointList = (events:Event[]):L.LatLngExpression[] => {
            let coord:L.LatLng[] = [];
            for (let point of events) {
              let lat:number = point.coordinates[0];
              let lng:number = point.coordinates[1];
              let coordPoint = new L.LatLng(lat, lng);
              coord.push(coordPoint);
            }
            return coord;
          }

          let positions = pointList(events);
          createPolyline(positions, color, weight, opacity)
        }
        // create the polylines
        const createPolyline = (positions:L.LatLngExpression[], color:string, weight: number, opacity: number ) => {
          clearPolyline();

          polyline = new L.Polyline(positions, {
            color: color,
            weight: weight,
            opacity: opacity,
            interactive: false,
            stroke: true,
            smoothFactor:1
          }).addTo(map);
        };

        // ****************************** lifecycle hooks **********************************
        
        onMounted(() => {
          store.filteredEvents = store.allEvents;
          store.allSelectors;
          all();
          setupLeafletMap();
          createMarkers(store.filteredEvents);
          placePolylines(store.filteredEvents, color, weight, opacity);
          
        });

        onBeforeUnmount(() => {
          if (map) {
            map.remove();
          }
        });

        // ****************************** filters ******************************************
        // selection in filters
        // locations
        const locations = ref(store.selectLocation(store.filteredEvents));
        const locationSelected = ref('');
        // countries
        const companies = ref(store.selectCompany(store.filteredEvents));
        const companySelected = ref('');
        // companies
        const countries = ref(store.selectCountry(store.filteredEvents));
        const countrySelected = ref('');
        // preload filers and set all selectors to 'All'
        const all = () => {
          locations.value = store.selectLocation(store.filteredEvents);
          // console.log("from all: locations: " + JSON.stringify(store.locations));
          locationSelected.value = 'All';
          companies.value = store.selectCompany(store.filteredEvents);
          companySelected.value = 'All';
          countries.value = store.selectCountry(store.filteredEvents);
          countrySelected.value = 'All';
          // store.allSelectors;
        };
        // update filtered events
        const updateFilteredEvents = () => {
          // console.log("updateFilteredEvents called")
          // console.log("updateFilteredEvents, companyFiltered: " + ((store.companyFiltered && store.countryFiltered) != true));
          if ((store.companyFiltered && store.countryFiltered) != true) {
            // console.log("reset the store 1st call");
            store.reset;
          } else if ((store.locFiltered && store.countryFiltered) != true){
            // console.log("reset the store 2nd call");
            store.reset;
          } else if ((store.locFiltered && store.companyFiltered) != true){
            // console.log("reset the store 3nd call");
            store.reset;
          }

        };
        // ****************************** watchers ******************************************
        // watch the selectors for changes
        watch(locationSelected, () => {
          // determine if there are other filters
          if ((store.companyFiltered && store.countryFiltered) != true) {
            // console.log("reset the store in locationFiltered");
            store.filteredEvents = store.allEvents; //reset the store
          } 
          if (locationSelected.value == "All") {
            store.locFiltered = false;
            updateFilteredEvents();
            all();
          }
          // now there is at least one filter applied
          // the both country and company filters are active
          if ((store.companyFiltered && store.countryFiltered) == true) {
            // only provide the remaining location types as selection posibilities
            const availableEvents = getRemainingLocationEvents(store.filteredCompanyEvents, store.filteredCountryEvents[0].country);
            store.selectLocation(store.filteredCompanyEvents);
            // update the state with the available events
            store.filteredEvents = availableEvents;
          }
          // the company filter is active
          if (store.companyFiltered) {
            // only provide the remaining location types as selection posibilities
            const availableEvents = getRemainingLocationEvents(store.filteredCompanyEvents, store.filteredCountryEvents[0].country);
            store.selectLocation(availableEvents);
            // update the state with the available events
            store.filteredEvents = availableEvents; 
          }
          // the country filter is active
          if (store.countryFiltered) {
            // only provide the remaining location types as selection posibilities
            store.selectLocation(store.filteredCountryEvents);
            // update the state with the available events
            store.filteredEvents = store.filteredCountryEvents; 
          }

          // filter the events with the selected location - implement the current location filter
          const events = store.filterByLocation(locationSelected.value, store.filteredEvents);
          // provide only the filtered event type as selection
          store.selectLocation(events);
          // update the filtered events to reflect the selected locations
          store.filteredEvents = events;
          // remember the event selection
          store.filteredLocationEvents = events;
          // update the selctor lists
          const result: [LocationListItem[] | CompanyListItem[], CompanyListItem[] | CountryListItem[]] | null= store.updateSelectors();
          if (result !== null) {
            let [comp, countr] = result;
            // handle the non-null result
            companies.value = comp as CompanyListItem[];
            countries.value = countr as CountryListItem[];
          // } else {
          //   // Handle result is null

          }
          // console.log("companies from store: " + JSON.stringify(store.companySelections));
          // update the local selections
          // companies = store.companySelections;
          // console.log("companies updated: " + JSON.stringify(companies.value));
          // console.log("countries updated: " + JSON.stringify(countries.value));
          // countries = store.countrySelections;
          // console.log("selected location : " + locationSelected.value);
          // console.log("events after filtering, selecting: " + JSON.stringify(events));
          // update the dispaled map with the selected events
          createMarkers(events);
          // createPolyline(color, weight, opacity);
          const color = "red";
          const weight = 3;
          const opacity = 0.5;

          placePolylines(events, color, weight, opacity);
          // update the eventMarker list
          eventMarkers = events;
        }); 

        // company changes
        watch(companySelected, () => {
          // filter the events with the selected events
          if ((store.locFiltered && store.countryFiltered) != true) {
            // console.log("reset the store in companyFiltered");
            store.filteredEvents = store.allEvents; //reset the store
          } 
          if (companySelected.value == "All") {
            store.companyFiltered = false;
            updateFilteredEvents();
            all();
          }
          // now there is at least one filter applied
          // the both country and company filters are active
          if ((store.locFiltered && store.countryFiltered) == true) {
            // only provide the remaining location types as selection posibilities
            const availableEvents = getRemainingCompanyEvents(store.filteredLocationEvents, store.filteredCountryEvents[0].country);
            store.selectCompany(availableEvents);
            // update the state with the available events
            store.filteredEvents = availableEvents;
          }
          // the country filter is active
          if (store.countryFiltered) {
            // only provide the remaining location types as selection posibilities
            store.selectLocation(store.filteredCountryEvents);
            // update the state with the available events
            store.filteredEvents = store.filteredCountryEvents; 
          }
          // the location filter is active
          if (store.locFiltered) {
            // only provide the remaining location types as selection posibilities
            store.selectCountry(store.filteredLocationEvents);
            // update the state with the available events
            store.filteredEvents = store.filteredLocationEvents; 
          }
          // filter only the selected company events 
          const events = store.filterByCompany(companySelected.value, store.filteredEvents);
          // provide only the filtered event type as selection
          store.selectCompany(events);
          // console.log("selected company events : " + JSON.stringify(events));
          // update the filtered events to reflect the selected events
          store.filteredEvents = events;
          // remember the event selection
          // console.log("updating the company selected events");
          store.filteredCompanyEvents = events;
          // update the selector lists
          const result: [LocationListItem[] | CompanyListItem[], CompanyListItem[] | CountryListItem[]] | null= store.updateSelectors();
          if (result !== null) {
            let [loc, countr] = result;
            // handle the non-null result
            // update the local selections
            locations.value = loc as LocationListItem[];
            countries.value = countr as CountryListItem[];
          }
          
          // console.log("selected company : " + companySelected.value);
          // console.log("events after filtering, selecting: " + JSON.stringify(events));
          // update the dispaled map with the selected events
          createMarkers(events);
          // createPolyline(color, weight, opacity);
          const color = "red";
          const weight = 3;
          const opacity = 0.5;

          placePolylines(events, color, weight, opacity);
          eventMarkers = events;
        }); 

        // country changes
        watch(countrySelected, () => {
          // filter the events with the selected events
          if ((store.companyFiltered && store.locFiltered) != true) {
            // console.log("reset the store in countryFiltered");
            store.filteredEvents = store.allEvents; //reset the store
          } 
          if (countrySelected.value == "All") {
            store.countryFiltered = false;
            updateFilteredEvents();
            all();
          }
          // now there is at least one filter applied
          // the both country and company filters are active
          if ((store.locFiltered && store.companyFiltered) == true) {
            // only provide the remaining location types as selection posibilities
            const availableEvents = getRemainingCountryEvents (store.filteredLocationEvents, store.filteredCompanyEvents[0].company);
            store.selectCompany(availableEvents);
            // update the state with the available events
            store.filteredEvents = availableEvents;
          }
          // the company filter is active
          if (store.companyFiltered) {
            // only provide the remaining location types as selection posibilities
            const availableEvents = getRemainingLocationEvents(store.filteredCompanyEvents, store.filteredCountryEvents[0].country);
            store.selectLocation(availableEvents);
            // update the state with the available events
            store.filteredEvents = availableEvents; 
          }
          // the location filter is active
          if (store.locFiltered) {
            // only provide the remaining location types as selection posibilities
            store.selectCountry(store.filteredLocationEvents);
            // update the state with the available events
            store.filteredEvents = store.filteredLocationEvents; 
          }
          const events = store.filterByCountry(countrySelected.value, store.filteredEvents);
          // console.log("watcher events before selecting, selecting: " + JSON.stringify(events));
          // provide only the filtered event type as selection
          store.selectCountry(events);
          // update the filtered events to reflect the selected locations
          store.filteredEvents = events;
          // remember the event selection
          store.filteredCountryEvents = events;
          // update the selctor lists
          const result: [LocationListItem[] | CompanyListItem[], CompanyListItem[] | CountryListItem[]] | null= store.updateSelectors();
          if (result !== null) {
            let [loc, comp] = result;
            // handle the non-null result
            // update the local selections
            locations.value = loc as LocationListItem[];
            companies.value = comp as CompanyListItem[];
          }
          // console.log("watcher selected country : " + countrySelected.value);
          // console.log("watcher events after filtering, selecting: " + JSON.stringify(events));
          // update the dispaled map with the selected events
          createMarkers(events);
          // createPolyline(color, weight, opacity);
          const color = "red";
          const weight = 3;
          const opacity = 0.5;

          placePolylines(events, color, weight, opacity);
          eventMarkers = events;
        });

        return {
            markers,
            eventMarkers,
            cluster,
            setupLeafletMap,
            createMarkers,
            createPolyline,
            locationSelected,
            countrySelected,
            companySelected,
            locations,
            companies,
            countries,
        };
    },
    

});


</script>

<style scoped>
.mapContainer {
  width: 100vw;
  height: 100vh;
}
.map-selector {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
}
.map {
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.2);
  width: 92vw;
  height: 680px;
  cursor: pointer;
  margin-bottom: 10px;
  margin-top: 10px;
  margin-right: 20px;
  border-radius: 25px;
  border: 2px solid rgb(27, 149, 88);
}

.selector {
  display:flex;
  flex-direction: column;
  align-items: center;
  font-weight: bolder;
  padding-left: 25px;
}
.my-custom-pin {
  color: brown;
  background-color: beige;
}

.custom-popup .leaflet-popup-tip, 
.custom-popup .leaflet-popup-content-wrapper {
  color: brown;
  background-color: beige !important;
  background: beige !important;
}
.custom-popup .leaflet-popup-content-wrapper a {
  color:rgba(255,255,255,0.5);
  }
.custom-popup .leaflet-popup-tip-container {
  width:30px;
  height:15px;
  }
.custom-popup .leaflet-popup-tip {
  border-left:15px solid transparent;
  border-right:15px solid transparent;
  border-top:15px solid #2c3e50;
  }
</style>