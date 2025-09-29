import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WhatsNewModalComponent } from './whats-new-modal.component';

describe('WhatsNewModalComponent', () => {
  let component: WhatsNewModalComponent;
  let fixture: ComponentFixture<WhatsNewModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', [
      'dismiss',
    ]);

    await TestBed.configureTestingModule({
      declarations: [WhatsNewModalComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        TranslateService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsNewModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(
      ModalController
    ) as jasmine.SpyObj<ModalController>;

    // Set up test data
    component.releaseData = {
      version: '2.0.3',
      title: 'Test Update',
      date: 'Monday, 25 Aug 2025',
      items: ['Test feature 1', 'Test feature 2'],
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dismiss modal when dismiss is called', () => {
    component.dismiss();
    expect(modalController.dismiss).toHaveBeenCalled();
  });

  it('should dismiss modal when goToDashboard is called', () => {
    component.goToDashboard();
    expect(modalController.dismiss).toHaveBeenCalled();
  });
});
