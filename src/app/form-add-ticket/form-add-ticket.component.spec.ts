import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAddTicketComponent } from './form-add-ticket.component';

describe('FormAddTicketComponent', () => {
  let component: FormAddTicketComponent;
  let fixture: ComponentFixture<FormAddTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAddTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAddTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
