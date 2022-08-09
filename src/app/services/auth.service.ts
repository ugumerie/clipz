import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, filter, map, switchMap } from 'rxjs/operators';
import IUser from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean>;
  public isAuthenticatedWithDelay$: Observable<boolean>;
  private redirect = false;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.usersCollection = this.db.collection('users');

    this.isAuthenticated$ = this.auth.user.pipe(map((user) => !!user));

    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map((e) => this.route.firstChild),
        switchMap((route) => route?.data ?? of({}))
      )
      .subscribe((data) => {
        this.redirect = data['authOnly'] ?? false;
      });
  }

  public async createUser(userData: IUser) {
    if (!userData.password) {
      throw new Error('Password not provided!');
    }

    const userCred = await this.auth.createUserWithEmailAndPassword(
      userData.email,
      userData.password
    );

    if (!userCred.user) {
      throw new Error("User can't be found!");
    }

    //Creates a collection and add the document
    // The add() without the doc() is used to generate a document with with auto generated doc id
    // Since we change the database rule on firebase console, firebase SDK will attach a token along with this write request
    // because one a user is being created they are authenticated immediately and saved to the indexDB and localStorage
    await this.usersCollection.doc(userCred.user.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber,
    });

    await userCred.user.updateProfile({
      displayName: userData.name,
    });
  }

  public async logout($event?: Event): Promise<void> {
    if ($event) {
      $event.preventDefault();
    }

    await this.auth.signOut();

    if (this.redirect) {
      //absolute path
      await this.router.navigateByUrl('/');
    }
  }
}
