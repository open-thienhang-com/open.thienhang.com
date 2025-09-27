import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailServicesComponent } from './retail-services.component';

describe('RetailServicesComponent', () => {
  let component: RetailServicesComponent;
  let fixture: ComponentFixture<RetailServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetailServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
