// *************************************** utilities ************************************
import type { Event, CountryListItem, CompanyListItem, LocationListItem } from '@/model/event';
// get all unique events by id
export function findUnique(db: Event[]): LocationListItem[] {
    const outputdb: LocationListItem[] = [];
    // find all unique items
    const unique = [...new Set(db.map((item) => item.name))];
    // console.log("Unique countries: " + JSON.stringify(unique));
    outputdb.push({id: 0, location: "All"});
    let id = 1;
    for (const name of unique) {
        outputdb.push({id: id, location: name});
        id++;
    }
    // console.log("Unique countries: " + JSON.stringify(outputdb));
    return outputdb;
}
// get all unique events by country
export function findUniqueCountry(db: Event[]): CountryListItem[] {
    const outputdb: CountryListItem[] = [];
    // find all unique items
    const unique = [...new Set(db.map((item) => item.country))];
    // console.log("Unique countries: " + JSON.stringify(unique));
    outputdb.push({id: 0, country: "All"});
    let id = 1;
    for (const country of unique) {
        outputdb.push({id: id, country: country});
        id++;
    }
    // console.log("Unique countries: " + JSON.stringify(outputdb));
    return outputdb;
}
// get all unique events by company
export function findUniqueCompany(db: Event[]):CompanyListItem[] {
    const outputdb: CompanyListItem[] = [];
    // find all unique items
    const unique = [...new Set(db.map((item) => item.company))];
    // console.log("Unique companies: " + JSON.stringify(unique));
    outputdb.push({id: 0, company: "All"});
    let id = 1;
    for (const company of unique) {
        outputdb.push({id: id, company: company});
        id++;
    }
    // console.log("Unique companies: " + JSON.stringify(outputdb));
    return outputdb;
}

declare global {
    interface Array<T> {
      unique(): Array<T>;
    }
  }
  
  Array.prototype.unique = function <T>(): Array<T> {
    const arr: Array<T> = [];
    for (let i = 0; i < this.length; i++) {
      if (!arr.includes(this[i])) {
        arr.push(this[i]);
      }
    }
    return arr;
  };