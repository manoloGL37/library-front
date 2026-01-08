import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanListCard } from './loan-list-card';

describe('LoanListCard', () => {
  let component: LoanListCard;
  let fixture: ComponentFixture<LoanListCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanListCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanListCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
