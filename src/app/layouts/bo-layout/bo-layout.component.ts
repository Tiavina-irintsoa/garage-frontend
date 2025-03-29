import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserNavbarComponent } from '../../components/shared/user-navbar/user-navbar.component';
@Component({
  selector: 'app-bo-layout',
  imports: [RouterOutlet, UserNavbarComponent],
  templateUrl: './bo-layout.component.html',
  styleUrl: './bo-layout.component.css'
})
export class BoLayoutComponent {
  currentYear = new Date().getFullYear();
}
