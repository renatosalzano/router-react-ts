
import { Route } from "react-router";

export const before: Route.before = (ctx) => {
  console.log(ctx)

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