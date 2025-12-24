/**
 * ================================
 * ALL SCHEMA EXPORTS
 * ================================
 */

export {
  generateTextInputSchema,
  generateTextAreaSchema,
  generateEmailInputSchema,
  generatePasswordSchema,
} from './schemas/textSchemas';

export {
  generateNumberInputSchema,
  generateCurrencyInputSchema,
  generatePercentageInputSchema,
  generateSliderSchema,
  generateRatingSchema,
} from './schemas/numberSchemas';

export {
  generateDateInputSchema,
  generateTimeInputSchema,
  generateDateTimeInputSchema,
} from './schemas/dateTimeSchemas';

export {
  generateDropdownSchema,
  generateMultiSelectSchema,
  generateRadioGroupSchema,
  generateCheckboxSchema,
  generateToggleSwitchSchema,
} from './schemas/selectSchemas';

export {
  generateFileUploadSchema,
  generateImageUploadSchema,
  generateVideoUploadSchema,
  generateDocumentUploadSchema,
  generateSignaturePadSchema,
} from './schemas/fileSchemas';

export {
  generatePhoneInputSchema,
  generateUrlInputSchema,
  generateColorPickerSchema,
  generateLocationPickerSchema,
  generateAddressSchema,
} from './schemas/specialSchemas';
