import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstKey',
  standalone: true
})
export class FirstKeyPipe implements PipeTransform {

  transform(value: any, ...args: any[]) {
    const key = Object.keys(value);
    if (key && key.length > 0) {
      return key[0];
    }
    return null
  }

}
