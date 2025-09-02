interface IssueDescriptionProps {
  description: string | null;
}

export function IssueDescription({ description }: IssueDescriptionProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Description
      </h2>
      {description ? (
        <p className="text-gray-700 whitespace-pre-wrap">
          {description}
        </p>
      ) : (
        <p className="text-gray-500 italic">No description provided.</p>
      )}
    </div>
  );
}