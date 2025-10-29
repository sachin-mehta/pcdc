import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CountryService } from 'src/app/services/country.service';
import { ContactUsService } from 'src/app/services/contact-us.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
  standalone: false

})
export class ContactUsComponent implements OnInit {
  contactForm!: FormGroup;

  constructor(private fb: FormBuilder, private contactusService: ContactUsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, this.emailDomainValidator]],
      organization: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
    });
  }

  /**
   * ✅ Custom email validator — same logic as SaveSchoolEmailComponent
   */
  emailDomainValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(value) ? null : { invalidEmail: true };
  }

  /**
   * ✅ On Submit
   * Sends formatted data to /contact API
   */
  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const payload = {
      category: 'gigameter',
      full_name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      organisation: this.contactForm.value.organization,
      message: this.contactForm.value.message,
      purpose: 'Country Whitelist'
    };

    console.log('Form Submitted:', payload);

    // Example API integration
   
    this.contactusService.postContact(payload).subscribe({
      next: (res) => {
       this.router.navigate(['/searchcountry']);
      },
      error: (err) => console.error('Error posting contact:', err),
    });
  }
}
