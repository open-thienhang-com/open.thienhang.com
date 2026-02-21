export interface Trip {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    status: 'Upcoming' | 'In Progress' | 'Completed';
    coverImage: string;
    itinerary: ItineraryItem[];
    planningList: PlanningItem[];
}

export interface ItineraryItem {
    day: number;
    title: string;
    description: string;
    icon: string;
    color: string;
    activities: Activity[];
}

export interface Activity {
    time: string;
    description: string;
}

export interface PlanningItem {
    id: number;
    task: string;
    completed: boolean;
}
