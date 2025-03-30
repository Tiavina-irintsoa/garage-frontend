import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoLayoutComponent } from './bo-layout.component';

describe('BoLayoutComponent', () => {
  let component: BoLayoutComponent;
  let fixture: ComponentFixture<BoLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
