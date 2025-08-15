import React, { useState, useEffect } from 'react';
import { getDB } from '../../db';
import EditableMedicamentCard from '../../components/EditableMedicamentCard';
import { Form } from 'react-bootstrap';

const StockAdjustments: React.FC = () => {
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    const db = await getDB();
    const result = db.exec("SELECT id, nom FROM liste_medicaments ORDER BY nom ASC");
    if (result.length > 0) {
      setMedicaments(result[0].values);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMedicaments = medicaments.filter(m => 
    m[1].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Ajustement des Stocks</h1>
      <p>Modifiez directement la quantité en stock pour chaque médicament. Cliquez sur "Enregistrer" pour sauvegarder un ajustement.</p>
      
      <Form.Group className="mb-3">
        <Form.Control 
          type="text" 
          placeholder="Rechercher un médicament..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <div className="card-grid">
        {filteredMedicaments.map((med) => (
          <EditableMedicamentCard key={med[0]} medicament={med} />
        ))}
      </div>
    </div>
  );
};

export default StockAdjustments;
