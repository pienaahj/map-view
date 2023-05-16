import type { Event } from '@/model/event';
// getRemainingLocationEvents takes company filtered db and a country filter value
export function getRemainingLocationEvents(db:Event[], filterValue:string) : Event[] {
    // loop through the first db
    // if the second db filtered field is present add the event
     const events = db.filter(function (event) {
        return event.company === filterValue;
    });
    
    return events
    }

// getRemainingCompanyEvents takes country filtered db and a location-name filter value
export function getRemainingCompanyEvents(db:Event[], filterValue:string) : Event[] {
    // loop through the first db
    // if the second db filtered field is present add the event
     const events = db.filter(function (event) {
        return event.name === filterValue;
    });
    
    return events
    }
    
// getRemainingCountryEvents takes lacation-name filtered db and a company filter value
export function getRemainingCountryEvents(db:Event[], filterValue:string) : Event[] {
    // loop through the first db
    // if the second db filtered field is present add the event
     const events = db.filter(function (event) {
        return event.company === filterValue;
    });
    
    return events
    }