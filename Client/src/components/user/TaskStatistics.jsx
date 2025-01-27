/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const pieColors = ["#8884d8", "#82ca9d", "#e47911", "#11cb5f", "#a47911"];

const TaskStatistics = ({ statistics }) => {
  const memoizedStatistics = useMemo(() => statistics || [], [statistics]);

  const NoDataMessage = ({ message }) => (
    <div className="flex items-center justify-center h-[200px] bg-gray-100 rounded-md">
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );

  const hasData = memoizedStatistics && memoizedStatistics.length > 0;

  return (
    <div className="bg-white shadow rounded-lg p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Task Statistics</h2>

      {/* Bar Chart */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Task Distribution</h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={memoizedStatistics}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoDataMessage message="No task distribution data available" />
        )}
      </div>

      {/* Pie Chart */}
      <div>
        <h3 className="text-md font-semibold mb-2">Task Status</h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={memoizedStatistics}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {memoizedStatistics.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <NoDataMessage message="No task status data available" />
        )}
      </div>
    </div>
  );
};

export default React.memo(TaskStatistics);
