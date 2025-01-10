import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastrService);

  const token = authService.getToken();

  if (authService.isLoggedIn() && token) {
    const cloneRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    return next(cloneRequest).pipe(
      catchError((error: any) => {
        if (error.status === 401) {
          authService.deleteToken();
          setTimeout(() => {
            toast.info('Please login again', 'Session Expired!');
          });
          router.navigateByUrl('/login');
        } else if (error.status === 403) {
          toast.error("Ooops! It seems you're not authorized to perform the action.");
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
