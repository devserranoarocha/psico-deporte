import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginRecoveryComponent } from './login-recovery.component';

describe('LoginRecoveryComponent', () => {
  let component: LoginRecoveryComponent;
  let fixture: ComponentFixture<LoginRecoveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginRecoveryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginRecoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
