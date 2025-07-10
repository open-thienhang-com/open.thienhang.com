import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { ConnectionService } from '../services/connection.service';

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
    private readonly TIMEOUT_DURATION = 30000; // 30 seconds

    constructor(private connectionService: ConnectionService) { }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            timeout(this.TIMEOUT_DURATION),
            catchError(error => {
                if (error instanceof TimeoutError) {
                    this.connectionService.checkTimeout(error);
                }
                return throwError(() => error);
            })
        );
    }
}
