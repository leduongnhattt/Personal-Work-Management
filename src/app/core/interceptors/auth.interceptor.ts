import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastrService);

  const token = authService.getToken();
  const cloneRequest = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(cloneRequest).pipe(
    catchError((error: any) => {

      if (error.status === 401) {
        console.log('Token expired, trying to refresh...');

        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            const newToken = res.accessToken;
            if (newToken) {
              authService.saveToken(newToken);
              const retryRequest = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${newToken}`)
              });
              return next(retryRequest);
            }
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            console.error('Refresh token failed:', refreshError);
            authService.deleteToken();
            toast.info('Please login again', 'Session Expired!');
            router.navigateByUrl('/login');
            return throwError(() => refreshError);
          })
        );
      } else if (error.status === 403) {
        toast.error("Ooops! It seems you're not authorized to perform this action.");
      }
      return throwError(() => error);
    })
  );
};
