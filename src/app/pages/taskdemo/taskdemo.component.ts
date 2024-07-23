import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, RequiredValidator, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-taskdemo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './taskdemo.component.html',
  styleUrl: './taskdemo.component.css'
})
export class TaskdemoComponent  {

  userId = 2;

  title = '';
  description = '';
  status = '';
  due_date ='';

  constructor(private api: ApiService){

  }

  onSubmit(){
    const form = {
      title: this.title,
      description: this.description,
      status: this.status,
      due_date: this.due_date
    }

    this.api.addTask(this.userId, form).subscribe((resp:any)=>{
      console.log(resp)
    }, (error) => {
      console.log(error)
    }
  );
  }




}
