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
  console.log()
    request = request.clone({
      setHeaders: {
        Authorization: `${this.auth.loadToken()}`, //Barear
        "Access-Control-Allow-Origin" : "true"
      }
    });

    return next.handle(request);
  }
}
