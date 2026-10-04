import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Problem, ProblemExample } from '../mockData';

// --- Starter code theo từng bài và ngôn ngữ ---
function getStarterCode(problemId: string | undefined, lang: string): string {
  const starters: Record<string, Record<string, string>> = {
    'HW-001': {
      python: `# Hello World\nprint("Hello, World!")`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
    },
    'ADD-001': {
      python: `# Cộng hai số nguyên\na, b = map(int, input().split())\nprint(a + b)`,
      cpp: `#include <iostream>\nusing namespace std;\nint main() {\n    long long a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}`,
    },
  };

  if (problemId && starters[problemId]?.[lang]) return starters[problemId][lang];
  if (lang === 'cpp') {
    return `#include <iostream>\nusing namespace std;\nint main() {\n    // Viết mã nguồn của bạn ở đây\n    return 0;\n}`;
  }
  return `# Viết mã nguồn của bạn ở đây\ndef solve():\n    pass\n`;
}

// Parse JSON field: API trả về object (đã parse), mockData có thể là array hoặc string
function parseJsonField<T>(field: unknown): T | undefined {
  if (field === undefined || field === null) return undefined;
  if (typeof field === 'string') {
    try { return JSON.parse(field) as T; } catch { return undefined; }
  }
  return field as T;
}

export const ProblemDetail = () => {
  const problems = useStore(state => state.problems);
  const { id } = useParams();
  const problem = (problems.find(p => p.id === id) || problems[0]) as Problem | undefined;
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(() => getStarterCode(problem?.id, 'python'));

  // Reset starter code khi chuyển bài
  useEffect(() => {
    setCode(getStarterCode(problem?.id, language));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?.id]);

  if (!problem) {
    return (
      <div className="container animate-fade-in" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Không tìm thấy bài toán. Vui lòng chọn bài từ danh sách.
      </div>
    );
  }

  const examples = parseJsonField<ProblemExample[]>(problem.examples);
  const constraints = parseJsonField<string[]>(problem.constraints);
  const description = (problem.description as string | undefined) ?? 'Mô tả bài toán đang được cập nhật...';

  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Đang chạy code...');
    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language === 'python' ? 'python' : 'cpp',
          version: language === 'python' ? '3.10.0' : '10.2.0',
          files: [{ content: code }]
        })
      });
      const data = await response.json();
      if (data.run && data.run.output) {
        setOutput(data.run.output);
      } else {
        setOutput(data.message || 'Lỗi khi chạy code!');
      }
    } catch (error) {
      setOutput('Lỗi kết nối đến máy chủ chấm bài!');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="workspace animate-fade-in">
      <div className="problem-description prose">
        <h2>{problem.id}. {problem.title}</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <span className={`difficulty-badge diff-${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Số người đã giải được: {problem.solvedCount}
          </span>
        </div>

        <p>{description}</p>

        {examples && examples.length > 0 && (
          <>
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Ví dụ</h3>
            {examples.map((ex, idx) => (
              <div className="example-box" key={idx}>
                <p><strong>Đầu vào:</strong> {ex.input}</p>
                <p><strong>Đầu ra:</strong> {ex.output}</p>
                {ex.explain && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Giải thích: {ex.explain}
                  </p>
                )}
              </div>
            ))}
          </>
        )}

        {constraints && constraints.length > 0 && (
          <>
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Giới hạn:</h3>
            <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginBottom: '2rem' }}>
              {constraints.map((c, idx) => (
                <li key={idx}><code>{c}</code></li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="editor-section" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="editor-header">
          <select
            className="lang-select"
            value={language}
            onChange={(e) => {
              const lang = e.target.value;
              setLanguage(lang);
              setCode(getStarterCode(problem.id, lang));
              setOutput('');
            }}
          >
            <option value="python">Python 3</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <div className="editor-container" style={{ flex: 1 }}>
          <Editor
            height="100%"
            language={language}
            theme="light"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              padding: { top: 16 },
            }}
          />
        </div>

        {/* Console Kết quả chạy */}
        <div style={{ padding: '1rem', background: '#1e1e1e', color: '#fff', borderTop: '1px solid #333', minHeight: '120px', maxHeight: '200px', overflowY: 'auto' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>Terminal Output</div>
          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {output || 'Chưa có kết quả...'}
          </pre>
        </div>

        <div className="editor-footer">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={runCode} disabled={isRunning}>
              <Play size={16} /> {isRunning ? 'Đang chạy...' : 'Chạy thử'}
            </button>
            <button className="btn btn-success">
              <Send size={16} /> Nộp bài
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
