import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatService } from '../../core/services/chat.service';
import { ChatMessage } from '../../core/models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    // Subscribe to messages from the chat service
    this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      // Use setTimeout to ensure the view is updated
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessage.trim() || this.isLoading) return;

    try {
      this.isLoading = true;
      await this.chatService.sendMessage(this.newMessage);
      this.newMessage = '';
      // Use setTimeout to ensure the view is updated
      setTimeout(() => this.scrollToBottom(), 0);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      this.isLoading = false;
    }
  }

  clearChat(): void {
    if (confirm('Are you sure you want to clear the chat history?')) {
      this.chatService.clearChat();
      // Use setTimeout to ensure the view is updated
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  private scrollToBottom(): void {
    try {
      if (!this.chatContainer?.nativeElement) {
        return;
      }
      const element = this.chatContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
