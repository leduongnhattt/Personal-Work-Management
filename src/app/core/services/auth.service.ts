import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

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
}
