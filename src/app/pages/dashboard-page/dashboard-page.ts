import { Component, inject } from '@angular/core';
import { AuthService } from '@services/auth/auth.service';
import { ButtonModule } from 'primeng/button';
import { AdminService } from '@services/admin/admin.service';
@Component({
  selector: 'app-dashboard-page',
  imports: [ButtonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private authService = inject(AuthService);
  private adminService = inject(AdminService);

  logout() {
    this.authService.signOut();
  }

  startQuiz() {
    const roomId = '123-123-123'; // This would be dynamic in a real app
    this.adminService.startQuizSession(roomId);
  }

  restartQuiz() {
    const roomId = '123-123-123'; // This would be dynamic in a real app
    this.adminService.restartQuizSession(roomId);
  }

  endQuiz() {
    const roomId = '123-123-123'; // This would be dynamic in a real app
    this.adminService.endQuizSession(roomId);
  }
}
