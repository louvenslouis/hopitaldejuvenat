import React from 'react';
import { Table } from 'react-bootstrap';
import type { Sortie } from '../../types';

interface RecentSortiesTableProps {
  data: Sortie[];
}

const RecentSortiesTable: React.FC<RecentSortiesTableProps> = ({ data }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Date</th>
          <th>Service</th>
          <th>Employé</th>
          <th>Patient</th>
        </tr>
      </thead>
      <tbody>
        {data.map((sortie) => (
          <tr key={sortie.id ?? sortie.date_sortie}>
            <td>{new Date(sortie.date_sortie).toLocaleDateString()}</td>
            <td>{sortie.service}</td>
            <td>{sortie.employe}</td>
            <td>{sortie.patient_nom}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default RecentSortiesTable;
