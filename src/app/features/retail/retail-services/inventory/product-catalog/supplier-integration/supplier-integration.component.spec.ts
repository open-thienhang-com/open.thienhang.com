import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierIntegrationComponent } from './supplier-integration.component';

describe('SupplierIntegrationComponent', () => {
  let component: SupplierIntegrationComponent;
  let fixture: ComponentFixture<SupplierIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierIntegrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
