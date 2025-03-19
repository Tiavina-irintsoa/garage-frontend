import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleButtonComponent } from './google-button/google-button.component';

@NgModule({
  declarations: [
    GoogleButtonComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GoogleButtonComponent
  ]
})
export class SharedModule { } 