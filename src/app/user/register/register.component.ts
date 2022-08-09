import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { EmailTaken } from '../validators/email-taken';
import { RegisterValidators } from '../validators/register-validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ], [this.emailTaken.validate]),
    age: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(18),
      Validators.max(120)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
    ]),
    confirm_password: new FormControl('', [
      Validators.required
    ]),
    phoneNumber: new FormControl('', [
      Validators.required,
      Validators.minLength(11),
      Validators.maxLength(11)
    ]),
  }, [RegisterValidators.match('password', 'confirm_password')])

  showAlert = false;
  alertMsg = 'Please wait! Your account is being created.'
  alertColor = 'blue'
  inSubmission = false;

  constructor(private auth: AuthService, private emailTaken: EmailTaken) {}

  async register() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created...'
    this.alertColor = 'blue'
    this.inSubmission = true;

    try {
      await this.auth.createUser(this.registerForm.value as IUser)
    } catch (error) {
      console.error(error)

      this.alertMsg = 'An unexpected error occurred. Please try again later.'
      this.alertColor = 'red'
      this.inSubmission = false
      return //stops the function from executing further
    }

    this.alertMsg = 'Success! Your account has been created.'
    this.alertColor = 'green'
  }
}
