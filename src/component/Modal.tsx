import { FC, ReactNode, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  show?: boolean
  children: ReactNode
}


const ModalContainer: FC<{ children: ReactNode }> = ({ children }) => {

  return (
    <div id="modal-container">
      {children}
    </div>
  )
}


const ModalPortal: FC<{ children: ReactNode }> = ({ children }) => {

  const container = useRef(document.querySelector('#modal-root'));

  if (!container.current) {
    const node = document.createElement('div');
    node.id = 'modal-root';
    document.body.appendChild(node);
    container.current = node as Element;
  }

  return createPortal(children, container.current)
}

const Modal: FC<Props> = ({ show, children }) => {

  if (!show) return null;

  return (
    <ModalPortal>
      <ModalContainer>
        {children}
      </ModalContainer>
    </ModalPortal>
  )
}



export default Modal;