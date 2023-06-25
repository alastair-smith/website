import { ChangeEventHandler } from 'react';

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
    className={`focus:outline-none focus:ring-4 ring-violet-500 w-full border-2 border-black px-medium py-small rounded ${className}`}
    value={value}
    onChange={onChange}
  />
);

export default TextInput;
