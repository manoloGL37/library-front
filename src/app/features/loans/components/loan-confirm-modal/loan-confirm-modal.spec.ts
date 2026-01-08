import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanConfirmModal } from './loan-confirm-modal';

describe('LoanConfirmModal', () => {
  let component: LoanConfirmModal;
  let fixture: ComponentFixture<LoanConfirmModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanConfirmModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanConfirmModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
