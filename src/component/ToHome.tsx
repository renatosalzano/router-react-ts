import { navigate } from "react-router";

function ToHomeBtn() {

  function onclick() {
    navigate('/');
  }

  return (
    <button onClick={onclick}>Go to Home</button>
  )
}

export default ToHomeBtn;