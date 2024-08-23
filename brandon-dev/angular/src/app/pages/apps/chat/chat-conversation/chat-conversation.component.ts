import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chat, ChatMessage } from '../chat.component';
import { trackById } from '@vex/utils/track-by';
import { map } from 'rxjs/operators';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { stagger20ms } from '@vex/animations/stagger.animation';
import { VexScrollbarComponent } from '@vex/components/vex-scrollbar/vex-scrollbar.component';
import { ChatService } from '../chat.service';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'vex-chat-conversation',
  templateUrl: './chat-conversation.component.html',
  styleUrls: ['./chat-conversation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInUp400ms, stagger20ms],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    NgIf,
    MatMenuModule,
    VexScrollbarComponent,
    NgFor,
    ReactiveFormsModule,
    MatDividerModule,
    CommonModule
  ]
})
export class ChatConversationComponent implements OnInit {
  chat?: Chat;
  messages!: ChatMessage[];

  form = new FormGroup({
    message: new FormControl<string>('', {
      nonNullable: true
    })
  });

  trackById = trackById;

  @ViewChild(VexScrollbarComponent)
  scrollbar?: VexScrollbarComponent;

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        map((paramMap) => paramMap.get('chatId')),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((chatId) => {
        this.messages = [];

        if (!chatId) {
          throw new Error('Chat id not found!');
        }

        this.cd.detectChanges();
        const chat = this.chatService.getChat(chatId);

        if (!chat) {
          throw new Error(`Chat with id ${chatId} not found!`);
        }

        this.chat = chat;
        this.chat.unreadCount = 0;
        this.cd.detectChanges();

        this.scrollToBottom();
      });
  }

  send() {
    const message = this.form.controls.message.getRawValue();
    
    if (!message) {
      console.error('Message is empty');
      return;
    }
  
    // Añadir mensaje del usuario a la vista
    this.messages.push({
      id: this.chat!.id,
      from: 'me',
      message: message
    });
  
    // Limpiar el campo de entrada
    this.form.controls.message.setValue('');
  
    // Enviar el mensaje al backend
    this.chatService.sendMessage(message).subscribe(
      response => {
        // Formatear la respuesta de la IA
        const formattedResponse = this.formatResponse(response.response);
        
        // Añadir respuesta de la IA a la vista
        this.messages.push({
          id: this.chat!.id,
          from: 'partner',
          message: formattedResponse
        });
  
        this.cd.detectChanges();
        this.scrollToBottom();
      },
      error => {
        console.error('Error sending message:', error);
      }
    );
  }
  
  formatResponse(response: string): string {
    // Puedes formatear el contenido aquí según sea necesario
    // Por ejemplo, agregar saltos de línea, listas, negritas, etc.
    // Esto es solo un ejemplo básico:
    const paragraphs = response.split('\n').map(paragraph => `<p>${paragraph}</p>`);
    return paragraphs.join('');
  }
  
  
  

  scrollToBottom() {
    if (!this.scrollbar) {
      return;
    }

    this.scrollbar.scrollbarRef?.getScrollElement()?.scrollTo({
      behavior: 'smooth',
      top: this.scrollbar.scrollbarRef.getContentElement()?.clientHeight
    });
  }

  openDrawer() {
    this.chatService.drawerOpen.next(true);
    this.cd.markForCheck();
  }

  closeDrawer() {
    this.chatService.drawerOpen.next(false);
    this.cd.markForCheck();
  }
}
