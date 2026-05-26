import { Component, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { RouterOutlet } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { TopMenu } from './components/top-menu/top-menu';
@Component({
  selector: 'app-dashboard-page',
  imports: [ButtonModule, RouterOutlet, TopMenu],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private authService = inject(AuthService);

  logout() {
    this.authService.signOut();
  }
}
