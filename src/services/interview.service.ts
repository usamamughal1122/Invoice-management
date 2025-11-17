import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiResponse, Language, LanguageTopic, QuestionCount, QuestionItem } from '../interface-interview';


@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private base = 'https://freeapi.miniprojectideas.com/api/Interview';

  constructor(private http: HttpClient) {}

  getAllLanguages(): Observable<ApiResponse<Language[]>> {
    return this.http.get<ApiResponse<Language[]>>(`${this.base}/GetAllLanguage`)
      
  }

  getLanguageTopics(): Observable<ApiResponse<LanguageTopic[]>> {
    return this.http.get<ApiResponse<LanguageTopic[]>>(`${this.base}/GetLanguageTopic`)
     
  }

  getQuestionsByTopicId(topicId: number): Observable<ApiResponse<QuestionItem[]>> {
  const params = new HttpParams().set('id', topicId.toString()); 
  return this.http.get<ApiResponse<QuestionItem[]>>(`${this.base}/GetQuestionByTopicId`, { params });
 }

 getAllQuestions(): Observable<ApiResponse<QuestionItem[]>> {
    return this.http.get<ApiResponse<QuestionItem[]>>(`${this.base}/GetAllQuestions`)
      
 }
  getQuestionCountByLanguage(): Observable<ApiResponse<QuestionCount[]>> {
    return this.http.get<ApiResponse<QuestionCount[]>>(`${this.base}/GetQuestionCountByLanguage`)
      
  }
  

}
