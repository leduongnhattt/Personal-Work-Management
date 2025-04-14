import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage } from '../models/chat.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OpenAIService } from './openai.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  // Knowledge base for the AI
  private knowledgeBase = {
    greetings: {
      patterns: ['xin chào', 'hello', 'hi', 'chào', 'hey'],
      responses: ['Xin chào! Tôi có thể giúp gì cho bạn?', 'Chào bạn! Bạn cần tôi giúp gì không?']
    },
    thanks: {
      patterns: ['cảm ơn', 'thanks', 'thank you'],
      responses: ['Không có gì!', 'Rất vui được giúp bạn!', 'Bạn quá khen!']
    },
    goodbye: {
      patterns: ['tạm biệt', 'bye', 'goodbye'],
      responses: ['Tạm biệt! Hẹn gặp lại!', 'Chúc bạn một ngày tốt lành!']
    }
  };

  constructor(
    private http: HttpClient,
    private openaiService: OpenAIService
  ) {
    // Load chat history from localStorage if available
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      const messages = JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      this.messagesSubject.next(messages);
    }
  }

  async sendMessage(content: string): Promise<void> {
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    // Add user message
    this.addMessage(userMessage);

    try {
      // First check if it's a basic question
      const basicResponse = this.generateBasicResponse(content);
      if (basicResponse) {
        const aiResponse: ChatMessage = {
          id: this.generateId(),
          content: basicResponse,
          sender: 'assistant',
          timestamp: new Date()
        };
        this.addMessage(aiResponse);
        return;
      }

      // If not a basic question, use OpenAI API
      const context = this.getChatContext();
      try {
        const aiResponse = await this.openaiService.getChatResponse(content, context);
        const aiMessage: ChatMessage = {
          id: this.generateId(),
          content: aiResponse,
          sender: 'assistant',
          timestamp: new Date()
        };
        this.addMessage(aiMessage);
      } catch (error: any) {
        // Handle OpenAI API errors
        const errorMessage: ChatMessage = {
          id: this.generateId(),
          content: error.message || 'Xin lỗi, tôi gặp vấn đề khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.',
          sender: 'assistant',
          timestamp: new Date()
        };
        this.addMessage(errorMessage);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      const errorMessage: ChatMessage = {
        id: this.generateId(),
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        sender: 'assistant',
        timestamp: new Date()
      };
      this.addMessage(errorMessage);
    }
  }

  private getChatContext(): string {
    const messages = this.messagesSubject.value;
    const recentMessages = messages.slice(-5);
    return recentMessages.map(msg => `${msg.sender}: ${msg.content}`).join('\n');
  }

  private generateBasicResponse(userMessage: string): string | null {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Check for time questions
    if (this.isTimeQuestion(lowerMessage)) {
      return this.getTimeResponse();
    }

    // Check for date questions
    if (this.isDateQuestion(lowerMessage)) {
      return this.getDateResponse();
    }

    // Check for math questions
    if (this.isMathQuestion(lowerMessage)) {
      return this.solveMathProblem(lowerMessage);
    }

    // Check knowledge base responses
    for (const [category, data] of Object.entries(this.knowledgeBase)) {
      if (data.patterns.some(pattern => lowerMessage.includes(pattern))) {
        return data.responses[Math.floor(Math.random() * data.responses.length)];
      }
    }

    return null;
  }

  private addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    const newMessages = [...currentMessages, message];
    this.messagesSubject.next(newMessages);

    // Save to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(newMessages));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private isTimeQuestion(message: string): boolean {
    const timeKeywords = ['mấy giờ', 'giờ mấy', 'thời gian', 'time', 'hour', 'what time'];
    return timeKeywords.some(keyword => message.includes(keyword));
  }

  private isDateQuestion(message: string): boolean {
    const dateKeywords = ['ngày mấy', 'thứ mấy', 'hôm nay', 'today', 'date', 'day'];
    return dateKeywords.some(keyword => message.includes(keyword));
  }

  private isMathQuestion(message: string): boolean {
    const mathKeywords = [
      'tính', 'cộng', 'trừ', 'nhân', 'chia', 'tổng', 'hiệu', 'tích', 'thương',
      'calculate', 'add', 'subtract', 'multiply', 'divide', 'sum', 'difference', 'product', 'quotient',
      '+', '-', '*', '/', '×', '÷'
    ];
    return mathKeywords.some(keyword => message.includes(keyword));
  }

  private getTimeResponse(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `Bây giờ là ${hours}:${minutes}`;
  }

  private getDateResponse(): string {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return `Hôm nay là ${dayName}, ngày ${date} tháng ${month} năm ${year}`;
  }

  private solveMathProblem(message: string): string {
    try {

      const numbers = message.match(/\d+/g)?.map(Number) || [];
      if (message.includes('+') || message.includes('cộng') || message.includes('add')) {
        const sum = numbers.reduce((a, b) => a + b, 0);
        return `Kết quả là: ${sum}`;
      }

      if (message.includes('-') || message.includes('trừ') || message.includes('subtract')) {
        if (numbers.length >= 2) {
          const result = numbers[0] - numbers[1];
          return `Kết quả là: ${result}`;
        }
      }

      if (message.includes('*') || message.includes('×') || message.includes('nhân') || message.includes('multiply')) {
        const product = numbers.reduce((a, b) => a * b, 1);
        return `Kết quả là: ${product}`;
      }

      if (message.includes('/') || message.includes('÷') || message.includes('chia') || message.includes('divide')) {
        if (numbers.length >= 2 && numbers[1] !== 0) {
          const result = numbers[0] / numbers[1];
          return `Kết quả là: ${result}`;
        }
        return 'Không thể chia cho 0';
      }


      const mathExpression = message.match(/[\d+\-*\/\s]+/g)?.[0];
      if (mathExpression) {
        try {
          const cleanExpression = mathExpression.replace(/×/g, '*').replace(/÷/g, '/');
          const result = eval(cleanExpression);
          return `Kết quả là: ${result}`;
        } catch (e) {
          return 'Tôi không hiểu biểu thức toán học này.';
        }
      }

      return 'Tôi không hiểu phép tính này. Bạn có thể nói rõ hơn không?';
    } catch (error) {
      return 'Xin lỗi, tôi không thể giải bài toán này.';
    }
  }

  clearChat(): void {
    this.messagesSubject.next([]);
    localStorage.removeItem('chatHistory');
  }
}
