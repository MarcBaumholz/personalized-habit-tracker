interface CategoryData {
  name: string;
  value: number;
}

interface ProgressData {
  id: string;
  name: string;
  completions: number;
}

interface WeeklyData {
  name: string;
  completions: number;
}

export const calculateStreak = (completions: any[]) => {
  if (completions.length === 0) return 0;
  
  const sortedCompletions = completions
    .map(c => new Date(c.completed_date).toISOString().split('T')[0])
    .sort();
  
  let currentStreak = 1;
  let maxStreak = 1;
  
  for (let i = 1; i < sortedCompletions.length; i++) {
    const prevDate = new Date(sortedCompletions[i - 1]);
    const currDate = new Date(sortedCompletions[i]);
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

export const calculateSuccessRate = (completions: any[], habits: any[]) => {
  if (habits.length === 0) return 0;
  return Math.round((completions.length / (habits.length * 30)) * 100);
};

export const calculateActiveDays = (completions: any[]) => {
  const uniqueDays = new Set(completions.map(c => c.completed_date));
  return uniqueDays.size;
};

export const calculateTotalProgress = (completions: any[], habits: any[]) => {
  if (habits.length === 0) return 0;
  return Math.round((completions.length / (habits.length * 66)) * 100);
};

export const generateWeeklyData = (completions: any[]): WeeklyData[] => {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  return days.map(day => ({
    name: day,
    completions: completions.filter(c => 
      new Date(c.completed_date).toLocaleDateString('de-DE', { weekday: 'short' }) === day
    ).length
  }));
};

export const generateCategoryData = (habits: any[], completions: any[]): CategoryData[] => {
  const categories: Record<string, CategoryData> = {};
  
  habits.forEach(habit => {
    const category = habit.category;
    if (!categories[category]) {
      categories[category] = {
        name: category,
        value: completions.filter(c => c.habit_id === habit.id).length
      };
    } else {
      categories[category].value += completions.filter(c => c.habit_id === habit.id).length;
    }
  });

  return Object.values(categories);
};

export const generateProgressData = (completions: any[], habits: any[]): ProgressData[] => {
  const habitProgress: Record<string, ProgressData> = {};
  
  habits.forEach(habit => {
    habitProgress[habit.id] = {
      id: habit.id,
      name: habit.name,
      completions: completions.filter(c => c.habit_id === habit.id).length
    };
  });

  return Object.values(habitProgress);
};

export const generateYearlyActivity = (completions: any[]) => {
  const year = new Date().getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  const days = [];
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      count: completions.filter(c => c.completed_date === dateStr).length
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  return weeks;
};