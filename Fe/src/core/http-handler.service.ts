import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
  HttpEventType,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

interface RequestOptions {
  customHeaders?: HttpHeaders | { [header: string]: string | string[] };
  queryParams?: HttpParams | { [param: string]: string | string[] };
  observe?: 'body' | 'response';
  withCredentials?: boolean;
  reportProgress?: boolean;
}
type CustomHTTPResponse<T> = Observable<T> | Observable<HttpResponse<T>> | Observable<HttpEvent<T>>;
@Injectable({
  providedIn: 'root',
  
})
export class HttpHandlerService {
  private http = inject(HttpClient);

  // --- METHOD OVERLOADS  AND IMPLEMENTS ---

  get<T>(url: string, options: RequestOptions & { observe: 'response' }): Observable<HttpResponse<T>>;
  get<T>(url: string, options?: RequestOptions): Observable<T>;
  // implements
  get<T>(url: string, options: RequestOptions = {}): any {
    return this.http.get<T>(url, this.buildOptions(options));
  }
  post<T>(url: string, body: any, options: RequestOptions & { observe: 'response' }): Observable<HttpResponse<T>>;
  post<T>(url: string, body: any, options?: RequestOptions): Observable<T>;
  // implements
  post<T>(url: string, body: any, options: RequestOptions = {}): any {
    return this.http.post<T>(url, body, this.buildOptions(options));
  }

  put<T>(url: string, body: any, options: RequestOptions & { observe: 'response' }): Observable<HttpResponse<T>>;
  put<T>(url: string, body: any, options?: RequestOptions): Observable<T>;
  // implements
  put<T>(url: string, body: any, options: RequestOptions = {}): any {
    return this.http.put<T>(url, body, this.buildOptions(options));
  }

  delete<T>(url: string, options: RequestOptions & { observe: 'response' }): Observable<HttpResponse<T>>;
  delete<T>(url: string, options?: RequestOptions): Observable<T>;
  // implements
  delete<T>(url: string, options: RequestOptions = {}): any {
    return this.http.delete<T>(url, this.buildOptions(options));
  }





  // --- HELPERS ---

  private buildOptions(options: RequestOptions): any {
    const headers = this.createHeaders(options.customHeaders);
    const params = this.createParams(options.queryParams);

    return {
      headers,
      params,
      observe: this.getObserveValue(options),
      withCredentials: options.withCredentials ?? true,
      reportProgress: options.reportProgress ?? false,
    };
  }

  private getObserveValue(options: RequestOptions): 'body' | 'response' {
    // If observe is manually set, use it
    if (options.observe) return options.observe;
    // If custom headers are provided, use 'response' to give access to full metadata
    return options.customHeaders ? 'response' : 'body';
  }

  private createHeaders(
    customHeaders?: HttpHeaders | { [header: string]: string | string[] }
  ): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (customHeaders) {
      if (customHeaders instanceof HttpHeaders) {
        headers = customHeaders;
      } else {
        for (const key in customHeaders) {
          const value = customHeaders[key];
          if (Array.isArray(value)) {
            value.forEach((v) => (headers = headers.append(key, v)));
          } else {
            headers = headers.set(key, value);
          }
        }
      }
    }

    return headers;
  }

  private createParams(queryParams?: HttpParams | { [param: string]: string | string[] }): HttpParams | undefined {
    if (!queryParams) return undefined;

    if (queryParams instanceof HttpParams) return queryParams;

    let params = new HttpParams();
    for (const key in queryParams) {
      const value = queryParams[key];
      if (Array.isArray(value)) {
        value.forEach((v) => (params = params.append(key, v)));
      } else {
        params = params.set(key, value);
      }
    }
    return params;
  }
}



