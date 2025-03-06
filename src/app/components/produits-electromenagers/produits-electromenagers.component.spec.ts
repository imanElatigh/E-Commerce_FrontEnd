import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitsElectromenagersComponent } from './produits-electromenagers.component';

describe('ProduitsElectromenagersComponent', () => {
  let component: ProduitsElectromenagersComponent;
  let fixture: ComponentFixture<ProduitsElectromenagersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitsElectromenagersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitsElectromenagersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
