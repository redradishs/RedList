import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
    name: string = '';
    email: string = '';
    password: string = '';
    errorMessage: string = ''; 


    constructor(private authService: AuthService, private router: Router){

    }


    onSignup() {
      if (!this.name || !this.email || !this.password) {
        alert('Please fill in all fields');
        return;
      }


      const data = {
        name: this.name,
        email: this.email,
        password: this.password,
      };

      this.authService.userSignUp(data).subscribe(
        (response: any) => {
          console.log(response.message);
          this.authService.setToken(response.jwt);
          this.router.navigate(['/login']);
        },
        (error: any) => {
          if (error.status === 409) {
            alert('Email already exists.');
          } else if (error.status === 400) {
            alert('Please provide all required fields.');
          } else {
            alert('An unexpected error occurred. Please try again later.');
          }
        }
      );
    }

}
