import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private sidebarVisibilitySubject = new BehaviorSubject<boolean>(true);
  sidebarVisibility$ = this.sidebarVisibilitySubject.asObservable();

  toggleSidebar() {
    const currentVisibility = this.sidebarVisibilitySubject.value;
    this.sidebarVisibilitySubject.next(!currentVisibility);
  }

  hideSidebar() {
    this.sidebarVisibilitySubject.next(false); 
  }
}
