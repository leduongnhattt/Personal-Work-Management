import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  private readonly apiKey = environment.openaiApiKey;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) { }

  async getChatResponse(message: string, context: string): Promise<string> {
    try {
      const response = await this.http.post<any>(this.apiUrl, {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Bạn là một trợ lý ảo thông minh và hữu ích. Hãy trả lời bằng tiếng Việt."
          },
          ...this.formatContext(context),
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return throwError(() => new Error('API key không hợp lệ. Vui lòng kiểm tra lại API key.'));
          }
          return throwError(() => new Error('Có lỗi xảy ra khi kết nối với OpenAI. Vui lòng thử lại sau.'));
        })
      ).toPromise();

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  private formatContext(context: string): any[] {
    if (!context) return [];

    return context.split('\n').map(line => {
      const [sender, content] = line.split(': ');
      return {
        role: sender === 'user' ? 'user' : 'assistant',
        content: content
      };
    });
  }
}
