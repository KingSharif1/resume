'use client';

import { DefaultEditor } from './DefaultEditor';
import { ConfigurableEditor, FieldConfig } from './ConfigurableEditor';
import { getSectionConfig, mapSectionType } from '@/lib/section-configs';

interface SectionEditorFactoryProps {
  sectionType: string;
  initialValue: any;
  onChange: (value: any) => void;
  allowCustomFields?: boolean;
}

export function SectionEditorFactory({
  sectionType,
  initialValue,
  onChange,
  allowCustomFields = false
}: SectionEditorFactoryProps) {
  // Check if this is a custom section type
  const isCustomType = sectionType.startsWith('custom_');
  
  // Get field configuration
  let fieldConfig;
  if (isCustomType && typeof initialValue === 'object' && initialValue?.structuredData?.fields) {
    // Use the custom fields defined in structuredData
    fieldConfig = initialValue.structuredData.fields;
  } else {
    // Map the section type to a standard type
    const standardType = mapSectionType(sectionType);
    // Get the appropriate field configuration
    fieldConfig = getSectionConfig(standardType);
  }
  
  // For simple text content (string), use the default editor
  if (typeof initialValue === 'string' && !fieldConfig.some((field: FieldConfig) => field.required)) {
    return (
      <DefaultEditor
        initialValue={initialValue}
        onChange={onChange}
        sectionType={isCustomType ? sectionType : mapSectionType(sectionType)}
      />
    );
  }
  
  // Convert string to initial values object if needed
  let initialValues = {};
  if (typeof initialValue === 'object' && initialValue !== null) {
    // If this is a custom section with structuredData, extract the values
    if (isCustomType && initialValue.structuredData?.values) {
      initialValues = initialValue.structuredData.values;
    } else {
      initialValues = initialValue;
    }
  } else if (typeof initialValue === 'string' && initialValue.trim()) {
    // Try to parse JSON if it's a JSON string
    try {
      const parsed = JSON.parse(initialValue);
      if (typeof parsed === 'object' && parsed !== null) {
        initialValues = parsed;
      } else {
        // If not valid JSON object, use as content
        initialValues = { content: initialValue };
      }
    } catch {
      // If not valid JSON, use as content
      initialValues = { content: initialValue };
    }
  }
  
  // Use the configurable editor for all structured content
  return (
    <ConfigurableEditor
      sectionType={isCustomType ? sectionType : mapSectionType(sectionType)}
      fields={fieldConfig}
      initialValues={initialValues}
      onChange={(values) => {
        // For custom sections, wrap the values in structuredData
        if (isCustomType) {
          onChange({
            structuredData: {
              fields: fieldConfig,
              values: values
            }
          });
        } else {
          onChange(values);
        }
      }}
      allowCustomFields={allowCustomFields}
    />
  );
}
