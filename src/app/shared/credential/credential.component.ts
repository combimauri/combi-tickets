import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { QRCodeComponent, QRCodeModule } from 'angularx-qrcode';

import { Record } from '../../core/models/record.model';

@Component({
  selector: 'combi-credential',
  standalone: true,
  imports: [QRCodeModule],
  template: `
    <canvas #credentialCanvas [width]="WIDTH" [height]="HEIGHT"></canvas>
    <qrcode
      #qrCode
      elementType="img"
      errorCorrectionLevel="M"
      hidden
      [qrdata]="recordEmail"
      [width]="256"
    ></qrcode>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CredentialComponent {
  @Input({ required: true }) set record(record: Record | undefined) {
    this.loadCredential(record);
  }

  recordEmail = '';

  readonly HEIGHT = 636;
  readonly WIDTH = 391;

  private readonly QR_TOP = 240;
  private readonly QR_LEFT = 70;
  private readonly NAME_TOP = 190;
  private readonly NAME_LEFT = this.WIDTH / 2;

  @ViewChild('credentialCanvas', { static: true }) private credentialCanvas:
    | ElementRef
    | undefined;
  @ViewChild('qrCode', { static: true }) private qrCode:
    | QRCodeComponent
    | undefined;

  private loadCredential(record: Record | undefined): void {
    if (!record) {
      return;
    }

    this.recordEmail = record.email;
    const templateImage = new Image();
    templateImage.src = 'assets/img/credential-template.png';
    templateImage.onload = () =>
      this.loadCredentialImage(templateImage, record.name);
  }

  private loadCredentialImage(
    templateImage: HTMLImageElement,
    recordName: string,
  ): void {
    let qrImage = this.qrCode?.qrcElement.nativeElement.querySelector('img');

    if (!qrImage.src) {
      qrImage = this.qrCode?.qrcElement.nativeElement.querySelector('canvas');
    }

    this.buildImageContext(templateImage, recordName, qrImage);
  }

  private buildImageContext(
    templateImage: HTMLImageElement,
    recordName: string,
    qrImage: CanvasImageSource,
  ): void {
    const context = (
      this.credentialCanvas?.nativeElement as HTMLCanvasElement
    ).getContext('2d');

    if (!context) {
      return;
    }

    context.font = '32px Roboto';
    context.textAlign = 'center';

    context.drawImage(templateImage, 0, 0);
    context.fillText(recordName, this.NAME_LEFT, this.NAME_TOP);
    context.drawImage(qrImage, this.QR_LEFT, this.QR_TOP);
  }
}
