import { SyntheticEvent, useRef, useState } from "react";
import { TextField } from "../../component/TextField";
import ToHomeBtn from "../../component/ToHome";

type Data = {
  firstname: string
  lastname: string
  iban: string
}

function FormPage() {
  const [data, setData] = useState<Data | null>(null);

  function onSubmit(data: Data) {

    setData(() => ({ ...data }))
  }

  if (!data) {
    return <Form onSubmit={onSubmit} />
  }

  return (
    <div>
      <h2>Data Submitted</h2>
      <ToHomeBtn />
    </div>
  )

}

function Form({ onSubmit }: { onSubmit: (data: Data) => void }) {

  const [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState<{ [K in keyof Data]?: boolean }>({});

  const [submitDisabled, setSubmitDisabled] = useState(true);

  const data = useRef<Data>({
    firstname: '',
    lastname: '',
    iban: ''
  }).current;

  const inputProps = (id: keyof Data) => ({
    id,
    value: data[id],
    error: errors[id],
    readonly: confirm,
    onChange(id: string, value: string) {
      data[id as keyof Data] = value;
      // console.log(data)

      switch (id) {
        case 'firstname':
        case 'lastname':
          isValid(id, /^[a-zA-Z]*$/.test(value))
          break;
        case 'iban':
          isValid(id, /^IT[0-9]{2}[A-Z]{1}[0-9]{10}[A-z0-9]{12}$/.test(value))

      }

      setSubmitDisabled(!Object.values(data).every(d => d != ''))
    }
  });


  function isValid(id: keyof Data, valid: boolean) {
    valid = !valid;
    if (errors[id] !== valid) {
      setErrors(prev => ({ ...prev, [id]: valid }))
    }
  }


  function onsubmit(ev: SyntheticEvent<HTMLFormElement>) {
    ev.preventDefault();

    if (!confirm) {
      setConfirm(true);
    } else {
      onSubmit(data)
    }
  }


  function onCancel() {
    setConfirm(false);
  }

  return (
    <>
      <h2>{confirm ? 'Summary' : 'Complete the form'}</h2>
      <form
        className="form"
        onSubmit={onsubmit}>
        <div className="grid">
          <TextField
            label="nome"
            {...inputProps('firstname')} />
          <TextField
            label="cognome"
            {...inputProps('lastname')} />
          <TextField
            label="IBAN"
            {...inputProps('iban')} />
        </div>
        <br />
        <button
          type="submit"
          disabled={submitDisabled}>
          {confirm ? 'confirm' : 'submit'}
        </button>
        {confirm && (
          <button type="button" onClick={onCancel}>Cancel</button>
        )}
      </form>
    </>
  )
}

export default FormPage;