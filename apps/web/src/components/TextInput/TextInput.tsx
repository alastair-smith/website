import type { ChangeEventHandler } from 'react';

const TextInput = ({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  className: string;
}) => (
  <input
    className={`focus:outline-none focus:ring-4 ring-violet-500 w-full max-w-form border-4 border-rose-950 bg-rose-100 px-medium py-small rounded ${className}`}
    value={value}
    onChange={onChange}
  />
);

export default TextInput;
