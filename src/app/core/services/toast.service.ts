import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messages$ = new BehaviorSubject<ToastMessage[]>([]);
  private messageIdCounter = 0;

  getMessages(): Observable<ToastMessage[]> {
    return this.messages$.asObservable();
  }

  show(message: string, type: ToastMessage['type'] = 'info', duration: number = 3000): void {
    const toast: ToastMessage = {
      id: `toast_${this.messageIdCounter++}_${Date.now()}`,
      message,
      type,
      duration
    };

    const currentMessages = this.messages$.value;
    this.messages$.next([...currentMessages, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  remove(id: string): void {
    const currentMessages = this.messages$.value;
    this.messages$.next(currentMessages.filter(msg => msg.id !== id));
  }

  clear(): void {
    this.messages$.next([]);
  }
}





