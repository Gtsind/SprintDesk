import { useState, useEffect, useCallback } from "react";
import {
  getLabels,
  getIssueLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  addLabelToIssue,
  removeLabelFromIssue,
} from "../services/api";
import { extractErrorMessage } from "../utils/errorHandling";
import type { Label, LabelCreate, LabelUpdate } from "../types";

interface UseLabelsProps {
  issueId: number;
  onError?: (message: string) => void;
}

export function useLabels({ issueId, onError }: UseLabelsProps) {
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [issueLabels, setIssueLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all labels and issue labels
  const fetchLabels = useCallback(async () => {
    try {
      setIsLoading(true);
      const [labels, issueLabelsList] = await Promise.all([
        getLabels(),
        getIssueLabels(issueId),
      ]);
      setAllLabels(labels);
      setIssueLabels(issueLabelsList);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err) || "Failed to load labels";
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [issueId, onError]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  // Create new label
  const handleCreateLabel = async (labelData: LabelCreate) => {
    try {
      const newLabel = await createLabel(labelData);
      setAllLabels((prev) => [...prev, newLabel]);
      return newLabel;
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err) || "Failed to create label";
      onError?.(errorMessage);
      throw err;
    }
  };

  // Update existing label
  const handleUpdateLabel = async (labelId: number, labelData: LabelUpdate) => {
    try {
      const updatedLabel = await updateLabel(labelId, labelData);
      setAllLabels((prev) =>
        prev.map((label) => (label.id === labelId ? updatedLabel : label))
      );
      setIssueLabels((prev) =>
        prev.map((label) => (label.id === labelId ? updatedLabel : label))
      );
      return updatedLabel;
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err) || "Failed to update label";
      onError?.(errorMessage);
      throw err;
    }
  };

  // Delete label entirely
  const handleDeleteLabel = async (labelId: number) => {
    try {
      await deleteLabel(labelId);
      setAllLabels((prev) => prev.filter((label) => label.id !== labelId));
      setIssueLabels((prev) => prev.filter((label) => label.id !== labelId));
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err) || "Failed to delete label";
      onError?.(errorMessage);
      throw err;
    }
  };

  // Add label to issue
  const handleAddLabelToIssue = async (labelId: number, labelObject?: Label) => {
    const label = labelObject || allLabels.find((l) => l.id === labelId);
    if (!label) return;

    try {
      await addLabelToIssue(issueId, labelId);
      setIssueLabels((prev) => {
        // Avoid duplicates
        if (prev.some((l) => l.id === labelId)) return prev;
        return [...prev, label];
      });
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err) || "Failed to add label to issue";
      onError?.(errorMessage);
      throw err;
    }
  };

  // Remove label from issue
  const handleRemoveLabelFromIssue = async (labelId: number) => {
    try {
      await removeLabelFromIssue(issueId, labelId);
      setIssueLabels((prev) => prev.filter((label) => label.id !== labelId));
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err) || "Failed to remove label from issue";
      onError?.(errorMessage);
      throw err;
    }
  };

  // Get available labels (not yet added to issue)
  const availableLabels = allLabels.filter(
    (label) => !issueLabels.some((issueLabel) => issueLabel.id === label.id)
  );

  return {
    // State
    allLabels,
    issueLabels,
    availableLabels,
    isLoading,

    // Actions
    handleCreateLabel,
    handleUpdateLabel,
    handleDeleteLabel,
    handleAddLabelToIssue,
    handleRemoveLabelFromIssue,
    refetchLabels: fetchLabels,
  };
}
