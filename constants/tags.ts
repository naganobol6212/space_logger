export interface Tag {
    id: string;
    label: string;
    icon?: string; // material-symbols name
    color?: string; // tailwind text color class
}

export const TAGS: Tag[] = [
    { id: 'ruby', label: 'Ruby', icon: 'diamond', color: 'text-red-500' },
    { id: 'rails', label: 'Ruby on Rails', icon: 'layers', color: 'text-red-600' },
    { id: 'reading', label: '読書', icon: 'menu_book', color: 'text-blue-500' },
    { id: 'javascript', label: 'JavaScript', icon: 'javascript', color: 'text-yellow-400' },
    { id: 'typescript', label: 'TypeScript', icon: 'code', color: 'text-blue-400' },
    { id: 'react', label: 'React', icon: 'code_blocks', color: 'text-cyan-400' },
    { id: 'nextjs', label: 'Next.js', icon: 'web', color: 'text-slate-800 dark:text-white' },
    { id: 'docker', label: 'Docker', icon: 'deployed_code', color: 'text-blue-500' },
    { id: 'aws', label: 'AWS', icon: 'cloud', color: 'text-orange-500' },
    { id: 'python', label: 'Python', icon: 'terminal', color: 'text-yellow-300' },
    { id: 'go', label: 'Go', icon: 'code', color: 'text-cyan-300' },
    { id: 'sql', label: 'SQL', icon: 'database', color: 'text-indigo-400' },
    { id: 'git', label: 'Git', icon: 'commit', color: 'text-orange-600' },
    { id: 'htmlcss', label: 'HTML/CSS', icon: 'style', color: 'text-pink-500' },
];

export const getTagById = (id: string): Tag => {
    const found = TAGS.find(t => t.id === id);
    if (found) return found;

    // Custom tag fallback
    // If id looks like a generated ID or just plain text, return it as label
    return {
        id,
        label: id, // label fallback
        icon: 'label',
        color: 'text-slate-500'
    };
};
