import { Pipe, PipeTransform } from '@angular/core';
import { RecordRole } from 'src/app/core/models/record.model';

@Pipe({
  name: 'translateRole',
  standalone: true,
})
export class TranslateRolePipe implements PipeTransform {
  private readonly TRANSLATIONS: Record<RecordRole, string> = {
    [RecordRole.GUIDE]: 'GUÍA',
    [RecordRole.ORGANIZER]: 'STAFF',
    [RecordRole.MENTOR]: 'MENTOR',
    [RecordRole.PARTICIPANT]: 'JAMMER',
    [RecordRole.KID]: 'KID',
  };

  transform(value: RecordRole) {
    return this.TRANSLATIONS[value] || value;
  }
}
