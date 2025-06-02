import { Injectable    } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class HttpHandlerService {

    constructor(private http: HttpClient) {}

  // Helper to create headers (default + custom)
  private createHeaders(customHeaders?: HttpHeaders | { [header: string]: string }): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json', // default
      ...customHeaders // override/add custom headers
    });
    return headers;
  }
  post<T>(url: string, body: any, customHeaders?: HttpHeaders | { [header: string]: string }): Observable<HttpResponse<T>> {
    const headers = this.createHeaders(customHeaders);
    return this.http.post<T>(url, body, {
      headers,
      observe: 'response',
      withCredentials: true, // crucial for sending cookies/sessions
    });
  }

  get<T>(url: string, customHeaders?: HttpHeaders | { [header: string]: string }): Observable<HttpResponse<T>> {
    const headers = this.createHeaders(customHeaders);
    return this.http.get<T>(url, {
      headers,
      observe: 'response',
      withCredentials: true,
    });
  }

  put<T>(url: string, body: any, customHeaders?: HttpHeaders | { [header: string]: string }): Observable<HttpResponse<T>> {
    const headers = this.createHeaders(customHeaders);
    return this.http.put<T>(url, body, {
      headers,
      observe: 'response',
      withCredentials: true,
    });
  }

  delete<T>(url: string, customHeaders?: HttpHeaders | { [header: string]: string }): Observable<HttpResponse<T>> {
    const headers = this.createHeaders(customHeaders);
    return this.http.delete<T>(url, {
      headers,
      observe: 'response',
      withCredentials: true,
    });
  }
}
