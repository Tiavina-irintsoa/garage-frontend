import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Service } from '../models/service.interface';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  constructor(private http: HttpService) {}

  getAllServices(): Observable<Service[]> {
    return this.http
      .get<any>('/services/all')
      .pipe(map((response) => response.data.services));
  }
}
