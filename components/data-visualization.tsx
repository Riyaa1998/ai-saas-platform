'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface DataVisualizationProps {
  data: any[];
}

export function DataVisualization({ data }: DataVisualizationProps) {
  // If no data or empty array, show a message
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Upload and process a file to see visualizations
      </div>
    );
  }

  // Get numeric columns for visualization
  const firstRow = data[0];
  const numericColumns = firstRow
    ? Object.entries(firstRow).filter(([_, value]) => typeof value === 'number').map(([key]) => key)
    : [];

  // Prepare data for charts
  const barData = data.slice(0, 7); // Show first 7 rows for bar chart
  
  // Prepare pie chart data (example: sum of first numeric column by category)
  const categoryColumn = Object.keys(firstRow || {}).find(
    key => typeof firstRow[key] === 'string' && data.every(row => typeof row[key] === 'string')
  );
  
  let pieData = [];
  if (categoryColumn && numericColumns.length > 0) {
    const categoryMap = new Map();
    data.forEach(item => {
      const category = item[categoryColumn];
      const value = Number(item[numericColumns[0]]) || 0;
      categoryMap.set(category, (categoryMap.get(category) || 0) + value);
    });
    pieData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  } else {
    // Fallback if no suitable category column is found
    pieData = numericColumns.map((key, index) => ({
      name: key,
      value: data.reduce((sum, row) => sum + (Number(row[key]) || 0), 0)
    }));
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow h-[400px]">
          <h3 className="text-lg font-semibold mb-4">Data Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={Object.keys(firstRow || {})[0] || 'name'} />
                <YAxis />
                <Tooltip />
                <Legend />
                {numericColumns.slice(0, 3).map((key, index) => (
                  <Bar 
                    key={key}
                    dataKey={key}
                    fill={COLORS[index % COLORS.length]}
                    name={key}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow h-[400px]">
          <h3 className="text-lg font-semibold mb-4">Data Composition</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Value']} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional visualizations can be added here */}
      {numericColumns.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={Object.keys(firstRow || {})[0] || 'category'} />
                <YAxis />
                <Tooltip />
                <Legend />
                {numericColumns.slice(0, 5).map((key, index) => (
                  <Bar 
                    key={key}
                    dataKey={key}
                    fill={COLORS[(index + 2) % COLORS.length]}
                    name={key}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
