import { authService } from './authService';

//const API_BASE_URL = 'https://wolfy.r2v.ch';
const API_BASE_URL = 'http://localhost:3000';

export const exportService = {
  async exportPersons(eventTypes: string[]): Promise<void> {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const currentDate = new Date().toLocaleDateString('de-DE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const eventNamesStr = eventTypes.join(' & ');
    const filename = `Personen stand ${currentDate} ${eventNamesStr}`;
    
    const response = await fetch(`${API_BASE_URL}/export/excel/persons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Collection': 'easyway',
        'Authorization': `Bearer ${token}`,
        'Filename': filename
      },
      body: JSON.stringify({
        eventNames: eventTypes
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new Error('Authentication failed');
      }
      throw new Error('Export failed');
    }

    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async exportStatistics(eventNames: string[], years: number[]): Promise<void> {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const currentDate = new Date().toLocaleDateString('de-DE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const yearsStr = years.join(', ');
    const eventNamesStr = eventNames.join(' & ');
    const filename = `Statistik ${currentDate} (${yearsStr}) ${eventNamesStr}`;
    
    const response = await fetch(`${API_BASE_URL}/export/excel/statistic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Collection': 'easyway',
        'Authorization': `Bearer ${token}`,
        'Filename': filename
      },
      body: JSON.stringify({
        eventNames: eventNames,
        years: years.map(y => y.toString())
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new Error('Authentication failed');
      }
      throw new Error('Export failed');
    }

    // Download the file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
