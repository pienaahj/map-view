<template>
    <header>
      <div class="flex-container">
        <nav class="map-selector">
            <div>
              <label for="">Select location</label>
              <select v-model="locationSelected">
                <option v-for="location in locations" :key="location.id">
                {{ location.location }}
                </option>
              </select>
            </div>
            <div>
              <input type="text">
              <button>Select Country</button>
            </div>
            <div>
              <input type="text">
              <button>Select Company</button>
            </div>
        </nav>
      </div>
    </header>
    
        
    <main>
      <div class="map custom-popup" id="mapContainer"></div>
      <div>
        <ul>
          <li v-for="place in events" :key="place.id">{{ place.name }}</li>
        </ul>
      </div>
    </main>
  </template>

<script lang="ts">

import L from "leaflet";
import "leaflet.markercluster";
import { defineComponent, toRaw, onMounted, onBeforeUnmount, ref, watch } from "vue";
import destinations from "@/assets/southAfrica.json";
import { Event } from "@/model/event";

import { useMapStore }  from '@/stores/map';

export default defineComponent ({
    name: 'MapView',
    setup() {
        // interface Event {
        //   id: number;
        //   name: string;
        //   date:string;
        //   coordinates:number[];
        //   country: string,
        //   company: string,
        // }
        // get a mapstore from pinia
        const store = useMapStore();

        const center:any = [-29.07, 26.18];
        const default_zoom :number= 6;
        let map: L.Map;
        let cluster:any = null;
        let markers:any = null;
        const eventString = JSON.stringify(destinations)
        let allEvents: Event[] = JSON.parse(eventString);
        let events: Event[] = allEvents;
        // let destinationData:Event = destinations;
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
        

        // Polylines
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
          // const color = "red";
          // const weight = 3;
          // const opacity = 0.5;
          createPolyline(positions, color, weight, opacity)
        }
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
        // plot polylines ({ lat: number; lng: number })
        // let pointList = (events:Event[]):L.LatLngExpression[] => {
        //   let coord:L.LatLng[] = [];
        //   for (let point of events) {
        //     let lat:number = point.coordinates[0];
        //     let lng:number = point.coordinates[1];
        //     let coordPoint = new L.LatLng(lat, lng);
        //     coord.push(coordPoint);
        //   }
        //   return coord;
        // }

        // let positions = pointList(events:Event[]);
        // const color = "red";
        // const weight = 3;
        // const opacity = 0.5;
        // const createPolyline = (color:string, weight: number, opacity: number ) => {
        //   clearPolyline();

        //   polyline = new L.Polyline(positions, {
        //     color: color,
        //     weight: weight,
        //     opacity: opacity,
        //     interactive: false,
        //     stroke: true,
        //     smoothFactor:1
        //   }).addTo(map);
        // };

        onMounted(() => {
          setupLeafletMap();
          createMarkers(allEvents);
          // createPolyline(color, weight, opacity);
          const color = "red";
          const weight = 3;
          const opacity = 0.5;

          placePolylines(allEvents, color, weight, opacity);
        });

        onBeforeUnmount(() => {
          if (map) {
            map.remove();
          }
        });

        // selection in filters
        const locations = store.selectLocation(destinations);
        const locationSelected = ref('');

        // watch the selectors for changes
        watch(locationSelected, () => {
          // filter the events with the selected events
          events = store.filterByLocation(locationSelected.value, allEvents);
          store.selectLocation(events);
          console.log("selected location : " + locationSelected.value);
          console.log("events after filtering, selecting: " + JSON.stringify(events));
          // update the dispaled map with the selected events
          createMarkers(events);
          // createPolyline(color, weight, opacity);
          const color = "red";
          const weight = 3;
          const opacity = 0.5;

          placePolylines(events, color, weight, opacity);
        });  

        // update map with the computed filters
        // const locationFilter = computed((loc:Ref<string>) => {
        //   const locationEvents = store.filterByLocation
        //   createMarkers(locationEvents{db:});
        //   // createPolyline(color, weight, opacity);
        //   const color = "red";
        //   const weight = 3;
        //   const opacity = 0.5;

        //   placePolylines(allEvents, color, weight, opacity);
        //   return locationEvents;
        // })



        return {
            markers,
            cluster,
            setupLeafletMap,
            createMarkers,
            events,
            createPolyline,
            locations,
            locationSelected,
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