import { Component, output } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { LucideZap } from '@lucide/angular';

@Component({
  selector: 'app-top-menu',
  imports: [MenubarModule, LucideZap],
  templateUrl: './top-menu.html',
  styleUrl: './top-menu.css',
})
export class TopMenu {
  items: MenuItem[] | undefined;
  logout = output<void>();

  ngOnInit() {
    this.items = [
      {
        label: 'Logout',
        styleClass: 'ml-auto',
        linkClass: 'text-red-500 dark:!text-red-400 ',
        command: () => {
          this.logout.emit();
        },
      },
    ];
  }
}
