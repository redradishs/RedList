import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiUrl = 'http://localhost/todolistapi/api'

  constructor(private http: HttpClient) { }

  getTasks(){
    return this.http.get(`${this.apiUrl}/taskerr`);
  }

  username(userId: number){
    return this.http.get(`${this.apiUrl}/username/${userId}`);
  }
  
  getOneTask(taskid: number){
    return this.http.get(`${this.apiUrl}/onetask/${taskid}`);
  }

  addTask(userId: number, newTask: any): Observable<any> {
    const url = `${this.apiUrl}/addtask/${userId}`;
    return this.http.post(url, newTask);
  }

  editTask(id: number, updatedTask: any){
    return this.http.post(`${this.apiUrl}/edit_task/${id}`, updatedTask);
  }

  deleteTask(id: number){
    return this.http.post(`${this.apiUrl}/delete_task/${id}`, {});
  }

  getStatus(status: string){
    return this.http.get(`${this.apiUrl}/getstatus/${status}`);
  }

  updateStatus(id: number, status: string){
    return this.http.post(`${this.apiUrl}/update_status/${id}`, {status});
  }

  updateTaskOrder(tasks: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/update_task_order`, tasks);
  }

}
