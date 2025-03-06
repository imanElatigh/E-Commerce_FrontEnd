import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduitsElectroniquesComponent } from './produits-electroniques.component';

describe('ProduitsElectroniquesComponent', () => {
  let component: ProduitsElectroniquesComponent;
  let fixture: ComponentFixture<ProduitsElectroniquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduitsElectroniquesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduitsElectroniquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
