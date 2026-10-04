import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useStore } from '../store/useStore';

const removeAccents = (str: string) => {
  return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

export const ProblemList = () => {
  const problems = useStore(state => state.problems);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    problems.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [problems]);

  const filteredProblems = problems.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const searchNoAccents = removeAccents(searchLower);
    
    const titleLower = p.title.toLowerCase();
    const titleNoAccents = removeAccents(titleLower);
    const idLower = p.id.toLowerCase();
    
    const matchesSearch = 
      idLower.includes(searchLower) ||
      titleLower.includes(searchLower) ||
      titleNoAccents.includes(searchNoAccents) ||
      p.tags.some(tag => removeAccents(tag.toLowerCase()).includes(searchNoAccents));
    const matchesDifficulty = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchesTag = tagFilter === 'All' || p.tags.includes(tagFilter);
    
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div className="problems-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Danh sách bài tập</h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select 
              value={tagFilter} 
              onChange={(e) => setTagFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">Tất cả dạng bài</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <select 
              value={difficultyFilter} 
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">Tất cả độ khó</option>
              <option value="Easy">Dễ (Easy)</option>
              <option value="Medium">Trung bình (Medium)</option>
              <option value="Hard">Khó (Hard)</option>
            </select>
            <div className="search-bar" style={{ width: '250px' }}>
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Trạng thái</th>
              <th>Tiêu đề</th>
              <th>Số người đã giải</th>
              <th>Độ khó</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.map((problem) => (
              <tr key={problem.id}>
                <td>-</td>
                <td>
                  <Link to={`/problems/${problem.id}`} style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                    {problem.id}. {problem.title}
                  </Link>
                  <div style={{ marginTop: '0.25rem' }}>
                    {problem.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{problem.solvedCount}</td>
                <td>
                  <span className={`difficulty-badge diff-${problem.difficulty.toLowerCase()}`}>
                    {problem.difficulty}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProblems.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Không tìm thấy bài tập nào phù hợp với bộ lọc.
          </div>
        )}
      </div>
    </div>
  );
};
