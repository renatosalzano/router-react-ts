
import { Route, navigate } from "react-router";

export const before: Route.before = async (ctx) => {
  // console.log(ctx)
  const promise = new Promise((res) => setTimeout(res, 3000));

  await promise;
  navigate('/')

  return true;
}

function User() {

  return (
    <div>
      user page
    </div>
  )
}

export default User;