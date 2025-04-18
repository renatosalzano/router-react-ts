import { navigate } from "react-router";
import { Breadcrumb } from "../../component/Breadcrumb";
import Modal from "../../component/Modal";

function News() {


  return (
    <div>
      <Breadcrumb />

      <Modal show>
        <dialog>
          <button onClick={() => {
            navigate('/');
          }}>to home</button>
        </dialog>
      </Modal>
    </div>
  )

}

export default News;