// Excel export utility for lobby data
export function exportToExcel(data: Record<string, unknown>[], filename: string = 'lobby-data') {
	// Convert data to CSV format (simple Excel-compatible export)
	const headers = Object.keys(data[0] || {});
	const csvContent = [
		headers.join(','),
		...data.map(row => 
			headers.map(header => {
				const value = row[header];
				// Escape commas and quotes in values
				if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
					return `"${value.replace(/"/g, '""')}"`;
				}
				return value || '';
			}).join(',')
		)
	].join('\n');

	// Create and trigger download
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	
	if (link.download !== undefined) {
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', `${filename}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}