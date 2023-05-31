import { ChangeEventHandler } from 'react';

const TextInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) => <input value={value} onChange={onChange} />;

export default TextInput;
