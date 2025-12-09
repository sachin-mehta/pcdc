import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { LogoutModalComponent } from './logout-modal.component';
import { StorageService } from '../../services/storage.service';
import { FormsModule } from '@angular/forms';

describe('LogoutModalComponent', () => {
  let component: LogoutModalComponent;
  let fixture: ComponentFixture<LogoutModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LogoutModalComponent],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot(), FormsModule],
      providers: [
        {
          provide: ModalController,
          useValue: {
            dismiss: jasmine.createSpy('dismiss'),
          },
        },
        {
          provide: StorageService,
          useValue: {
            get: jasmine.createSpy('get').and.returnValue('12345'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoutModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
