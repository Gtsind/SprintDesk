import { useState } from "react";
import { Plus, Tag } from "lucide-react";
import { useLabels } from "../../hooks/useLabels";
import { LabelBadge } from "./LabelBadge";
import { LabelMenu } from "./LabelMenu";

interface LabelsSectionProps {
  issueId: number;
  onError?: (message: string) => void;
}

export function LabelsSection({ issueId, onError }: LabelsSectionProps) {
  const [showMenu, setShowMenu] = useState(false);

  const {
    allLabels,
    issueLabels,
    availableLabels,
    isLoading,
    handleCreateLabel,
    handleUpdateLabel,
    handleDeleteLabel,
    handleAddLabelToIssue,
    handleRemoveLabelFromIssue,
  } = useLabels({ issueId, onError });

  const handleCreateAndAdd = async (name: string, colorIndex: number) => {
    try {
      const newLabel = await handleCreateLabel({
        name,
        color_hash: colorIndex,
      });
      // Add to issue labels immediately, passing the label object to avoid state timing issues
      await handleAddLabelToIssue(newLabel.id, newLabel);
      setShowMenu(false);
    } catch (error) {
      // Error already handled in useLabels hook
    }
  };

  if (isLoading) {
    return (
      <div>
        <dt className="ml-3.5 text-sm font-medium text-gray-500">Labels</dt>
        <dd className="mt-1">
          <div className="text-sm text-gray-400">Loading...</div>
        </dd>
      </div>
    );
  }

  return (
    <div>
      <dt className="ml-3.5 text-sm font-medium text-gray-500">Labels</dt>
      <dd className="mt-1">
        {/* Existing Labels */}
        {issueLabels.length > 0 && (
          <div className="ml-3.5 mb-2 flex flex-wrap gap-1 relative">
            {issueLabels.map((label) => (
              <LabelBadge
                key={label.id}
                label={label}
                onUpdate={(labelId, name) =>
                  handleUpdateLabel(labelId, { name })
                }
                onRemoveFromIssue={handleRemoveLabelFromIssue}
                onDelete={handleDeleteLabel}
              />
            ))}
            {/* Add More Button */}
            <button
              onClick={() => setShowMenu(true)}
              className="inline-flex items-center px-2 py-1 text-xs text-gray-400 hover:text-gray-600 focus:outline-none"
              title="Add label"
            >
              <Plus className="h-3 w-3" />
            </button>
            {/* Menu for when labels exist */}
            <LabelMenu
              availableLabels={availableLabels}
              allLabels={allLabels}
              onAddLabel={handleAddLabelToIssue}
              onCreateLabel={handleCreateAndAdd}
              isOpen={showMenu}
              onClose={() => setShowMenu(false)}
            />
          </div>
        )}

        {/* No Labels - Show Add Button */}
        {issueLabels.length === 0 && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(true)}
              className="w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-gray-50 focus:outline-none flex items-center gap-2"
            >
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Add label</span>
            </button>
            {/* Menu for when no labels exist */}
            <LabelMenu
              availableLabels={availableLabels}
              allLabels={allLabels}
              onAddLabel={handleAddLabelToIssue}
              onCreateLabel={handleCreateAndAdd}
              isOpen={showMenu}
              onClose={() => setShowMenu(false)}
            />
          </div>
        )}
      </dd>
    </div>
  );
}
