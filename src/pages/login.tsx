import { useRef } from "react";
import { TextField } from "../component/TextField";


function Login() {

  const data = useRef({
    name: '',
    pass: ''
  }).current;

  function onChange(id: string, value: string) {

  }

  return (
    <div className="login-page">
      <TextField id="name" label="nome" value={data.name} onChange={onChange} />
    </div>
  )
}

export default Login;