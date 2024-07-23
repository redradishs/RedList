import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, inject, Injectable, INJECTOR, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { isLocalStorageAvailable } from '../shared/environment.utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost/todolistapi/api';
  private tokenKey = 'jwt';
  private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object, private router: Router) {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getToken();
      if (token) {
        this.currentUserSubject.next(this.decodeToken(token).data);
      }
    }
  }

  userLogin(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, data)
     .pipe(
        catchError(this.handleError)
      );
  }

  userSignUp(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/signup`, data)
     .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid username or password.';
          break;
        case 404:
          errorMessage = 'No user matched.';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }


  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId) && isLocalStorageAvailable()) {
      localStorage.setItem(this.tokenKey, token);
      this.currentUserSubject.next(this.decodeToken(token).data);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId) && isLocalStorageAvailable()) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  getCollage(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/getImage`)
      .pipe(
        catchError(this.handleError)
      );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.isTokenExpired(token) : false;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId) && isLocalStorageAvailable()) {
      localStorage.removeItem(this.tokenKey);
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']); 
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Decode the JWT token
  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Invalid token format:', e);
      return null;
    }
  }

  // Check if the token is expired
  private isTokenExpired(token: string): boolean {
    const decodedToken = this.decodeToken(token);
    if (decodedToken && decodedToken.exp) {
      const expirationDate = new Date(0);
      expirationDate.setUTCSeconds(decodedToken.exp);
      return expirationDate < new Date();
    }
    return true;
  }

  // userid getter
  getCurrentUser(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }
}
