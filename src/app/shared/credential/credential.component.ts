import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import { QRCodeComponent, QRCodeModule } from 'angularx-qrcode';

import { CombiRecord, RecordRole } from '../../core/models/record.model';
import { RecordService } from 'src/app/core/services/record.service';

@Component({
  selector: 'combi-credential',
  standalone: true,
  imports: [QRCodeModule],
  template: `
    <canvas
      #credentialCanvas
      [width]="WIDTH"
      [height]="HEIGHT"
      style="max-width: 100%;"
    ></canvas>
    <qrcode
      #qrCode
      elementType="img"
      errorCorrectionLevel="M"
      hidden
      [margin]="0"
      [qrdata]="recordEmail"
      [width]="200"
    ></qrcode>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CredentialComponent {
  @Input({ required: true }) set record(record: CombiRecord | undefined) {
    this._record = record;
    this.loadCredential(record);
  }

  @ViewChild('credentialCanvas', { static: true }) credentialCanvas:
    | ElementRef
    | undefined;

  recordEmail = '';

  readonly HEIGHT = 542;
  readonly WIDTH = 400;

  private _record?: CombiRecord;
  private storage = inject(Storage);
  private recordService = inject(RecordService);

  private readonly QR_TOP = 180;
  private readonly QR_LEFT = 100;
  private readonly NAME_TOP = 150;
  private readonly NAME_LEFT = this.WIDTH / 2;
  private readonly TEMPLATES: Record<RecordRole, string> = {
    [RecordRole.Asistente]: 'assets/img/participant-iwd.png',
    [RecordRole.Staff]: 'assets/img/staff-iwd.png',
    [RecordRole.Speaker]: 'assets/img/speaker-iwd.png',
    [RecordRole.Sponsor]: 'assets/img/sponsor-iwd.png',
  };

  @ViewChild('qrCode', { static: true }) private qrCode:
    | QRCodeComponent
    | undefined;

  @Output() private saveInCloud = new EventEmitter<string>();
  @Output() private credentialLoaded = new EventEmitter<void>();

  print(): void {
    if (!this._record) {
      return;
    }

    const printButton = document.createElement('a');
    printButton.download = this._record?.name;
    printButton.href =
      this.credentialCanvas?.nativeElement.toDataURL('image/png;base64');
    printButton.click();
  }

  saveInStorage(): void {
    if (!this._record) {
      return;
    }

    this.credentialCanvas?.nativeElement.toBlob((file: Blob) => {
      const storageRef = ref(this.storage, `mt/${this._record?.email}`);

      uploadBytes(storageRef, file).then(async (snapshot) => {
        const credentialUrl = await getDownloadURL(snapshot.ref);

        this.saveInCloud.emit(credentialUrl);

        if (!this._record) {
          return;
        }

        this.recordService.updateRecord(this._record?.email, { credentialUrl });
      });
    });
  }

  private loadCredential(record: CombiRecord | undefined): void {
    if (!record) {
      return;
    }

    this.recordEmail = record.email;
    const templateImage = new Image();
    templateImage.src =
      this.TEMPLATES[record.role] || this.TEMPLATES[RecordRole.Asistente];
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
    // Uncomment in case we need to show the role in the credential
    // context.strokeText(record.role, this.NAME_LEFT, this.NAME_TOP + 24);
    context.strokeRect(0, 0, this.WIDTH, this.HEIGHT);
    context.drawImage(qrImage, this.QR_LEFT, this.QR_TOP);

    this.credentialLoaded.emit();
  }
}
