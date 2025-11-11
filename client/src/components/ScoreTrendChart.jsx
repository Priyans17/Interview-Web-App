import {
	LineChart,
	Line,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
				<p className="font-semibold text-gray-900">
					{data.interviewName}
				</p>
				<p className="text-sm text-gray-600">{data.date}</p>
				<p className="text-sm font-medium" style={{ color: '#2F5DFF' }}>
					Score: {data.score}%
				</p>
			</div>
		);
	}
	return null;
};

export default function ScoreTrendChart({
	chartData
}) {

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
			<div className="mb-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Score Trend
				</h3>

				</div>

			<div className="h-64">
				{chartData && chartData.length > 0 ? (
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							data={chartData}
							margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
							<YAxis
								domain={[0, 100]}
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#6b7280" }}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Line
								type="monotone"
								dataKey="score"
								stroke="#2F5DFF"
								strokeWidth={3}
								dot={{ fill: "#2F5DFF", strokeWidth: 2, r: 4 }}
								activeDot={{
									r: 6,
									stroke: "#2F5DFF",
									strokeWidth: 2,
									fill: "#ffffff",
								}}
							/>
						</LineChart>
					</ResponsiveContainer>
				) : (
					<div className="flex items-center justify-center h-full text-slate-500">
						No score data available
					</div>
				)}
			</div>
		</div>
	);
}
