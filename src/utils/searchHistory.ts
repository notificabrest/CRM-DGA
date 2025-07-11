// Search history management for phone searches

export interface SearchHistoryEntry {
  id: string;
  phoneNumber: string;
  searchDate: Date;
  clientFound: boolean;
  clientName?: string;
  dealsCount: number;
  url: string;
}

class SearchHistoryManager {
  private static instance: SearchHistoryManager;
  private storageKey = 'crm-search-history';

  static getInstance(): SearchHistoryManager {
    if (!SearchHistoryManager.instance) {
      SearchHistoryManager.instance = new SearchHistoryManager();
    }
    return SearchHistoryManager.instance;
  }

  // Add a new search to history
  addSearch(entry: Omit<SearchHistoryEntry, 'id' | 'searchDate'>): void {
    try {
      const history = this.getHistory();
      const newEntry: SearchHistoryEntry = {
        ...entry,
        id: `search-${Date.now()}`,
        searchDate: new Date()
      };

      // Remove duplicate searches for the same phone number
      const filteredHistory = history.filter(h => h.phoneNumber !== entry.phoneNumber);
      
      // Add new entry at the beginning
      const updatedHistory = [newEntry, ...filteredHistory].slice(0, 50); // Keep only last 50 searches
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  // Get all search history
  getHistory(): SearchHistoryEntry[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((entry: any) => ({
          ...entry,
          searchDate: new Date(entry.searchDate)
        }));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
    return [];
  }

  // Get recent searches (last 10)
  getRecentSearches(): SearchHistoryEntry[] {
    return this.getHistory().slice(0, 10);
  }

  // Get searches by date range
  getSearchesByDateRange(startDate: Date, endDate: Date): SearchHistoryEntry[] {
    return this.getHistory().filter(entry => 
      entry.searchDate >= startDate && entry.searchDate <= endDate
    );
  }

  // Get successful searches (where client was found)
  getSuccessfulSearches(): SearchHistoryEntry[] {
    return this.getHistory().filter(entry => entry.clientFound);
  }

  // Clear all history
  clearHistory(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  // Remove specific search
  removeSearch(id: string): void {
    try {
      const history = this.getHistory();
      const updatedHistory = history.filter(entry => entry.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error removing search:', error);
    }
  }

  // Get search statistics
  getSearchStats() {
    const history = this.getHistory();
    const successful = history.filter(h => h.clientFound);
    
    return {
      totalSearches: history.length,
      successfulSearches: successful.length,
      successRate: history.length > 0 ? (successful.length / history.length) * 100 : 0,
      totalDealsFound: history.reduce((sum, h) => sum + h.dealsCount, 0),
      mostSearchedNumbers: this.getMostSearchedNumbers(),
      recentActivity: this.getRecentActivity()
    };
  }

  private getMostSearchedNumbers(): { phoneNumber: string; count: number; lastSearch: Date }[] {
    const history = this.getHistory();
    const phoneCount: { [key: string]: { count: number; lastSearch: Date } } = {};
    
    history.forEach(entry => {
      if (phoneCount[entry.phoneNumber]) {
        phoneCount[entry.phoneNumber].count++;
        if (entry.searchDate > phoneCount[entry.phoneNumber].lastSearch) {
          phoneCount[entry.phoneNumber].lastSearch = entry.searchDate;
        }
      } else {
        phoneCount[entry.phoneNumber] = {
          count: 1,
          lastSearch: entry.searchDate
        };
      }
    });

    return Object.entries(phoneCount)
      .map(([phoneNumber, data]) => ({
        phoneNumber,
        count: data.count,
        lastSearch: data.lastSearch
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getRecentActivity(): { date: string; searches: number }[] {
    const history = this.getHistory();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      searches: history.filter(h => 
        h.searchDate.toISOString().split('T')[0] === date
      ).length
    }));
  }
}

export const searchHistoryManager = SearchHistoryManager.getInstance();
export default searchHistoryManager;