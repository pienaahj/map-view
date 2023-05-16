// define the Event interface
export interface Event {
        id: number;
        name: string;
        date:string;
        coordinates:number[];
        country: string,
        company: string,
      }

      
      // define a shared state for every list item
      export interface SharedState {
        active: boolean;
      }
      
      // define a list of companies
      export interface CompanyListItem {
        id: number;
        company: string;
      }
      
      // define a list of countries
      export interface CountryListItem {
        id: number;
        country: string;
      }
      // define  a location List Item
      export interface LocationListItem {
        id: number;
        location: string;
      }