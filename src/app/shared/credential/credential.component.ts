import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import { QRCodeComponent, QRCodeModule } from 'angularx-qrcode';

import { TranslateRolePipe } from './translate-role.pipe';
import { CombiRecord, RecordRole } from '../../core/models/record.model';

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
  providers: [TranslateRolePipe],
})
export class CredentialComponent {
  @Input({ required: true }) set record(record: CombiRecord | undefined) {
    this.loadCredential(record);
  }

  @ViewChild('credentialCanvas', { static: true }) credentialCanvas:
    | ElementRef
    | undefined;

  recordEmail = '';

  readonly HEIGHT = 565;
  readonly WIDTH = 400;

  private translateRole = inject(TranslateRolePipe);

  private readonly QR_TOP = 200;
  private readonly QR_LEFT = 70;
  private readonly NAME_TOP = 170;
  private readonly NAME_LEFT = this.WIDTH / 2;
  private readonly TEMPLATES: Record<RecordRole, string> = {
    [RecordRole.GUIDE]: 'assets/img/staff.png',
    [RecordRole.ORGANIZER]: 'assets/img/staff.png',
    [RecordRole.MENTOR]: 'assets/img/staff.png',
    [RecordRole.PARTICIPANT]: 'assets/img/participant.png',
    [RecordRole.KID]: 'assets/img/kid.png',
  };

  @ViewChild('qrCode', { static: true }) private qrCode:
    | QRCodeComponent
    | undefined;

  private loadCredential(record: CombiRecord | undefined): void {
    if (!record) {
      return;
    }

    this.recordEmail = record.email;
    const templateImage = new Image();
    templateImage.src =
      this.TEMPLATES[record.role] || this.TEMPLATES[RecordRole.PARTICIPANT];
    templateImage.onload = () =>
      this.loadCredentialImage(templateImage, record);
  }

  private loadCredentialImage(
    templateImage: HTMLImageElement,
    record: CombiRecord,
  ): void {
    let qrImage = this.qrCode?.qrcElement.nativeElement.querySelector('img');

    if (!qrImage.src) {
      qrImage = this.qrCode?.qrcElement.nativeElement.querySelector('canvas');
    }

    this.buildImageContext(templateImage, record, qrImage);
  }

  private buildImageContext(
    templateImage: HTMLImageElement,
    record: CombiRecord,
    qrImage: CanvasImageSource,
  ): void {
    const context = (
      this.credentialCanvas?.nativeElement as HTMLCanvasElement
    ).getContext('2d');

    if (!context) {
      return;
    }

    context.font = '20px Roboto';
    context.textAlign = 'center';

    context.drawImage(templateImage, 0, 0);
    context.fillText(record.name, this.NAME_LEFT, this.NAME_TOP);
    context.strokeText(
      this.translateRole.transform(record.role),
      this.NAME_LEFT,
      this.NAME_TOP + 24,
    );
    context.strokeRect(0, 0, this.WIDTH, this.HEIGHT);
    context.drawImage(qrImage, this.QR_LEFT, this.QR_TOP);
  }
}
