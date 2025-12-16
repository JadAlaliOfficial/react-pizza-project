// src/pages/EndUserFormPage/index.tsx (UPDATED VERSION)

import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormStructure } from '../hooks/formStructure.hook';
import { AddressInput } from '@/features/formBuilder/endUserForms/components/fields/AddressInput';
import { CheckboxInput } from '@/features/formBuilder/endUserForms/components/fields/CheckboxInput';
import { EmailInput } from '@/features/formBuilder/endUserForms/components/fields/EmailInput';
import {
  generateAddressSchema,
  getDefaultAddressValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/addressValidation';
import {
  generateCheckboxSchema,
  getDefaultCheckboxValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/checkboxValidation';
import { ColorPickerInput } from '@/features/formBuilder/endUserForms/components/fields/ColorPickerInput';
import {
  generateColorPickerSchema,
  getDefaultColorPickerValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/colorPickerValidation';
import { CurrencyInput } from '@/features/formBuilder/endUserForms/components/fields/CurrencyInput';
import {
  generateCurrencyInputSchema,
  getDefaultCurrencyInputValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/currencyInputValidation';
import { DateInput } from '@/features/formBuilder/endUserForms/components/fields/DateInput';
import {
  generateDateInputSchema,
  getDefaultDateInputValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/dateInputValidation';
import { DateTimeInput } from '@/features/formBuilder/endUserForms/components/fields/DateTimeInput';
import {
  generateDateTimeInputSchema,
  getDefaultDateTimeInputValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/dateTimeInputValidation';
import { DocumentUpload } from '@/features/formBuilder/endUserForms/components/fields/DocumentUpload';
import {
  generateDocumentUploadSchema,
  getDefaultDocumentUploadValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/documentUploadValidation';
import { DropdownSelect } from '@/features/formBuilder/endUserForms/components/fields/DropdownSelect';
import {
  generateEmailInputSchema,
  getDefaultEmailInputValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/emailInputValidation';

import {
  generateDropdownSelectSchema,
  getDefaultDropdownSelectValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/dropdownSelectValidation';
import { FileUpload } from '@/features/formBuilder/endUserForms/components/fields/FileUpload';
import {
  generateFileUploadSchema,
  getDefaultFileUploadValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/fileUploadValidation';
import { ImageUpload } from '@/features/formBuilder/endUserForms/components/fields/ImageUpload';
import {
  generateImageUploadSchema,
  getDefaultImageUploadValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/imageUploadValidation';
import { MultiSelect } from '@/features/formBuilder/endUserForms/components/fields/MultiSelect';
import {
  generateMultiSelectSchema,
  getDefaultMultiSelectValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/multiSelectValidation';
import { NumberInput } from '@/features/formBuilder/endUserForms/components/fields/NumberInput';
import {
  generateNumberInputSchema,
  getDefaultNumberInputValue,
  getCrossFieldRules as getNumberCrossFieldRules,
} from '@/features/formBuilder/endUserForms/components/fields/validation/numberInputValidation';
import { PercentageInput } from '@/features/formBuilder/endUserForms/components/fields/PercentageInput';
import {
  generatePercentageInputSchema,
  getDefaultPercentageInputValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/percentageInputValidation';
import { PasswordInput } from '@/features/formBuilder/endUserForms/components/fields/PasswordInput';
import {
  generatePasswordInputSchema,
  getDefaultPasswordInputValue,
  getCrossFieldRules as getPasswordCrossFieldRules,
} from '@/features/formBuilder/endUserForms/components/fields/validation/passwordInputValidation';
import { TextInput } from '@/features/formBuilder/endUserForms/components/fields/TextInput';
import {
  generateTextInputSchema,
  getDefaultTextInputValue,
  getCrossFieldRules as getTextCrossFieldRules,
} from '@/features/formBuilder/endUserForms/components/fields/validation/textInputValidation';
import { RadioButton } from '@/features/formBuilder/endUserForms/components/fields/RadioButton';
import {
  generateRadioButtonSchema,
  getDefaultRadioButtonValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/radioButtonValidation';
import { Rating } from '@/features/formBuilder/endUserForms/components/fields/Rating';
import {
  generateRatingSchema,
  getDefaultRatingValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/ratingValidation';
import { SignaturePad } from '@/features/formBuilder/endUserForms/components/fields/SignaturePad';
import {
  generateSignaturePadSchema,
  getDefaultSignaturePadValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/signaturePadValidation';
import { Slider } from '@/features/formBuilder/endUserForms/components/fields/Slider';
import {
  generateSliderSchema,
  getDefaultSliderValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/sliderValidation';
import { TextArea } from '@/features/formBuilder/endUserForms/components/fields/TextArea';
import {
  generateTextAreaSchema,
  getDefaultTextAreaValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/textAreaValidation';
import { TimeInput } from '@/features/formBuilder/endUserForms/components/fields/TimeInput';
import {
  generateTimeInputSchema,
  getDefaultTimeInputValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/timeInputValidation';
import { ToggleSwitch } from '@/features/formBuilder/endUserForms/components/fields/ToggleSwitch';
import {
  generateToggleSwitchSchema,
  getDefaultToggleSwitchValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/toggleSwitchValidation';
import { UrlInput } from '@/features/formBuilder/endUserForms/components/fields/UrlInput';
import {
  generateUrlInputSchema,
  getDefaultUrlInputValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/urlInputValidation';
import { VideoUpload } from '@/features/formBuilder/endUserForms/components/fields/VideoUpload';
import {
  generateVideoUploadSchema,
  getDefaultVideoUploadValue,
} from '@/features/formBuilder/endUserForms/components/fields/validation/videoUploadValidation';

const EndUserFormPage: React.FC = () => {
  const { formVersionId, languageId } = useParams<{
    formVersionId: string;
    languageId: string;
  }>();

  const fv = Number(formVersionId);
  const ln = Number(languageId);

  // Refs for scrolling to first error
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data, isLoading, isError, error, refetch } = useFormStructure({
    formVersionId: fv,
    languageId: ln,
    fetchOnMount: true,
  });

  // Build dynamic form schema
  const buildFormSchema = () => {
    if (!data) {
      return z.object({ _placeholder: z.string().optional() });
    }

    const schemaShape: Record<string, z.ZodType> = {};

    data.stage.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.field_type === 'Address Input') {
          schemaShape[`field_${field.field_id}`] = generateAddressSchema(field);
        }
        if (field.field_type === 'Checkbox') {
          schemaShape[`field_${field.field_id}`] =
            generateCheckboxSchema(field);
        }
        if (field.field_type === 'Color Picker') {
          schemaShape[`field_${field.field_id}`] =
            generateColorPickerSchema(field);
        }
        if (field.field_type === 'Currency Input') {
          schemaShape[`field_${field.field_id}`] =
            generateCurrencyInputSchema(field);
        }
        if (field.field_type === 'Date Input') {
          schemaShape[`field_${field.field_id}`] =
            generateDateInputSchema(field);
        }
        if (field.field_type === 'DateTime Input') {
          schemaShape[`field_${field.field_id}`] =
            generateDateTimeInputSchema(field);
        }
        if (field.field_type === 'Document Upload') {
          schemaShape[`field_${field.field_id}`] =
            generateDocumentUploadSchema(field);
        }
        if (field.field_type === 'Dropdown Select') {
          schemaShape[`field_${field.field_id}`] =
            generateDropdownSelectSchema(field);
        }
        if (field.field_type === 'File Upload') {
          schemaShape[`field_${field.field_id}`] =
            generateFileUploadSchema(field);
        }
        if (field.field_type === 'Email Input') {
          schemaShape[`field_${field.field_id}`] =
            generateEmailInputSchema(field);
        }
        if (field.field_type === 'Image Upload') {
          schemaShape[`field_${field.field_id}`] =
            generateImageUploadSchema(field);
        }
        if (field.field_type === 'Multi_Select') {
          schemaShape[`field_${field.field_id}`] =
            generateMultiSelectSchema(field);
        }
        if (field.field_type === 'Number Input') {
          schemaShape[`field_${field.field_id}`] =
            generateNumberInputSchema(field);
        }

        if (field.field_type === 'Percentage Input') {
          schemaShape[`field_${field.field_id}`] =
            generatePercentageInputSchema(field);
        }
        if (field.field_type === 'Password Input') {
          schemaShape[`field_${field.field_id}`] =
            generatePasswordInputSchema(field);
        }
        if (field.field_type === 'Text Input') {
          schemaShape[`field_${field.field_id}`] =
            generateTextInputSchema(field);
        }
        if (field.field_type === 'Radio Button') {
          schemaShape[`field_${field.field_id}`] =
            generateRadioButtonSchema(field);
        }
        if (field.field_type === 'Rating') {
          schemaShape[`field_${field.field_id}`] = generateRatingSchema(field);
        }
        if (field.field_type === 'Signature Pad') {
          schemaShape[`field_${field.field_id}`] =
            generateSignaturePadSchema(field);
        }
        if (field.field_type === 'Slider') {
          schemaShape[`field_${field.field_id}`] = generateSliderSchema(field);
        }
        if (field.field_type === 'Text Area') {
          schemaShape[`field_${field.field_id}`] =
            generateTextAreaSchema(field);
        }
        if (field.field_type === 'Time Input') {
          schemaShape[`field_${field.field_id}`] =
            generateTimeInputSchema(field);
        }
        if (field.field_type === 'Toggle Switch') {
          schemaShape[`field_${field.field_id}`] =
            generateToggleSwitchSchema(field);
        }
        if (field.field_type === 'URL Input') {
          schemaShape[`field_${field.field_id}`] =
            generateUrlInputSchema(field);
        }
        if (field.field_type === 'Video Upload') {
          schemaShape[`field_${field.field_id}`] =
            generateVideoUploadSchema(field);
        }
      });
    });

    // Create base schema
    let formSchema = z.object(schemaShape);

    // Add cross-field validation for Email Input (same/different rules)
    formSchema = formSchema.superRefine((formData, ctx) => {
      data.stage.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (field.field_type === 'Email Input') {
            const fieldName = `field_${field.field_id}`;
            const fieldValue = formData[fieldName];

            // Check for 'same' rule
            const sameRule = field.rules?.find((r) => r.rule_name === 'same');
            if (sameRule?.rule_props) {
              const compareFieldId = (
                sameRule.rule_props as { comparevalue?: number | string }
              ).comparevalue;
              if (compareFieldId) {
                const compareFieldName = `field_${compareFieldId}`;
                const compareValue = formData[compareFieldName];

                if (fieldValue && compareValue && fieldValue !== compareValue) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `${field.label} must match the other field`,
                    path: [fieldName],
                  });
                }
              }
            }

            // Check for 'different' rule
            const differentRule = field.rules?.find(
              (r) => r.rule_name === 'different',
            );
            if (differentRule?.rule_props) {
              const compareFieldId = (
                differentRule.rule_props as { comparevalue?: number | string }
              ).comparevalue;
              if (compareFieldId) {
                const compareFieldName = `field_${compareFieldId}`;
                const compareValue = formData[compareFieldName];

                if (fieldValue && compareValue && fieldValue === compareValue) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `${field.label} must be different from the other field`,
                    path: [fieldName],
                  });
                }
              }
            }
          }
          // Add Number Input same/different validation
          if (field.field_type === 'Number Input') {
            const fieldName = `field_${field.field_id}`;
            const fieldValue = formData[fieldName];
            const { sameAs, differentFrom } = getNumberCrossFieldRules(
              field.rules || [],
            );

            // Check for 'same' rule
            if (sameAs) {
              const compareFieldName = `field_${sameAs}`;
              const compareValue = formData[compareFieldName];

              if (
                fieldValue !== undefined &&
                compareValue !== undefined &&
                fieldValue !== compareValue
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `${field.label} must match the other field`,
                  path: [fieldName],
                });
              }
            }

            // Check for 'different' rule
            if (differentFrom) {
              const compareFieldName = `field_${differentFrom}`;
              const compareValue = formData[compareFieldName];

              if (
                fieldValue !== undefined &&
                compareValue !== undefined &&
                fieldValue === compareValue
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `${field.label} must be different from the other field`,
                  path: [fieldName],
                });
              }
            }
          }
          // Add Password Input same/different validation
          if (field.field_type === 'Password Input') {
            const fieldName = `field_${field.field_id}`;
            const fieldValue = formData[fieldName];
            const { sameAs, differentFrom } = getPasswordCrossFieldRules(
              field.rules || [],
            );

            // Check for 'same' rule
            if (sameAs) {
              const compareFieldName = `field_${sameAs}`;
              const compareValue = formData[compareFieldName];

              if (fieldValue && compareValue && fieldValue !== compareValue) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `${field.label} must match the other field`,
                  path: [fieldName],
                });
              }
            }

            // Check for 'different' rule
            if (differentFrom) {
              const compareFieldName = `field_${differentFrom}`;
              const compareValue = formData[compareFieldName];

              if (fieldValue && compareValue && fieldValue === compareValue) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `${field.label} must be different from the other field`,
                  path: [fieldName],
                });
              }
            }
          }
          // Add Text Input same/different validation
          if (field.field_type === 'Text Input') {
            const fieldName = `field_${field.field_id}`;
            const fieldValue = formData[fieldName];
            const { sameAs, differentFrom } = getTextCrossFieldRules(
              field.rules || [],
            );

            // Check for 'same' rule
            if (sameAs) {
              const compareFieldName = `field_${sameAs}`;
              const compareValue = formData[compareFieldName];

              if (fieldValue && compareValue && fieldValue !== compareValue) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `${field.label} must match the other field`,
                  path: [fieldName],
                });
              }
            }

            // Check for 'different' rule
            if (differentFrom) {
              const compareFieldName = `field_${differentFrom}`;
              const compareValue = formData[compareFieldName];

              if (fieldValue && compareValue && fieldValue === compareValue) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `${field.label} must be different from the other field`,
                  path: [fieldName],
                });
              }
            }
          }
        });
      });
    });

    return formSchema;
  };

  const formSchema = buildFormSchema();
  type FormData = z.infer<typeof formSchema>;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
  });

  // Set default values
  useEffect(() => {
    if (data) {
      const defaultValues: Record<string, any> = {};

      data.stage.sections.forEach((section) => {
        section.fields.forEach((field) => {
          if (field.field_type === 'Address Input') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultAddressValue(field);
          }
          if (field.field_type === 'Checkbox') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultCheckboxValue(field);
          }
          if (field.field_type === 'Color Picker') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultColorPickerValue(field);
          }
          if (field.field_type === 'Currency Input') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultCurrencyInputValue(field);
          }
          if (field.field_type === 'Date Input') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultDateInputValue(field);
          }
          if (field.field_type === 'DateTime Input') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultDateTimeInputValue(field);
          }
          if (field.field_type === 'Document Upload') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultDocumentUploadValue(field);
          }
          if (field.field_type === 'Dropdown Select') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultDropdownSelectValue(field);
          }
          if (field.field_type === 'File Upload') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultFileUploadValue(field);
          }
          if (field.field_type === 'Image Upload') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultImageUploadValue(field);
          }
          if (field.field_type === 'Multi_Select') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultMultiSelectValue(field);
          }
          if (field.field_type === 'Percentage Input') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultPercentageInputValue(field);
          }
          if (field.field_type === 'Number Input') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultNumberInputValue(field);
          }

          if (field.field_type === 'Email Input') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultEmailInputValue(field);
          }

          if (field.field_type === 'Password Input') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultPasswordInputValue(field);
          }

          if (field.field_type === 'Text Input') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultTextInputValue(field);
          }
          if (field.field_type === 'Radio Button') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultRadioButtonValue(field);
          }
          if (field.field_type === 'Rating') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultRatingValue(field);
          }
          if (field.field_type === 'Signature Pad') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultSignaturePadValue(field);
          }
          if (field.field_type === 'Slider') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultSliderValue(field);
          }
          if (field.field_type === 'Text Area') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultTextAreaValue(field);
          }
          if (field.field_type === 'Time Input') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultTimeInputValue(field);
          }
          if (field.field_type === 'Toggle Switch') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultToggleSwitchValue(field);
          }
          if (field.field_type === 'URL Input') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultUrlInputValue(field);
          }
          if (field.field_type === 'Video Upload') {
            defaultValues[`field_${field.field_id}`] =
              getDefaultVideoUploadValue(field);
          }
        });
      });

      reset(defaultValues as FormData);
    }
  }, [data, reset]);

  // Scroll to first error
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const firstErrorElement = fieldRefs.current[firstErrorKey];

      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        setTimeout(() => {
          const firstInput = firstErrorElement.querySelector(
            'input, textarea, select',
          );
          if (firstInput instanceof HTMLElement) {
            firstInput.focus();
          }
        }, 500);
      }
    }
  }, [errors]);

  const onSubmit = async (formData: FormData) => {
    console.log('Form submitted:', formData);

    try {
      const submissionData = {
        form_version_id: fv,
        language_id: ln,
        stage_id: data?.stage.stage_id,
        fields: Object.entries(formData)
          .filter(([key]) => key !== '_placeholder')
          .map(([key, value]) => ({
            field_id: parseInt(key.replace('field_', '')),
            value: value,
          })),
      };

      console.log('Submitting to API:', submissionData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('Form submitted successfully!');
    } catch (error: any) {
      console.error('Submission error:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading form...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-600">Error: {error?.message}</div>
          <button
            onClick={() => refetch(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>No form data available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{data.form_name}</h1>
        <p className="text-muted-foreground">
          {data.stage.stage_name} • Version {data.version_number}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {data.stage.sections.map((section) => (
          <div
            key={section.section_id}
            className="bg-white rounded-lg border p-6 space-y-6"
          >
            <h2 className="text-xl font-semibold border-b pb-2">
              {section.section_name}
            </h2>

            {section.fields.map((field) => {
              const fieldName = `field_${field.field_id}`;

              if (field.field_type === 'Address Input') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <AddressInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Checkbox') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <CheckboxInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Color Picker') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <ColorPickerInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Currency Input') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <CurrencyInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Date Input') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <DateInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'DateTime Input') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <DateTimeInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Document Upload') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <DocumentUpload
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Dropdown Select') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <DropdownSelect
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'File Upload') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <FileUpload
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Email Input') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <EmailInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Number Input') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <NumberInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Image Upload') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <ImageUpload
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Multi_Select') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <MultiSelect
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Percentage Input') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <PercentageInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Password Input') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <PasswordInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Text Input') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <TextInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Radio Button') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <RadioButton
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Signature Pad') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <SignaturePad
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Rating') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <Rating
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Slider') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <Slider
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Text Area') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <TextArea
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Time Input') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <TimeInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Toggle Switch') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <ToggleSwitch
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'URL Input') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <UrlInput
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              if (field.field_type === 'Video Upload') {
                return (
                  <Controller
                    key={field.field_id}
                    name={fieldName as any}
                    control={control}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <VideoUpload
                        ref={(el) => {
                          fieldRefs.current[fieldName] = el;
                        }}
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={error?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                );
              }

              return (
                <div
                  key={field.field_id}
                  className="p-4 bg-yellow-50 border border-yellow-200 rounded"
                >
                  <p className="text-sm text-yellow-800">
                    Field type "{field.field_type}" not yet implemented
                  </p>
                </div>
              );
            })}
          </div>
        ))}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>
          <button
            type="button"
            onClick={() => refetch(true)}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </form>
    </div>
  );
};

export default EndUserFormPage;
