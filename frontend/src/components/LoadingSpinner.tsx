export function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-gray-600">{message}</div>
    </div>
  );
}
