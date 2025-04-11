import { useParams } from "react-router";


function UserPage() {

  const params = useParams();

  console.log(params)

  return (
    <div>
      <span>user: <strong>{params?.slug?.[0] || 'anonymous'}</strong></span>
    </div>
  )
};

export default UserPage;