import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { Service, ServiceResponse } from '../models/service.interface';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private readonly endpoint = '/services';

  constructor(private http: HttpService) {}

  getServices(): Observable<ServiceResponse> {
    return this.http.authenticatedGet<ServiceResponse>(this.endpoint);
  }

  createService(service: Service): Observable<ServiceResponse> {
    return this.http.authenticatedPost<ServiceResponse>(this.endpoint, service);
  }

  updateService(id: string, service: Service): Observable<ServiceResponse> {
    return this.http.authenticatedPut<ServiceResponse>(
      `${this.endpoint}/${id}`,
      service
    );
  }

  deleteService(id: string): Observable<ServiceResponse> {
    return this.http.authenticatedDelete<ServiceResponse>(
      `${this.endpoint}/${id}`
    );
  }
}
