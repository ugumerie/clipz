import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, combineLatest, lastValueFrom, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import IClip from '../models/clip.model';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClipService implements Resolve<IClip | null> {
  public clipsCollection: AngularFirestoreCollection<IClip>;
  pageClips: IClip[] = [];
  pendingReq = false

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = db.collection('clips');
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    //the add() will instruct firebase to generate an id
    return this.clipsCollection.add(data);
  }

  getUserClips(
    sort$: BehaviorSubject<string>
  ): Observable<QueryDocumentSnapshot<IClip>[]> {
    /*
      Allows to merge several streams by taking the most 
      recent value from each input observable and emitting
      those values to the observer as a combined output 
      (usually as an array).
    */
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap((values) => {
        const [user, sort] = values;

        if (!user) {
          return of([]);
        }

        const query = this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc');

        //to execute the query
        return query.get();
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    );
  }

  updateClip(id: string, title: string): Promise<void> {
    return this.clipsCollection.doc(id).update({
      title,
    });
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFileName}`
    );

    // Adjust the firebase rules to allow deletes on storage
    clipRef.delete();
    screenshotRef.delete();

    await this.clipsCollection.doc(clip.docID).delete();
  }

  async getClips() {
    if (this.pendingReq) return

    this.pendingReq = true
    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);
    const { length } = this.pageClips

    if (length) {
      // get the last doc in the array
      const lastDocId = this.pageClips[length - 1].docID
      const lastDoc = await lastValueFrom(this.clipsCollection.doc(lastDocId).get())

      // continue to the next doc
      query = query.startAfter(lastDoc)
    }

    // excute the query
    const snapshot = await query.get()

    //populate the array
    snapshot.forEach(doc => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data()
      })
    })
    
    this.pendingReq = false
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection.doc(route.params['id']).get().pipe(
      map(snapshot => {
        const data = snapshot.data()

        if (!data) {
          this.router.navigate(['/'])
          return null // prevent this from running further
        }

        return data
      })
    )
  }
}
