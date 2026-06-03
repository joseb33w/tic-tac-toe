export default function Modal({ children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="card modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
