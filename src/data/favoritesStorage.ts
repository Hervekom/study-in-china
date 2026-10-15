const FAVORITE_UNIVERSITIES_KEY = 'chinastudy_fav_universities';
const FAVORITE_PROGRAMS_KEY = 'chinastudy_fav_programs';
const COMPARE_UNIVERSITIES_KEY = 'chinastudy_compare_universities';

export const favoritesStorage = {
  // Universities Favorites
  getFavoriteUniversities(): string[] {
    try {
      const raw = localStorage.getItem(FAVORITE_UNIVERSITIES_KEY);
      return raw ? JSON.parse(raw) : ['inst-beijing-01', 'inst-hangzhou-01'];
    } catch {
      return [];
    }
  },

  toggleFavoriteUniversity(uniId: string): boolean {
    const list = this.getFavoriteUniversities();
    const exists = list.includes(uniId);
    let updated: string[];
    if (exists) {
      updated = list.filter(id => id !== uniId);
    } else {
      updated = [...list, uniId];
    }
    localStorage.setItem(FAVORITE_UNIVERSITIES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('chinastudy_favorites_updated'));
    return !exists;
  },

  isUniversityFavorite(uniId: string): boolean {
    return this.getFavoriteUniversities().includes(uniId);
  },

  // Programs Favorites
  getFavoritePrograms(): string[] {
    try {
      const raw = localStorage.getItem(FAVORITE_PROGRAMS_KEY);
      return raw ? JSON.parse(raw) : ['prog-1', 'prog-3'];
    } catch {
      return [];
    }
  },

  toggleFavoriteProgram(progId: string): boolean {
    const list = this.getFavoritePrograms();
    const exists = list.includes(progId);
    let updated: string[];
    if (exists) {
      updated = list.filter(id => id !== progId);
    } else {
      updated = [...list, progId];
    }
    localStorage.setItem(FAVORITE_PROGRAMS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('chinastudy_favorites_updated'));
    return !exists;
  },

  isProgramFavorite(progId: string): boolean {
    return this.getFavoritePrograms().includes(progId);
  },

  // Comparison Selection (max 3 programs)
  getComparedPrograms(): string[] {
    try {
      const raw = localStorage.getItem('chinastudy_compare_programs');
      return raw ? JSON.parse(raw) : ['prog-cs-bachelor-01', 'prog-ai-master-01', 'prog-mba-01'];
    } catch {
      return ['prog-cs-bachelor-01', 'prog-ai-master-01', 'prog-mba-01'];
    }
  },

  addToProgramComparison(progId: string): { success: boolean; message: string } {
    const list = this.getComparedPrograms();
    if (list.includes(progId)) {
      return { success: false, message: 'Program is already in comparison list.' };
    }
    if (list.length >= 3) {
      return { success: false, message: 'You can compare up to 3 programs at a time.' };
    }
    const updated = [...list, progId];
    localStorage.setItem('chinastudy_compare_programs', JSON.stringify(updated));
    window.dispatchEvent(new Event('chinastudy_comparison_updated'));
    return { success: true, message: 'Added to program comparison matrix.' };
  },

  removeFromProgramComparison(progId: string): void {
    const list = this.getComparedPrograms();
    const updated = list.filter(id => id !== progId);
    localStorage.setItem('chinastudy_compare_programs', JSON.stringify(updated));
    window.dispatchEvent(new Event('chinastudy_comparison_updated'));
  },

  clearProgramComparison(): void {
    localStorage.setItem('chinastudy_compare_programs', JSON.stringify([]));
    window.dispatchEvent(new Event('chinastudy_comparison_updated'));
  },

  // Backward compatibility methods without university branding
  getComparedUniversities(): string[] {
    return this.getComparedPrograms();
  },

  addToComparison(id: string): { success: boolean; message: string } {
    return this.addToProgramComparison(id);
  },

  removeFromComparison(id: string): void {
    this.removeFromProgramComparison(id);
  },

  clearComparison(): void {
    this.clearProgramComparison();
  },
};
