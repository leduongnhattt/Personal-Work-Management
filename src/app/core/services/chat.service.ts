import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ChatMessage } from '../models/chat.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private weatherApiKey = '5d9f6620cdf8aac9e4b2e9e532397103';
  private weatherApiUrl = 'https://api.openweathermap.org/data/2.5';

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
    },
    weather: {
      patterns: ['thời tiết ngày hôm này', 'thời tiết tại', 'dự báo thời tiết', 'thời tiết tuần tới', 'weather forecast', 'thời tiết ở', 'nhiệt độ tại', 'test api', 'kiểm tra api'],
      responses: async (message: string) => {
        if (message.includes('test') || message.includes('kiểm tra')) {
          return await this.checkWeatherAPIStatus();
        }
        let city = 'Da Nang';
        if (message.toLowerCase().includes('hà nội')) city = 'Hanoi';
        else if (message.toLowerCase().includes('hồ chí minh') || message.toLowerCase().includes('sài gòn')) city = 'Ho Chi Minh City';
        if (message.toLowerCase().includes('tuần') || message.toLowerCase().includes('dự báo')) {
          return await this.getWeatherForecast(city);
        }
        return await this.getWeatherInfo(city);
      }
    },
    health: {
      patterns: ['bạn có khỏe không', 'bạn khỏe không', 'how are you', 'are you ok'],
      responses: ['Cảm ơn bạn đã quan tâm! Tôi là một trợ lý ảo nên luôn sẵn sàng giúp đỡ bạn.', 'Tôi luôn sẵn sàng và khỏe mạnh để hỗ trợ bạn!']
    },
    age: {
      patterns: ['bạn bao nhiêu tuổi', 'tuổi của bạn', 'how old are you'],
      responses: ['Tôi là một trợ lý ảo, tuổi tác không quan trọng bằng việc tôi có thể giúp gì cho bạn.', 'Tuổi của tôi không quan trọng, quan trọng là tôi có thể hỗ trợ bạn tốt nhất có thể!']
    },
    sovereignty: {
      patterns: ['hoàng sa', 'trường sa', 'chủ quyền', 'biển đông', 'sovereignty', 'hoàng sa và trường sa là của ai'],
      responses: ['Hoàng Sa và Trường Sa là một phần lãnh thổ không thể tách rời của Việt Nam. Việt Nam có đầy đủ chứng cứ lịch sử và pháp lý khẳng định chủ quyền đối với hai quần đảo này.', 'Chủ quyền của Việt Nam đối với Hoàng Sa và Trường Sa là không thể tranh cãi, được xác lập từ lâu đời và được thực thi liên tục, hòa bình.']
    }
  };

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      const msgs = JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      this.messagesSubject.next(msgs);
    }
    this.testWeatherAPI();
  }

  private isGibberish(message: string): boolean {
    const text = message.replace(/\s+/g, '');
    const noVowel = text.length > 3 && !/[aeiouyăâêôơưàáạảãầấậẩẫằắặẳẵèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỷỹđ]/i.test(text);
    const singleWord = /^[A-Za-z]+$/.test(text) && text.length > 6;
    return noVowel || singleWord;
  }

  async sendMessage(content: string): Promise<void> {
    const userMsg: ChatMessage = { id: this.generateId(), content, sender: 'user', timestamp: new Date(), status: 'sending' };
    this.addMessage(userMsg);

    if (this.isGibberish(content)) {
      this.addMessage({ id: this.generateId(), content: 'Bạn cần tôi giúp gì không?', sender: 'assistant', timestamp: new Date() });
      return;
    }

    try {
      const basic = await this.generateBasicResponse(content);
      if (basic) {
        this.addMessage({ id: this.generateId(), content: basic, sender: 'assistant', timestamp: new Date() });
      } else {
        this.addMessage({ id: this.generateId(), content: 'Bạn cần tôi giúp gì không?', sender: 'assistant', timestamp: new Date() });
      }
    } catch (err) {
      console.error('sendMessage error:', err);
      this.addMessage({ id: this.generateId(), content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.', sender: 'assistant', timestamp: new Date() });
    }
  }

  private async generateBasicResponse(userMessage: string): Promise<string | null> {
    const lower = userMessage.toLowerCase().trim();
    if (this.isTimeQuestion(lower)) return this.getTimeResponse();
    if (this.isDateQuestion(lower)) return this.getDateResponse();
    if (this.isMathQuestion(lower)) return this.solveMathProblem(lower);
    for (const data of Object.values(this.knowledgeBase)) {
      if (data.patterns.some(p => lower.includes(p))) {
        return typeof data.responses === 'function' ? await data.responses(userMessage) : data.responses[Math.floor(Math.random() * data.responses.length)];
      }
    }
    return null;
  }

  private addMessage(message: ChatMessage): void {
    const updated = [...this.messagesSubject.value, message];
    this.messagesSubject.next(updated);
    localStorage.setItem('chatHistory', JSON.stringify(updated));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private isTimeQuestion(message: string): boolean {
    return ['mấy giờ', 'giờ mấy', 'thời gian', 'time', 'hour', 'what time'].some(k => message.includes(k));
  }

  private isDateQuestion(message: string): boolean {
    const lower = message.toLowerCase();
    if (lower.includes('thời tiết') || lower.includes('dự báo') || lower.includes('nhiệt độ')) return false;
    return ['ngày mấy', 'thứ mấy', 'ngày tháng', 'date', 'day'].some(k => lower.includes(k)) || (lower.includes('hôm nay') && !lower.includes('thời tiết'));
  }

  private isMathQuestion(message: string): boolean {
    return ['tính', 'cộng', 'trừ', 'nhân', 'chia', 'tổng', 'hiệu', 'tích', 'thương', '+', '-', '*', '/', '×', '÷'].some(k => message.includes(k));
  }

  private getTimeResponse(): string {
    const now = new Date();
    return `Bây giờ là ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  private getDateResponse(): string {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `Hôm nay là ${days[now.getDay()]}, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;
  }

  private solveMathProblem(message: string): string {
    try {
      const nums = message.match(/\d+/g)?.map(Number) || [];
      if (message.includes('+') || message.includes('cộng')) return `Kết quả là: ${nums.reduce((a, b) => a + b, 0)}`;
      if (message.includes('-') || message.includes('trừ')) return nums.length >= 2 ? `Kết quả là: ${nums[0] - nums[1]}` : 'Tôi không hiểu phép tính này.';
      if (message.includes('*') || message.includes('nhân')) return `Kết quả là: ${nums.reduce((a, b) => a * b, 1)}`;
      if ((message.includes('/') || message.includes('chia')) && nums[1] !== 0) return `Kết quả là: ${nums[0] / nums[1]}`;
      const expr = message.match(/[\d+\-*/\s]+/g)?.[0];
      if (expr) return `Kết quả là: ${eval(expr.replace(/×/g, '*').replace(/÷/g, '/'))}`;
      return 'Tôi không hiểu phép tính này.';
    } catch { return 'Xin lỗi, tôi không thể giải bài toán này.'; }
  }

  private async getWeatherInfo(city = 'Da Nang'): Promise<string> {
    try {
      const res = await fetch(`${this.weatherApiUrl}/weather?q=${city}&appid=${this.weatherApiKey}&units=metric&lang=vi`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      const temp = Math.round(d.main.temp);
      const feels = Math.round(d.main.feels_like);
      const humidity = d.main.humidity;
      const desc = d.weather[0].description;
      const wind = Math.round(d.wind.speed * 3.6);
      const name = city === 'Da Nang' ? 'Đà Nẵng' : city === 'Ho Chi Minh City' ? 'TP. Hồ Chí Minh' : 'Hà Nội';
      return `🌤️ Thời tiết tại ${name}:\n🌡️ Nhiệt độ: ${temp}°C (Cảm giác như ${feels}°C)\n💧 Độ ẩm: ${humidity}%\n☁️ Mây: ${d.clouds.all}%\n💨 Gió: ${wind} km/h\n📝 ${desc}`;
    } catch (e) { console.error(e); return '❌ Không thể lấy thông tin thời tiết.'; }
  }

  private async getWeatherForecast(city = 'Da Nang'): Promise<string> {
    try {
      const res = await fetch(`${this.weatherApiUrl}/forecast?q=${city}&appid=${this.weatherApiKey}&units=metric&lang=vi`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      const name = city === 'Da Nang' ? 'Đà Nẵng' : city === 'Ho Chi Minh City' ? 'TP. Hồ Chí Minh' : 'Hà Nội';
      const daily = new Map<string, any>();
      for (const it of d.list) {
        const dt = new Date(it.dt * 1000);
        const key = dt.toISOString().split('T')[0];
        if (!daily.has(key)) daily.set(key, { day: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][dt.getDay()], date: `${dt.getDate()}/${dt.getMonth() + 1}`, min: it.main.temp_min, max: it.main.temp_max, desc: it.weather[0].description, hum: it.main.humidity, wind: Math.round(it.wind.speed * 3.6) });
        else {
          const cur = daily.get(key);
          cur.min = Math.min(cur.min, it.main.temp_min);
          cur.max = Math.max(cur.max, it.main.temp_max);
        }
      }
      let out = `🗓️ Dự báo 5 ngày tại ${name}:\n\n`;
      let i = 0;
      for (const v of daily.values()) {
        if (i++ === 5) break;
        out += `📅 ${v.day} (${v.date}):\n🌡️ ${Math.round(v.min)}°C - ${Math.round(v.max)}°C\n💧 ${v.hum}%\n💨 ${v.wind} km/h\n📝 ${v.desc}\n\n`;
      }
      return out;
    } catch (e) { console.error(e); return '❌ Không thể lấy dự báo thời tiết.'; }
  }

  clearChat(): void {
    this.messagesSubject.next([]);
    localStorage.removeItem('chatHistory');
  }

  async testWeatherAPI() {
    try {
      console.log('Testing weather API...');
      const cur = await firstValueFrom(this.http.get<any>(`${this.weatherApiUrl}/weather`, { params: { q: 'Hanoi', appid: this.weatherApiKey, units: 'metric', lang: 'vi' } }));
      const fc = await firstValueFrom(this.http.get<any>(`${this.weatherApiUrl}/forecast`, { params: { q: 'Hanoi', appid: this.weatherApiKey, units: 'metric', lang: 'vi' } }));
      console.log('Weather:', cur, 'Forecast sample:', fc.list[0]);
    } catch (e) { console.error('API test error:', e); }
  }

  async checkWeatherAPIStatus(): Promise<string> {
    try {
      await firstValueFrom(this.http.get<any>(`${this.weatherApiUrl}/weather`, { params: { q: 'Hanoi', appid: this.weatherApiKey, units: 'metric', lang: 'vi' } }));
      return '✅ API thời tiết hoạt động bình thường';
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        switch (err.status) {
          case 401: return '❌ API Key không hợp lệ';
          case 404: return '❌ Không tìm thấy dữ liệu';
          case 429: return '❌ Quá giới hạn gọi API';
          default: return `❌ Lỗi API: ${err.status}`;
        }
      }
      return '❌ Không thể kết nối API thời tiết';
    }
  }
}
