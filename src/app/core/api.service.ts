import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  apiBaseUrl = `https://script.google.com/macros/s/AKfycbxHW8XiEjZJFutKwPYTbjAPPL4HhddNFYgOPeqEJ-XWlDZYOPZjAyaZrlHeRbNtsF8D/exec`;

  constructor(
    private http: HttpClient,
  ) { }

  createAdmin(payload: any): Observable<any> {
    return this.http.post(this.apiBaseUrl + '?action=register', payload, { responseType: 'text' }).pipe(map(res => JSON.parse(res)));
  }

  loginAdmin(payload: { mobile: string, password: string }): Observable<any> {
    return this.http.get(this.apiBaseUrl + '?action=login', { params: { mobile: payload.mobile, password: payload.password } });
  }

  getQuizList(): Observable<any> {
    return this.http.get(this.apiBaseUrl + '?action=getQuizList');
  }

  getBibleBooks(): Observable<any> {
    return this.http.get(this.apiBaseUrl + '?action=getBibleBooks');
  }

  playGame(payload: { gameId: number, book: string, count: number, timer: number }): Observable<any> {
    return this.http.post(this.apiBaseUrl + '?action=playGame', payload, { responseType: 'text' }).pipe(map(res => JSON.parse(res)));
  }

  getAnswer(payload: { gameId: number, questionId: number }): Observable<any> {
    return this.http.post(this.apiBaseUrl + '?action=getAnswer', payload, { responseType: 'text' }).pipe(map(res => JSON.parse(res)));
  }
}