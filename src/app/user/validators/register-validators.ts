import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class RegisterValidators {
  static match(controlName: string, matchingControlName: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const control = group.get(controlName);
      const matchingControl = group.get(matchingControlName);

      if (!control || !matchingControl) {
        //for developers, incase they input an invalid control name
        console.error('Form controls cannot be found in the form group.')
        return { controlNotFound: false };
      }

      const error =
        control.value === matchingControl.value ? null : { noMatch: true };

      matchingControl.setErrors(error)

      return error;
    };
  }
}

//create validationErrors b4 the factory function

//Abstractcontrol class is inherited by formcontrol and formgroup - we have access to either formgroup or formcontrol class
// static methods cannot access class properties, methods and dependency injection
//new RegisterValidators().match(); without static keyword
//RegisterValidators.match(); with static keyword
