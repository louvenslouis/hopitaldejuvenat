import React from 'react';
import { Card } from 'react-bootstrap';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => {
  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Card.Title as="h5">{title}</Card.Title>
            <Card.Text className="display-4">{value}</Card.Text>
          </div>
          <div className="kpi-icon">
            <span className="material-icons">{icon}</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default KpiCard;