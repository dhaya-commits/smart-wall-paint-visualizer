import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss'] // Reusing login styles for consistency
})
export class RegisterComponent {
  user = { name: '', email: '', password: '' };
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.authService.register(this.user).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => this.error = err.error.error || 'Registration failed'
    });
  }
}
