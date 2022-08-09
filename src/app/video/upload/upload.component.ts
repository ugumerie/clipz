import { Component, OnDestroy } from '@angular/core';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuid } from 'uuid'; // npm i uuid @types/uuid
import { last, switchMap } from 'rxjs/operators';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnDestroy {
  isDragOver = false;
  file: File | null = null;
  nextStep = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! Your clip is being uploaded...';
  inSubmission = false;
  percentage = 0;
  showPercentage = false;
  user: firebase.User | null = null; // for type purpose
  task?: AngularFireUploadTask;
  screenshots: string[] = [];
  selectedScreenshot = '';
  screenshotTask?: AngularFireUploadTask;

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });

  uploadForm = new FormGroup({
    title: this.title,
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    // User has been authenticated at this stage
    this.auth.user.subscribe((user) => {
      this.user = user;
    });

    //init ffmpeg
    this.ffmpegService.init();
  }

  async storeFile($event: Event): Promise<void> {
    //prevents the user from uploading another file while a file is being uploaded
    if (this.ffmpegService.isRunning) {
      return;
    }

    // console.log($event)
    this.isDragOver = false;

    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    // mp4 files are generally supported by most browsers
    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenshot = this.screenshots[0];

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;

    // console.log(this.file)
  }

  async uploadFile(): Promise<void> {
    // console.log('Uploaded File')

    this.uploadForm.disable();

    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your clip is being uploaded...';
    this.inSubmission = true;
    this.showPercentage = true;

    const clipFileName = uuid();

    // Creates a folder - clips.
    // The filename can be overridden if the file has the same on upload.
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenshot
    );
    const screenshotPath = `screenshots/${clipFileName}.png`;

    // modify the firebase rules b4 uploading
    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath); // gets the url of the file

    //screenshot
    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
    const screenshotRef = this.storage.ref(screenshotPath);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe(([clipProgress, screenshotProgress]) => {
      // check if variables are empty and quit
      if (!clipProgress || !screenshotProgress) {
        return;
      }

      const total = clipProgress + screenshotProgress;

      this.percentage = (total as number) / 200; // for both observables
    });

    //console.log() to check the value emitted by this and look out for state property in the delegate object
    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async ([clipURL, screeshotURL]) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url: clipURL,
            screeshotURL,
            screenshotFileName: `${clipFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };

          const clipDocRef = await this.clipsService.createClip(clip);

          //console.log(clip)
          this.alertColor = 'green';
          this.alertMsg =
            'Success! Your clip is now ready to share with the world.';
          this.showPercentage = false;

          //For the user to see the success message b4 redirection
          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000);
        },
        error: (err) => {
          this.uploadForm.enable();

          this.alertColor = 'red';
          this.alertMsg = 'Upload failed! Please try again later.';
          this.inSubmission = true;
          this.showPercentage = false;
          console.error(err);
        },
      });
  }

  ngOnDestroy(): void {
    // Cancel the upload when the user navigates away from the component
    this.task?.cancel();
  }
}
