import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isLoading = signal<boolean>(false);
  public user: BehaviorSubject<any> = new BehaviorSubject<any>({});
  public clientId: BehaviorSubject<any> = new BehaviorSubject<any>(0);

  show() {
    this.isLoading.set(true);
  }

  hide() {
    this.isLoading.set(false);
  }
}
