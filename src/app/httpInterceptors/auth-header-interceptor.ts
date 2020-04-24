import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from '@angular/common/http';
import { catchError, switchMap, finalize, filter, take } from 'rxjs/operators';
import { throwError, Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})

export class AuthHeaderInterceptor implements HttpInterceptor {
    isTokenRefreshing = false;
    refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    refreshAttemptCount = 0;
    constructor(private authService: AuthService, private router: Router) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        request = this.addAuthHeader(request);
        return next.handle(request).pipe(
            catchError((error: HttpResponse<any>) => {
                if (error.status === 401) {
                    return this.refreshAccessToken(request, next);
                }
                else {
                    return throwError(error);
                }
            })
        );
    }

    addAuthHeader(request: HttpRequest<any>) {
        const token = localStorage.getItem('AccessToken');
        if (token) {
            request = request.clone({
                setHeaders: { Authorization: 'Bearer ' + token }
            });
        }
        return request;
    }

    refreshAccessToken(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isTokenRefreshing) {
            this.isTokenRefreshing = true;
            this.refreshTokenSubject.next(null);
            return this.authService.refreshToken().pipe(
                switchMap((authResponse) => {
                    this.authService.setUserDetailsToLocalStorage(authResponse);
                    this.refreshTokenSubject.next(authResponse.access_token);
                    console.log('Token refreshed!');
                    return next.handle(this.addAuthHeader(request));
                }), 
                catchError(error => {
                    // If there is an exception calling 'refreshToken', logout.
                    console.log('Tokens expired!')
                    this.authService.logout(this.router.routerState.snapshot.url);
                    return throwError(error);
                }),
                finalize(() => {
                    this.isTokenRefreshing = false;
                })
            );
        } else {
            return this.refreshTokenSubject
                .pipe(filter(token => token != null),
                    take(1),
                    switchMap(token => {
                        return next.handle(this.addAuthHeader(request));
                    }));
        }
    }
}
