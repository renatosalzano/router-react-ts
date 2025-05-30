import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import "./TextField.scss";

type Props = {
  id: string;
  label?: string;
  value: string;
  error?: boolean;
  readonly?: boolean;
  onChange: (id: string, value: string) => void;
}

const TextField: FC<Props> = ({ id, label, value, error, readonly, onChange }) => {

  const [state, setState] = useState(value);

  function onchange(event: ChangeEvent<HTMLInputElement>) {
    const _value = event.target.value;
    setState(_value);
    onChange(id, _value)
  }

  useEffect(() => {
    if (state !== value) {
      setState(value);
    }
  }, [value]);


  const className = useMemo(() => {
    let base = 'text-field';
    if (error) base += ' error';
    if (readonly) base += ' readonly';
    return base;
  }, [error, readonly]);

  return (
    <label htmlFor={id} className={className}>
      {label}
      <input type="text" id={id} value={state} onChange={onchange} readOnly={readonly} />
    </label>
  )
}


export { TextField };