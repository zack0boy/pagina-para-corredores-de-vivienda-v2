import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastContainerComponent } from './toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoginOrPortal: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      this.isLoginOrPortal = currentUrl === '/login' || currentUrl === '/' || currentUrl === '/portal';
    });
  }
}
