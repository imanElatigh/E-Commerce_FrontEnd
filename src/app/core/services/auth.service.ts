import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'token';
  private userIdKey = 'user_id';

  // Create a BehaviorSubject with initial value false
  private authStatusSubject = new BehaviorSubject<boolean>(false);

  // Expose the observable part of the BehaviorSubject
  public authStatus$: Observable<boolean> =
    this.authStatusSubject.asObservable();

  constructor(private router: Router) {
    // Initialize the auth status
    const isAuthenticated = this.isAuthenticated();
    this.authStatusSubject.next(isAuthenticated);
  }

  isAuthenticated(): boolean {
    // Check for both token and user_id
    return (
      localStorage.getItem(this.tokenKey) !== null &&
      localStorage.getItem(this.userIdKey) !== null
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.userIdKey);
  }

  // Method to set authentication data
  setAuthentication(
    token: string,
    userId: string,
    expiresInDays: number = 7
  ): void {
    // Set token and userId in localStorage
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userIdKey, userId);

    // If you want to keep track of expiration:
    const expirationDate = new Date(
      new Date().getTime() + expiresInDays * 24 * 60 * 60 * 1000
    ).toISOString();
    localStorage.setItem('tokenExpires', expirationDate);

    // Update the auth status
    this.authStatusSubject.next(true);
  }

  logout(): void {
    // Remove items from localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem('tokenExpires');

    // Update the auth status
    this.authStatusSubject.next(false);

    this.router.navigate(['/login']);
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
