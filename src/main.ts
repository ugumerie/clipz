import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

if (environment.production) {
  enableProdMode();
}

// Firebase runs before angular app
//Initialize firebase app, once completed, the firebase SDK checks if the user is authenticated
firebase.initializeApp(environment.firebase);

let appInit = false;
//runs after initialization
firebase.auth().onAuthStateChanged(() => {
  if (!appInit) {
    // Angular is setup after the bootstrapModule is called
    platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch((err) => console.error(err));
  }

  //this ensures that we only excute this once, bcos users auth can change
  appInit = true
});
