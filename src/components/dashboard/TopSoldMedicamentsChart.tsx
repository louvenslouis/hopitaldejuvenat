import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TopSoldMedicament {
  name: string;
  quantity: number;
}

interface TopSoldMedicamentsChartProps {
  data: TopSoldMedicament[];
}

const TopSoldMedicamentsChart: React.FC<TopSoldMedicamentsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="quantity" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopSoldMedicamentsChart;
