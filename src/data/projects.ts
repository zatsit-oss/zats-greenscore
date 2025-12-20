export interface Project {
	id: string;
	name: string;
	description: string;
	score: number;
	status: 'Active' | 'Completed' | 'Archived';
	lastUpdated: string;
}

export const projects: Project[] = [
	{
		id: '1',
		name: 'Eco-Friendly Office Initiative',
		description: 'Reducing carbon footprint by implementing solar panels and waste recycling programs in the main HQ.',
		score: 85,
		status: 'Active',
		lastUpdated: '2023-10-25'
	},
	{
		id: '2',
		name: 'Sustainable Supply Chain',
		description: 'Auditing suppliers for fair trade practices and carbon neutral shipping methods.',
		score: 62,
		status: 'Active',
		lastUpdated: '2023-10-20'
	},
	{
		id: '3',
		name: 'Green Data Center',
		description: 'Migrating legacy servers to renewable energy powered data centers.',
		score: 94,
		status: 'Completed',
		lastUpdated: '2023-09-15'
	},
	{
		id: '4',
		name: 'Urban Garden Project',
		description: 'Community garden setup on the rooftop for local food production.',
		score: 78,
		status: 'Archived',
		lastUpdated: '2023-08-01'
	}
];
