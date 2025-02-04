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
    return this.http.post(`${environment.apiAuthUrl}/register`, formData);
  }


  login(formData: any): Observable<any> {
    return this.http.post(`${environment.apiAuthUrl}/login`, formData);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    }
    return null;
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
    return this.http.get(`${environment.apiAuthUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${environment.apiAuthUrl}/profile`, data);
  }
}
