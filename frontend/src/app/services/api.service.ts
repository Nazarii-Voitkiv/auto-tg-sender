import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Message } from '../interfaces/message.interface';
import { Group } from '../interfaces/group.interface';
import { EnvVars } from '../interfaces/env.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Messages
  getMessages(): Observable<Message[]> {
    console.log('Getting messages...');
    return this.http.get<Message[]>(`${this.API_URL}/messages`).pipe(
      tap(messages => console.log('Received messages:', messages))
    );
  }

  addMessage(text: string): Observable<Message> {
    console.log('Adding message:', text);
    return this.http.post<Message>(`${this.API_URL}/messages`, { text }).pipe(
      tap(message => console.log('Added message:', message))
    );
  }

  deleteMessage(id: string): Observable<void> {
    console.log('Deleting message:', id);
    return this.http.delete<void>(`${this.API_URL}/messages/${id}`).pipe(
      tap(() => console.log('Deleted message:', id))
    );
  }

  // Groups
  getGroups(): Observable<Group[]> {
    console.log('Getting groups...');
    return this.http.get<Group[]>(`${this.API_URL}/groups`).pipe(
      tap(groups => console.log('Received groups:', groups))
    );
  }

  addGroup(text: string): Observable<Group> {
    console.log('Adding group:', text);
    return this.http.post<Group>(`${this.API_URL}/groups`, { text }).pipe(
      tap(group => console.log('Added group:', group))
    );
  }

  deleteGroup(id: string): Observable<void> {
    console.log('Deleting group:', id);
    return this.http.delete<void>(`${this.API_URL}/groups/${id}`).pipe(
      tap(() => console.log('Deleted group:', id))
    );
  }

  // Environment Variables
  getEnvVars(): Observable<EnvVars> {
    console.log('Getting env vars...');
    return this.http.get<EnvVars>(`${this.API_URL}/env`).pipe(
      tap(vars => console.log('Received env vars:', vars))
    );
  }

  updateEnvVars(vars: EnvVars): Observable<EnvVars> {
    console.log('Updating env vars:', vars);
    return this.http.post<EnvVars>(`${this.API_URL}/env`, vars).pipe(
      tap(updatedVars => console.log('Updated env vars:', updatedVars))
    );
  }
}
