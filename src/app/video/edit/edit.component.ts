import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter()

  inSubmission = false;
  showAlert = false;
  alertColor = 'blue'
  alertMsg = 'Please wait! Updating clip...'

  clipID = new FormControl('', {
    nonNullable: true
  })
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });

  editForm = new FormGroup({
    title: this.title,
    id: this.clipID
  });

  constructor(private modal: ModalService, private clipsService: ClipService) { }

  ngOnChanges(changes: SimpleChanges): void {
    //if the activeClip value is changed from the manage component (parent component)
    if (!this.activeClip) {
      return
    }

    //when opening a modal reset these value on property changes
    this.inSubmission = false
    this.showAlert = false

    this.clipID.setValue(this.activeClip.docID as string)
    this.title.setValue(this.activeClip.title)
  }

  ngOnInit(): void {
    this.modal.register('editClip')
  }

  async submit() {
    if (!this.activeClip) {
      return
    }

    this.inSubmission = true
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait! Updating clip...'

    try {
      await this.clipsService.updateClip(this.clipID.value, this.title.value)
    } catch (error) {
      this.inSubmission = false
      this.alertColor = 'red'
      this.alertMsg = 'Something went wrong. Try again later'

      return
    }

    // update the activeClip title prop from the form
    this.activeClip.title = this.title.value
    this.update.emit(this.activeClip)

    this.inSubmission = false
    this.alertColor = 'green'
    this.alertMsg = 'Success! Changes are completed.'
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip');
  }
}
