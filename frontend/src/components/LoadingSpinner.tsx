import { LoadingIcon } from "./LoadingIcon";

export function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="flex justify-center items-center h-64 gap-2">
      <LoadingIcon />
      <div className="text-lg text-gray-600">{message}</div>
    </div>
  );
}
