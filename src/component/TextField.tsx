import { ChangeEvent, FC, useEffect, useState } from "react"

type Props = {
  id: string;
  label?: string;
  value: string;
  onChange: (id: string, value: string) => void;
}

const TextField: FC<Props> = ({ id, label, value, onChange }) => {

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

  return (
    <label htmlFor={id}>
      {label}
      <input type="text" id={id} value={state} onChange={onchange} />
    </label>
  )
}


export { TextField };