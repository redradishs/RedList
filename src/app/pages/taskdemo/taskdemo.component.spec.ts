import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskdemoComponent } from './taskdemo.component';

describe('TaskdemoComponent', () => {
  let component: TaskdemoComponent;
  let fixture: ComponentFixture<TaskdemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskdemoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskdemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
