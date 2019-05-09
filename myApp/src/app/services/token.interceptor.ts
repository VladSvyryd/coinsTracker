import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthServiceService } from './auth-service.service';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(public auth: AuthServiceService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(!request.url.endsWith('/login')){      }

      request = request.clone({
        setHeaders: {
          "Access-Control-Allow-Origin": "true",
          "Authorization": `${this.auth.loadToken()}`, //Barear
          'Content-Type': 'application/json'
        }
      });
    return next.handle(request);
  }
}
