import React from 'react';

const Requisition: React.FC = () => {
  return (
    <div>
      <h1>Réquisition</h1>
      <div className="requisition-embed">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLScS-zgDUi7p81V52aVWxcOdktG8DY4EyF___GTgebnIcVOEKA/viewform?embedded=true"
          title="Formulaire de réquisition"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
        >
          Chargement…
        </iframe>
      </div>
    </div>
  );
};

export default Requisition;
