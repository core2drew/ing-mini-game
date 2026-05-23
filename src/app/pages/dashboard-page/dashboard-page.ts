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
  private roomId = '123-123-123'; // This would be dynamic in a real app
  logout() {
    this.authService.signOut();
  }

  startQuiz() {
    this.adminService.startQuizSession(this.roomId);
  }

  restartQuiz() {
    this.adminService.restartQuizSession(this.roomId);
  }

  endQuiz() {
    this.adminService.endQuizSession(this.roomId);
  }

  nextQuestion() {
    this.adminService.nextQuestion(this.roomId);
  }
}
