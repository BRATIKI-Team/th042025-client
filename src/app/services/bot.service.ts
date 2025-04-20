import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IBotLight, IBotDetail, IBotDetailApi, BotStatus, BotSourceType, IMetricData } from '../interfaces/bot.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BotService {
  private apiUrl = `${environment.apiUrl}/bots`;

  constructor(private http: HttpClient) { }

  /**
   * Получить список всех ботов
   */
  getAllBots(): Observable<IBotLight[]> {
    return this.http.get<IBotLight[]>(`${this.apiUrl}/`)
      .pipe(
        catchError(this.handleError<IBotLight[]>('getAllBots', []))
      );
  }

  /**
   * Получить детальную информацию о боте по ID
   */
  getBotById(id: number): Observable<IBotDetail> {
    return this.http.get<IBotDetailApi>(`${this.apiUrl}/${id}/`)
      .pipe(
        map(response => this.transformBotResponse(response)),
        catchError(this.handleError<IBotDetail>(`getBotById id=${id}`))
      );
  }

  /**
   * Создать нового бота
   */
  createBot(bot: Omit<IBotDetail, 'id'>): Observable<IBotDetail> {
    return this.http.post<IBotDetailApi>(`${this.apiUrl}/`, this.prepareForApi(bot))
      .pipe(
        map(response => this.transformBotResponse(response)),
        catchError(this.handleError<IBotDetail>('createBot'))
      );
  }

  /**
   * Обновить информацию о боте
   */
  updateBot(bot: IBotDetail): Observable<IBotDetail> {
    return this.http.put<IBotDetailApi>(`${this.apiUrl}/${bot.id}/`, this.prepareForApi(bot))
      .pipe(
        map(response => this.transformBotResponse(response)),
        catchError(this.handleError<IBotDetail>('updateBot'))
      );
  }

  /**
   * Удалить бота
   */
  deleteBot(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`)
      .pipe(
        map(() => true),
        catchError(this.handleError<boolean>('deleteBot', false))
      );
  }

  /**
   * Подготовка данных для отправки на API
   * Преобразует Map<Date, number> в массив объектов {date, value}
   */
  private prepareForApi(bot: Partial<IBotDetail>): Partial<IBotDetailApi> {
    if (!bot.metrics) return bot as Partial<IBotDetailApi>;

    // Создаем новый объект
    const { metrics, ...rest } = bot;
    
    // Преобразуем Map<Date, number> в массив объектов {date, value}
    let metricsArray: { date: string, value: number }[] = [];
    
    if (metrics instanceof Map) {
      metricsArray = Array.from(metrics.entries()).map(([date, value]) => ({
        date: date.toISOString(),
        value
      }));
    }
    
    // Возвращаем новый объект с преобразованными метриками
    return {
      ...rest,
      metrics: metricsArray
    };
  }
  
  /**
   * Преобразует ответ API в формат IBotDetail с Map для metrics
   */
  private transformBotResponse(response: IBotDetailApi): IBotDetail {
    // Проверяем, что response содержит необходимые поля
    if (!response) return response as any;
    
    // Создаем копию ответа
    const result = { ...response } as any;
    
    // Преобразуем данные метрик из формата API (массив с объектами {date, value})
    // в Map<Date, number>, который используется в интерфейсе IBotDetail
    if (response.metrics && Array.isArray(response.metrics)) {
      const metricsMap = new Map<Date, number>();
      
      response.metrics.forEach(metric => {
        metricsMap.set(new Date(metric.date), metric.value);
      });
      
      result.metrics = metricsMap;
    }
    
    return result as IBotDetail;
  }

  /**
   * Обработчик ошибок HTTP запросов
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      
      // Отправляем ошибку в консоль
      console.error(error);
      
      // В production можно отправлять ошибки в систему логирования
      
      // Возвращаем пустой результат/ошибку, чтобы приложение продолжало работать
      if (result !== undefined) {
        return throwError(() => new Error(`Ошибка в ${operation}: ${error.message}`));
      }
      
      return throwError(() => error);
    };
  }
} 