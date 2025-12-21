export interface Project {
	id: string;
	name: string;
	description: string;
	score: number;
	status: 'Active' | 'Completed' | 'Archived';
	lastUpdated: string;
}