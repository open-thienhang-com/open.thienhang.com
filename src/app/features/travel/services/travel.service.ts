import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Trip } from '../models/travel.model';

@Injectable({
  providedIn: 'root'
})
export class TravelService {

  private mockTrips: Trip[] = [
    {
      id: '1',
      title: 'Summer in Japan',
      destination: 'Tokyo, Kyoto, Osaka',
      startDate: '2024-07-15',
      endDate: '2024-07-25',
      status: 'Upcoming',
      coverImage: 'https://source.unsplash.com/random/800x600?japan',
      itinerary: [
        { day: 1, title: 'Arrival in Tokyo', description: 'Check-in and explore Shinjuku', icon: 'pi pi-fw pi-map-marker', color: '#60A5FA', activities: [{ time: '14:00', description: 'Arrive at Narita Airport' }, { time: '16:00', description: 'Check into hotel in Shinjuku' }] },
        { day: 2, title: 'Tokyo Culture', description: 'Visit Senso-ji Temple and Ueno Park', icon: 'pi pi-fw pi-camera', color: '#34D399', activities: [] },
        { day: 3, title: 'Travel to Kyoto', description: 'Take the Shinkansen to Kyoto', icon: 'pi pi-fw pi-send', color: '#FBBF24', activities: [] },
      ],
      planningList: [
        { id: 1, task: 'Book flights', completed: true },
        { id: 2, task: 'Reserve hotels', completed: true },
        { id: 3, task: 'Get Japan Rail Pass', completed: false },
        { id: 4, task: 'Plan daily budget', completed: false },
      ]
    },
    {
      id: '2',
      title: 'Exploring the Alps',
      destination: 'Switzerland',
      startDate: '2024-08-10',
      endDate: '2024-08-20',
      status: 'Upcoming',
      coverImage: 'https://source.unsplash.com/random/800x600?alps',
      itinerary: [],
      planningList: []
    },
    {
      id: '3',
      title: 'Beach Getaway',
      destination: 'Thailand',
      startDate: '2023-12-20',
      endDate: '2023-12-30',
      status: 'Completed',
      coverImage: 'https://source.unsplash.com/random/800x600?thailand',
      itinerary: [],
      planningList: []
    }
  ];

  constructor() { }

  getTrips(): Observable<Trip[]> {
    return of(this.mockTrips).pipe(delay(500));
  }

  getTripById(id: string): Observable<Trip | undefined> {
    const trip = this.mockTrips.find(t => t.id === id);
    return of(trip).pipe(delay(500));
  }
}
