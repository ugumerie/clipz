import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: '',
  };

  showAlert = false;
  alertMsg = 'Please wait! We are logging you in.'
  alertColor = 'blue'
  inSubmission = false;

  constructor(private auth: AngularFireAuth) {}

  ngOnInit(): void {}

  async login() {
    this.showAlert = true
    this.alertMsg = 'Please wait! We are logging you in.'
    this.alertColor = 'blue'
    this.inSubmission = true

    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
    } catch (e: any) {
      this.inSubmission = false;
      this.alertColor = 'red'

      if (e.code === 'auth/user-not-found') {
        this.alertMsg = 'An unexpected error occurred. Please try again later.'

        return
      }

      if (e.code === 'auth/wrong-password') {
        this.alertMsg = 'Invalid login! The email or password does not match.'

        return
      }

      this.alertMsg = e.message
     
      return
    }

    this.alertMsg = 'Success! You are now logged in.'
    this.alertColor = 'green'
  }
}
