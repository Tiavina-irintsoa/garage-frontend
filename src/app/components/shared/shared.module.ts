import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleButtonComponent } from './google-button/google-button.component';
import { UserNavbarComponent } from './user-navbar/user-navbar.component';

@NgModule({
  declarations: [
    GoogleButtonComponent,
    UserNavbarComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GoogleButtonComponent,
    UserNavbarComponent
  ]
})
export class SharedModule { } 