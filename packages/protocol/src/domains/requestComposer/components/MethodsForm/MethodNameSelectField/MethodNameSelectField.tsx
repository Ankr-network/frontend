import { Field } from 'react-final-form';
import { t } from '@ankr.com/common';

import { MethodOption } from 'domains/requestComposer/types';

import { MethodsSelectField } from '../../MethodsSelect/MethodsSelectField';
import { useMethodNameSelectFieldStyles } from './MethodNameSelectFieldStyles';

interface MethodsSelectFieldProps {
  options: MethodOption[];
  getMethodDescription: (method?: MethodOption) => string | undefined;
}

export const MethodNameSelectField = ({
  getMethodDescription,
  options,
}: MethodsSelectFieldProps) => {
  const { classes } = useMethodNameSelectFieldStyles();

  return (
    <Field name="methodName">
      {fieldProps => (
        <MethodsSelectField<MethodOption>
          className={classes.methodsSelect}
          label={t('request-composer.form.methods-label')}
          placeholder={t('request-composer.form.methods-placeholder')}
          noOptionsText={t('request-composer.form.methods-no-options-text')}
          options={options}
          getOptionLabel={method => method.label}
          showExtra={getMethodDescription}
          {...fieldProps}
        />
      )}
    </Field>
  );
};
