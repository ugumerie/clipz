import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() {}

  register(id: string): void {
    this.modals.push({ id, visible: false });
  }

  unregister(id: string) {
    this.modals = this.modals.filter((element) => element.id !== id);
  }

  isModalOpen(id: string): boolean {
    return !!this.modals.find((element) => element.id === id)?.visible;
  }

  toggleModal(id: string): void {
    const modal = this.modals.find((element) => element.id === id);

    if (modal) {
      modal.visible = !modal.visible;
    }

    //this.visible = !this.visible;
  }

  // isLeap(year: any) {
  //   if (year % 4 == 0 && year % 100 !== 0) {
  //     alert(' LEAP YEAR');
  //   } else if (year % 100 == 0 && year % 4 == 0 && year % 400 == 0) {
  //     alert('IT IS LEAP YEAR');
  //   } else {
  //     alert('not leap');
  //   }
  // }
}
