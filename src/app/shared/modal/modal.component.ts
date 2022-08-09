import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() modalID: string = ''

  constructor(public modal: ModalService, private el: ElementRef) { }
  
  ngOnInit(): void {
    document.body.appendChild(this.el.nativeElement);
  }

  closeModal(): void {
    this.modal.toggleModal(this.modalID)
  }

  ngOnDestroy(): void {
    document.body.removeChild(this.el.nativeElement)
  }
}
