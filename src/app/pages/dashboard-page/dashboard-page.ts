import { Component, inject } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dashboard-page',
  imports: [ButtonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private authService = inject(AuthService);

  logout() {
    this.authService.signOut();
  }
}
