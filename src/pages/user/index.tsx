import { useParams } from "react-router";

function User() {

  const params = useParams();

  console.log(params)

  return (
    <div>
      user page
    </div>
  )
}

export default User;