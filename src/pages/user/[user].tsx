import { useParams } from "react-router";


function UserPage() {

  const { slug } = useParams();

  console.log(slug)

  return (
    <div>
      <span>user: <strong>{slug[0] || 'anonymous'}</strong></span>
    </div>
  )
};

export default UserPage;