import { Mail, Briefcase } from "lucide-react";
import type { EditableUserField } from "../components/user/EditableField";
import type { User } from "../types";

export function createUserFieldsConfig(canEditBasic: boolean, canEditRole: boolean): EditableUserField[] {
  return [
    {
      key: 'firstname',
      label: 'First Name',
      required: true,
      canEdit: canEditBasic,
      getValue: (user: User) => user.firstname,
    },
    {
      key: 'lastname',
      label: 'Last Name',
      required: true,
      canEdit: canEditBasic,
      getValue: (user: User) => user.lastname,
    },
    {
      key: 'username',
      label: 'Username',
      required: true,
      canEdit: canEditBasic,
      displayPrefix: '@',
      getValue: (user: User) => user.username,
    },
    {
      key: 'email',
      label: 'Email',
      required: true,
      canEdit: canEditBasic,
      inputType: 'email',
      icon: () => <Mail className="inline h-4 w-4 mr-1" />,
      getValue: (user: User) => user.email,
    },
    {
      key: 'title',
      label: 'Title',
      required: false,
      canEdit: canEditRole,
      placeholder: 'Enter title',
      fallbackText: 'No title set',
      icon: () => <Briefcase className="inline h-4 w-4 mr-1" />,
      getValue: (user: User) => user.title,
    },
  ];
}