import { Component, OnInit } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {

  readonly myMatchOptions: IsActiveMatchOptions = {
    queryParams: 'ignored',
    matrixParams: 'exact',
    paths: 'exact',
    fragment: 'exact',
  };
  
  constructor(
    public modal: ModalService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {}

  openModal(event: Event) {
    event.preventDefault();

    this.modal.toggleModal('auth');
  }
}
