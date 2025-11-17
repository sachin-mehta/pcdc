import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'app-register-new-school',
  templateUrl: './register-new-school.component.html',
  styleUrls: ['./register-new-school.component.scss'],
  standalone: false
})
export class RegisterNewSchoolComponent implements OnInit {
  @ViewChild('schoolAddressInput', { read: IonInput }) schoolAddressInput!: IonInput;
  isEditingLat = false;
  isEditingLng = false;
  private originalLat = '';
  private originalLng = '';
  isConfirmModalOpen = false;
  confirmType: 'latitude' | 'longitude' | '' = '';
  schoolForm!: FormGroup;
  suggestions: any[] = [];
  latLngVisible = false;
  searchTimeout: any;
  showOtherInput = false;


  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.schoolForm = this.fb.group({
      schoolId: ['', [Validators.required, Validators.maxLength(15)]],
      schoolName: ['', [Validators.required, Validators.maxLength(15)]],
      schoolAddress: ['', Validators.required],
      latitude: [''],
      longitude: [''],
      educationLevel: ['', Validators.required],
      otherEducationLevel: [{ value: '', disabled: true }],
      officialEmail: ['', [Validators.email]]
    });
    this.schoolForm.get('officialEmail')?.valueChanges.subscribe((value: string) => {
      const emailControl = this.schoolForm.get('officialEmail');
      if (value && value.length >= 1) {
        emailControl?.setValidators([this.emailDomainValidator]);
      } else {
        emailControl?.clearValidators();
      }
      emailControl?.updateValueAndValidity({ emitEvent: false });
    });
  }

  // Called on typing in the address input
  async onSearchChange(event: any) {
    const query = (await this.schoolAddressInput.getInputElement()).value.trim();
    if (!query) {
      this.suggestions = [];
      return;
    }

    // Debounce (simulate network delay)
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      // Mock API response (replace with your actual API call)
      this.suggestions = [
        { place: 'Meerut, Uttar Pradesh', lat: 28.98, lng: 77.7 },
        { place: 'New Delhi, India', lat: 28.61, lng: 77.23 },
        { place: 'Gurgaon, Haryana', lat: 28.46, lng: 77.03 },
        { place: 'Noida, Uttar Pradesh', lat: 28.54, lng: 77.39 }
      ].filter(item => item.place.toLowerCase().includes(query.toLowerCase()));
    }, 300);
  }

  selectSuggestion(suggestion: any) {
    this.schoolForm.patchValue({
      schoolAddress: suggestion.place,
      latitude: suggestion.lat,
      longitude: suggestion.lng
    });

    this.suggestions = [];
    this.latLngVisible = true;
  }

  clearLatLng() {
    this.schoolForm.patchValue({ latitude: '', longitude: '' });
    this.latLngVisible = false;
  }

  onRegister() {
    if (this.schoolForm.invalid) {
      this.schoolForm.markAllAsTouched();
      return;
    }

    const formData = { ...this.schoolForm.value };

    if (formData.educationLevel === 'others') {
      formData.educationLevel = formData.otherEducationLevel;
    }

    console.log("Final Data:", formData);
  }


  backToSaved(school: any) {
    console.log('Go back clicked', school);
  }

  enableEdit(type: 'lat' | 'lng') {
    if (type === 'lat') {
      this.isEditingLat = true;
      this.originalLat = this.schoolForm.get('latitude')?.value;
    } else {
      this.isEditingLng = true;
      this.originalLng = this.schoolForm.get('longitude')?.value;
    }
  }

  cancelEdit(type: 'lat' | 'lng') {
    if (type === 'lat') {
      this.schoolForm.patchValue({ latitude: this.originalLat });
      this.isEditingLat = false;
    } else {
      this.schoolForm.patchValue({ longitude: this.originalLng });
      this.isEditingLng = false;
    }
  }

  // saveEdit(type: 'lat' | 'lng') {
  //   if (type === 'lat') {
  //     this.isEditingLat = false;
  //   } else {
  //     this.isEditingLng = false;
  //   }
  //   console.log('✅ Saved values:', this.schoolForm.value);
  // }
  async saveEdit(type: 'lat' | 'lng') {
    this.confirmType = type === 'lat' ? 'latitude' : 'longitude';
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal(confirm: boolean) {
    if (confirm) {
      if (this.confirmType === 'latitude') {
        this.isEditingLat = false;
      } else {
        this.isEditingLng = false;
      }
      console.log('✅ Saved values:', this.schoolForm.value);
    } else {
      // Revert if cancelled
      if (this.confirmType === 'latitude') {
        this.schoolForm.patchValue({ latitude: this.originalLat });
        this.isEditingLat = false;
      } else {
        this.schoolForm.patchValue({ longitude: this.originalLng });
        this.isEditingLng = false;
      }
    }

    this.isConfirmModalOpen = false;
    this.confirmType = '';
  }
  onEducationChange(event: any) {
    const value = event.detail.value;

    if (value === 'others') {
      this.showOtherInput = true;
      this.schoolForm.get('otherEducationLevel')?.enable();
      this.schoolForm.get('otherEducationLevel')?.setValidators([Validators.required]);
      this.schoolForm.get('otherEducationLevel')?.updateValueAndValidity();
    } else {
      this.showOtherInput = false;

      this.schoolForm.get('otherEducationLevel')?.setValue('');
      this.schoolForm.get('otherEducationLevel')?.disable();
      this.schoolForm.get('otherEducationLevel')?.clearValidators();
      this.schoolForm.get('otherEducationLevel')?.updateValueAndValidity();
    }
  }

  emailDomainValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

    return emailPattern.test(value) ? null : { invalidEmail: true };
  }
}
