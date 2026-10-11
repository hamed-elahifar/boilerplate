import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'string-or-number', async: false })
export class IsNumberOrString implements ValidatorConstraintInterface {
  validate(value: any) {
    return typeof value === 'number' || typeof value === 'string';
  }

  defaultMessage() {
    return '($value) must be number or string';
  }
}
