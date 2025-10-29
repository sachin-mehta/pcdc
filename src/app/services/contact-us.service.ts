import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/_environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ContactUsService {
options: any;
  constructor(private http: HttpClient) { 
    this.options = {
      Observe: 'response',
      headers: new HttpHeaders({
        'Content-type': 'application/json',
      }),
    };
  }

   /**
   *  Post Contact Form Data to /contact/contact
   * @param contactData Contact form payload
   */
  postContact(contactData: any): Observable<any> {
    return this.http.post(environment.gigaMapsAPI + 'contact/contact/', contactData, this.options).pipe(
      tap(response => console.log('Contact submitted:', response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: Response) {
      return throwError(error);
    }

}
