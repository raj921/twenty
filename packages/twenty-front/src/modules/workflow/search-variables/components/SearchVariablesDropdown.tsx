import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownButtonContainer } from '@/ui/layout/dropdown/components/StyledDropdownButtonContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { SearchVariablesDropdownStepItem } from '@/workflow/search-variables/components/SearchVariablesDropdownStepItem';
import SearchVariablesDropdownStepSubItem from '@/workflow/search-variables/components/SearchVariablesDropdownStepSubItem';
import { SEARCH_VARIABLES_DROPDOWN_ID } from '@/workflow/search-variables/constants/SearchVariablesDropdownId';
import { useAvailableVariablesInWorkflowStep } from '@/workflow/search-variables/hooks/useAvailableVariablesInWorkflowStep';
import { StepOutputSchema } from '@/workflow/search-variables/types/StepOutputSchema';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Editor } from '@tiptap/react';
import { useState } from 'react';
import { IconVariablePlus } from 'twenty-ui';

const StyledDropdownVariableButtonContainer = styled(
  StyledDropdownButtonContainer,
)<{ transparentBackground?: boolean }>`
  background-color: ${({ theme, transparentBackground }) =>
    transparentBackground
      ? 'transparent'
      : theme.background.transparent.lighter};
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const SearchVariablesDropdown = ({
  inputId,
  editor,
}: {
  inputId: string;
  editor: Editor;
}) => {
  const theme = useTheme();

  const dropdownId = `${SEARCH_VARIABLES_DROPDOWN_ID}-${inputId}`;
  const { isDropdownOpen } = useDropdown(dropdownId);
  const availableVariablesInWorkflowStep =
    useAvailableVariablesInWorkflowStep();

  const [selectedStep, setSelectedStep] = useState<
    StepOutputSchema | undefined
  >(undefined);

  const insertVariableTag = (variable: string) => {
    editor.commands.insertVariableTag(variable);
  };

  const handleStepSelect = (stepId: string) => {
    setSelectedStep(
      availableVariablesInWorkflowStep.find((step) => step.id === stepId),
    );
  };

  const handleSubItemSelect = (subItem: string) => {
    insertVariableTag(subItem);
  };

  const handleBack = () => {
    setSelectedStep(undefined);
  };

  return (
    <Dropdown
      dropdownMenuWidth={320}
      dropdownId={dropdownId}
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
      clickableComponent={
        <StyledDropdownVariableButtonContainer
          isUnfolded={isDropdownOpen}
          transparentBackground
        >
          <IconVariablePlus size={theme.icon.size.sm} />
        </StyledDropdownVariableButtonContainer>
      }
      dropdownComponents={
        <DropdownMenuItemsContainer hasMaxHeight>
          {selectedStep ? (
            <SearchVariablesDropdownStepSubItem
              step={selectedStep}
              onSelect={handleSubItemSelect}
              onBack={handleBack}
            />
          ) : (
            <SearchVariablesDropdownStepItem
              steps={availableVariablesInWorkflowStep}
              onSelect={handleStepSelect}
            />
          )}
        </DropdownMenuItemsContainer>
      }
      dropdownPlacement="bottom-end"
      dropdownOffset={{ x: 0, y: 4 }}
    />
  );
};

export default SearchVariablesDropdown;
