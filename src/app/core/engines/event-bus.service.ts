import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface SystemEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private eventSubject = new Subject<SystemEvent>();
  public events$ = this.eventSubject.asObservable();

  emit(event: Omit<SystemEvent, 'timestamp'>): void {
    this.eventSubject.next({
      ...event,
      timestamp: new Date()
    });
  }

  on(eventType: string): Observable<SystemEvent> {
    return this.events$.pipe(
      // Filter by event type would be implemented with RxJS operators
      // For now, return all events and let subscribers filter
    ) as Observable<SystemEvent>;
  }
}

