import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningProductivity } from './planning-productivity';

describe('PlanningProductivity', () => {
  let component: PlanningProductivity;
  let fixture: ComponentFixture<PlanningProductivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanningProductivity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanningProductivity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
