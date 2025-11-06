import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-logout-modal',
  templateUrl: './logout-modal.component.html',
  styleUrls: ['./logout-modal.component.scss'],
  standalone: false,
})
export class LogoutModalComponent implements OnInit {
  schoolId: string = '';
  enteredSchoolId: string = '';
  errorMessage: string = '';

  constructor(
    private modalController: ModalController,
    public translate: TranslateService,
    private storage: StorageService
  ) {}

  ngOnInit() {
    // Get school ID from localStorage
    this.schoolId = this.storage.get('schoolId') || '';
  }

  /**
   * Close the modal without logging out
   */
  dismiss() {
    this.modalController.dismiss({ action: 'cancel' });
  }

  /**
   * Validate and confirm logout
   */
  confirmLogout() {
    // Check if entered school ID matches
    if (this.enteredSchoolId.trim() === this.schoolId.trim()) {
      this.modalController.dismiss({ action: 'logout' });
    } else {
      this.errorMessage = 'School ID does not match. Please try again.';
    }
  }

  /**
   * Clear error when user types
   */
  onInputChange() {
    this.errorMessage = '';
  }
}
