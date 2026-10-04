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
  const problems = useStore(state => state.problems || []);
  const solvedProblems = useStore(state => state.solvedProblems || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
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
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesTag = tagFilter === 'All' || p.tags.includes(tagFilter);
    
    return matchesSearch && matchesCategory && matchesTag;
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
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">Tất cả dạng bài</option>
              <option value="Cơ bản">Cơ bản</option>
              <option value="Toán học">Toán học</option>
              <option value="Quy hoạch động">Quy hoạch động</option>
              <option value="Đệ quy">Đệ quy</option>
              <option value="Cấu trúc dữ liệu">Cấu trúc dữ liệu</option>
              <option value="Khác">Khác</option>
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
              <th>Dạng bài</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.map((problem) => {
              const isSolved = solvedProblems.includes(problem.id);
              return (
              <tr key={problem.id}>
                <td style={{ color: isSolved ? '#10b981' : 'inherit', fontWeight: isSolved ? 'bold' : 'normal' }}>
                  {isSolved ? '✓ Đã giải' : '-'}
                </td>
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
                <td style={{ color: 'var(--text-muted)' }}>{problem.solvedCount + (isSolved ? 1 : 0)}</td>
                <td>
                  <span className="tag" style={{ background: 'var(--surface-hover)', fontSize: '0.85rem' }}>
                    {problem.category || 'Khác'}
                  </span>
                </td>
              </tr>
              );
            })}
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
