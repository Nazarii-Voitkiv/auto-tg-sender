import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../services/api.service';
import { Message } from '../../interfaces/message.interface';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];
  messageForm: FormGroup;
  displayedColumns: string[] = ['text', 'created', 'actions'];
  expandedMessages = new Set<string>();

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService
  ) {
    console.log('MessagesComponent initialized');
    this.messageForm = this.formBuilder.group({
      text: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    console.log('MessagesComponent.ngOnInit()');
    this.loadMessages();
  }

  loadMessages(): void {
    console.log('Loading messages...');
    this.apiService.getMessages().subscribe({
      next: (messages) => {
        console.log('Messages loaded:', messages);
        this.messages = messages;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        alert('Error loading messages: ' + JSON.stringify(error));
      }
    });
  }

  toggleExpandedMessage(message: Message): void {
    if (this.expandedMessages.has(message.id)) {
      this.expandedMessages.delete(message.id);
    } else {
      this.expandedMessages.add(message.id);
    }
  }

  isExpanded(message: Message): boolean {
    return this.expandedMessages.has(message.id);
  }

  addMessage(): void {
    console.log('Adding message...');
    
    if (this.messageForm.valid) {
      const text = this.messageForm.get('text')?.value;
      console.log('Message text:', text);
      
      this.apiService.addMessage(text).subscribe({
        next: (newMessage) => {
          console.log('Message added:', newMessage);
          this.messages = [...this.messages, newMessage];
          this.messageForm.reset();
        },
        error: (error) => {
          console.error('Error adding message:', error);
          alert('Error adding message: ' + JSON.stringify(error));
        }
      });
    }
  }

  deleteMessage(message: Message): void {
    console.log('Deleting message:', message);
    
    this.apiService.deleteMessage(message.id).subscribe({
      next: () => {
        console.log('Message deleted:', message.id);
        this.messages = this.messages.filter(m => m.id !== message.id);
      },
      error: (error) => {
        console.error('Error deleting message:', error);
        alert('Error deleting message: ' + JSON.stringify(error));
      }
    });
  }
}
