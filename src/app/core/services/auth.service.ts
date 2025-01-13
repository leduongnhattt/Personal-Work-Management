import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { TOKEN_KEY } from '../constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) { }


  registerUser(formData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/register`, formData);
  }


  login(formData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/login`, formData);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }


  saveToken(token: string): void {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }
  deleteToken(): void {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  getProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/profile`, data);
  }
}
