'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type PasswordRequirement = {
  label: string;
  regex: RegExp;
};

const requirements: PasswordRequirement[] = [
  { label: '8 or more characters', regex: /.{8,}/ },
  { label: 'One uppercase letter', regex: /[A-Z]/ },
  { label: 'One lowercase letter', regex: /[a-z]/ },
  { label: 'One number and one symbol', regex: /(?=.*\d)(?=.*[\W])/ }, // ✅ FIXED: requires BOTH number AND symbol
];

type PasswordStrengthProps = {
  password?: string;
};

export const PasswordStrength = ({ password = '' }: PasswordStrengthProps) => {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-2">
      {requirements.map((req) => {
        const isValid = req.regex.test(password);
        return (
          <li
            key={req.label}
            className={cn(
              "flex items-center text-sm transition-colors",
              isValid ? 'text-green-600' : 'text-muted-foreground'
            )}
          >
            {isValid ? (
              <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </li>
        );
      })}
    </ul>
  );
};