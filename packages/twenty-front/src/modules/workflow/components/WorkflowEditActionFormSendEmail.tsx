import { GMAIL_SEND_SCOPE } from '@/accounts/constants/GmailSendScope';
import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { Select, SelectOption } from '@/ui/input/components/Select';
import { WorkflowEditGenericFormBase } from '@/workflow/components/WorkflowEditGenericFormBase';
import { VariableTagInput } from '@/workflow/search-variables/components/VariableTagInput';
import { workflowIdState } from '@/workflow/states/workflowIdState';
import { WorkflowSendEmailAction } from '@/workflow/types/Workflow';
import { useTheme } from '@emotion/react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { IconMail, IconPlus, isDefined } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

type WorkflowEditActionFormSendEmailProps = {
  action: WorkflowSendEmailAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowSendEmailAction) => void;
      };
};

type SendEmailFormData = {
  connectedAccountId: string;
  email: string;
  subject: string;
  body: string;
};

export const WorkflowEditActionFormSendEmail = ({
  action,
  actionOptions,
}: WorkflowEditActionFormSendEmailProps) => {
  const theme = useTheme();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { triggerApisOAuth } = useTriggerApisOAuth();

  const workflowId = useRecoilValue(workflowIdState);
  const redirectUrl = `/object/workflow/${workflowId}`;

  const form = useForm<SendEmailFormData>({
    defaultValues: {
      connectedAccountId: '',
      email: '',
      subject: '',
      body: '',
    },
    disabled: actionOptions.readonly,
  });

  const checkConnectedAccountScopes = async (
    connectedAccountId: string | null,
  ) => {
    const connectedAccount = accounts.find(
      (account) => account.id === connectedAccountId,
    );
    if (!isDefined(connectedAccount)) {
      return;
    }
    const scopes = connectedAccount.scopes;
    if (
      !isDefined(scopes) ||
      !isDefined(scopes.find((scope) => scope === GMAIL_SEND_SCOPE))
    ) {
      await triggerApisOAuth('google', {
        redirectLocation: redirectUrl,
        loginHint: connectedAccount.handle,
      });
    }
  };

  useEffect(() => {
    form.setValue(
      'connectedAccountId',
      action.settings.input.connectedAccountId ?? '',
    );
    form.setValue('email', action.settings.input.email ?? '');
    form.setValue('subject', action.settings.input.subject ?? '');
    form.setValue('body', action.settings.input.body ?? '');
  }, [action.settings, form]);

  const saveAction = useDebouncedCallback(
    async (formData: SendEmailFormData, checkScopes = false) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: {
            connectedAccountId: formData.connectedAccountId,
            email: formData.email,
            subject: formData.subject,
            body: formData.body,
          },
        },
      });

      if (checkScopes === true) {
        await checkConnectedAccountScopes(formData.connectedAccountId);
      }
    },
    1_000,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const handleSave = (checkScopes = false) =>
    form.handleSubmit((formData: SendEmailFormData) =>
      saveAction(formData, checkScopes),
    )();

  const filter: { or: object[] } = {
    or: [
      {
        accountOwnerId: {
          eq: currentWorkspaceMember?.id,
        },
      },
    ],
  };

  if (
    isDefined(action.settings.input.connectedAccountId) &&
    action.settings.input.connectedAccountId !== ''
  ) {
    filter.or.push({
      id: {
        eq: action.settings.input.connectedAccountId,
      },
    });
  }

  const { records: accounts, loading } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: 'connectedAccount',
    filter,
  });

  let emptyOption: SelectOption<string | null> = { label: 'None', value: null };
  const connectedAccountOptions: SelectOption<string | null>[] = [];

  accounts.forEach((account) => {
    const selectOption = {
      label: account.handle,
      value: account.id,
    };
    if (account.accountOwnerId === currentWorkspaceMember?.id) {
      connectedAccountOptions.push(selectOption);
    } else {
      // This handle the case when the current connected account does not belong to the currentWorkspaceMember
      // In that case, current connected account email is displayed, but cannot be selected
      emptyOption = selectOption;
    }
  });

  return (
    !loading && (
      <WorkflowEditGenericFormBase
        HeaderIcon={<IconMail color={theme.color.blue} />}
        headerTitle="Send Email"
        headerType="Email"
      >
        <Controller
          name="connectedAccountId"
          control={form.control}
          render={({ field }) => (
            <Select
              dropdownId="select-connected-account-id"
              label="Account"
              fullWidth
              emptyOption={emptyOption}
              value={field.value}
              options={connectedAccountOptions}
              callToActionButton={{
                onClick: () =>
                  triggerApisOAuth('google', { redirectLocation: redirectUrl }),
                Icon: IconPlus,
                text: 'Add account',
              }}
              onChange={(connectedAccountId) => {
                field.onChange(connectedAccountId);
                handleSave(true);
              }}
            />
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field }) => (
            <VariableTagInput
              inputId="email-input"
              label="Email"
              placeholder="Enter receiver email (use {{variable}} for dynamic content)"
              value={field.value}
              onChange={(email) => {
                field.onChange(email);
                handleSave();
              }}
            />
          )}
        />
        <Controller
          name="subject"
          control={form.control}
          render={({ field }) => (
            <VariableTagInput
              inputId="email-subject-input"
              label="Subject"
              placeholder="Enter email subject (use {{variable}} for dynamic content)"
              value={field.value}
              onChange={(email) => {
                field.onChange(email);
                handleSave();
              }}
            />
          )}
        />
        <Controller
          name="body"
          control={form.control}
          render={({ field }) => (
            <VariableTagInput
              inputId="email-body-input"
              label="Body"
              placeholder="Enter email body (use {{variable}} for dynamic content)"
              value={field.value}
              onChange={(email) => {
                field.onChange(email);
                handleSave();
              }}
              multiline
            />
          )}
        />
      </WorkflowEditGenericFormBase>
    )
  );
};
