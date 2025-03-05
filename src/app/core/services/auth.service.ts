import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { BehaviorSubject, catchError, Observable, switchMap, of, throwError } from 'rxjs';
import { TOKEN_KEY } from '../constants';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private http: HttpClient) { }

  registerUser(formData: any): Observable<any> {
    return this.http.post(`${environment.apiAuthUrl}/register`, formData);
  }

  login(formData: any): Observable<any> {
    return this.http.post(`${environment.apiAuthUrl}/login`, formData, { withCredentials: true });
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
      } catch (e) {
        console.error('Invalid token format', e);
        return null;
      }
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

  refreshToken(): Observable<any> {
    return this.http.post(`${environment.apiAuthUrl}/refresh`, {}, { withCredentials: true }).pipe(
      switchMap((res: any) => {
        this.deleteToken();
        this.saveToken(res.accessToken);
        return of(res);
      }),
      catchError((err) => {
        console.error('Refresh token failed:', err);
        this.deleteToken();
        return throwError(() => err);
      })
    );
  }


  getProfile(): Observable<any> {
    return this.http.get(`${environment.apiAuthUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${environment.apiAuthUrl}/profile`, data);
  }
}
