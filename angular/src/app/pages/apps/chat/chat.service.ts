import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Chat } from './chat.component';
import { randFullName } from '@ngneat/falso';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/ask';

  chats: Chat[] = [
    {
      id: '2',
      imageUrl: '/assets/img/avatars/2.jpg',
      name: "Brandon IA",
      lastMessage: 'Preguntame sobre autos',
      unreadCount: 0,
      timestamp: '3 minutes ago'
    }
  ];
  drawerOpen = new BehaviorSubject<boolean>(false);
  drawerOpen$ = this.drawerOpen.asObservable();

  constructor(private http: HttpClient) {}

  getChat(chatId: string): Chat | undefined {
    return this.chats.find((chat) => chat.id === chatId);
  }

  sendMessage(prompt: string): Observable<any>  {
    return this.http.post<any>(this.apiUrl, { prompt });
  }
  
}
