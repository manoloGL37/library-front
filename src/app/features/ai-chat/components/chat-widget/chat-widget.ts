import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-widget',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss',
})
export class ChatWidget {
@ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  isOpen = false;
  messages: ChatMessage[] = [];
  conversationId: string = '';
  userInput: string = '';
  isLoading: boolean = false;
  isTyping: boolean = false;
  hasStarted: boolean = false;
  
  private subscription?: Subscription;
  private shouldScrollToBottom = false;
  
  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) {}
  
  ngOnInit() {}
  
  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
  
  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }
  
  toggleChat() {
    this.isOpen = !this.isOpen;
    
    // Iniciar conversación solo la primera vez que se abre
    if (this.isOpen && !this.hasStarted) {
      this.hasStarted = true;
      this.startChat();
    }
  }
  
  onEnterPress(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    
    if (!keyboardEvent.shiftKey) {
      this.sendMessage();
    } else {
      this.userInput += '\n';
    }
  }
  
  startChat() {
    this.isLoading = true;
    
    const tempMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    this.messages.push(tempMessage);
    this.isTyping = true;
    this.shouldScrollToBottom = true;
    
    this.subscription = this.chatService.startConversation().subscribe({
      next: ({ conversationId, message }) => {
        if (conversationId) this.conversationId = conversationId;
        tempMessage.content = message;
        this.shouldScrollToBottom = true;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
        this.isTyping = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error starting chat:', error);
        this.isLoading = false;
        this.isTyping = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;
    
    this.messages.push({
      role: 'user',
      content: this.userInput,
      timestamp: new Date()
    });
    this.shouldScrollToBottom = true;
    
    const messageToSend = this.userInput;
    this.userInput = '';
    this.isLoading = true;
    this.isTyping = true;
    
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    this.messages.push(assistantMessage);
    this.shouldScrollToBottom = true;
    
    this.subscription = this.chatService.sendMessage(this.conversationId, messageToSend)
      .subscribe({
        next: (response) => {
          assistantMessage.content = response;
          this.shouldScrollToBottom = true;
          this.cdr.detectChanges();
        },
        complete: () => {
          this.isLoading = false;
          this.isTyping = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error:', error);
          this.isLoading = false;
          this.isTyping = false;
          this.cdr.detectChanges();
        }
      });
  }
  
  private scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
