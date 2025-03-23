import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from '../../components/shared/navbar/navbar.component';

@Component({
  selector: 'app-home-layout',
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './home-layout.component.html',
  styleUrl: './home-layout.component.css'
})
export class HomeLayoutComponent {
  showNavbar: boolean = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        console.log(event.url);
        // Ne pas afficher la navbar sur les routes commençant par /dashboard
        this.showNavbar = !event.url.startsWith('/BO');
        console.log(this.showNavbar);
      });
  }
}
