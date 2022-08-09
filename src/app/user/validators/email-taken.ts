import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';

//By default dependency injection do not work on bare classes
//adding the @Injectable() will allow for dependency injection within the constructor and being able to inject its instance in 
//other classes
@Injectable({
    providedIn: 'root'
})
export class EmailTaken implements AsyncValidator {
  constructor(private auth: AngularFireAuth) {}

  //the arrow function was added to solve the this keyword issue in the component
  validate = (control: AbstractControl): Promise<ValidationErrors | null> => {
    return this.auth
      .fetchSignInMethodsForEmail(control.value)
      .then((response) => (response.length ? { emailTaken: true } : null));
  }
}
