import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { TOKEN_KEY } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }
  registerUser(formData: any) {
    return this.http.post(environment.apiUrl + '/register', formData);
  }
  login(formData: any) {
    return this.http.post(environment.apiUrl + '/login', formData);
  }
  isLoggedIn() {
    return this.getToken() != null ? true : false;
  }
  saveToken(token: string) {
    if (typeof window !== 'undefined' && localStorage) {
        localStorage.setItem(TOKEN_KEY, token);
    }
  }
  getToken() {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }
  deleteToken() {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
  getProfile() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.get(environment.apiUrl + '/profile', { headers });
  }
}
