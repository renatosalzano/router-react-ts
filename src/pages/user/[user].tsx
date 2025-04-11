import { useParams } from "react-router";

function UserPage() {

  const { slug } = useParams();

  return (
    <div>
      <span>user: <strong>{slug.user || 'anonymous'}</strong></span>
    </div>
  )
};

export default UserPage;