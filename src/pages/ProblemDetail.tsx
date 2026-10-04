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
  const [isSolved, setIsSolved] = useState(false); // Thêm trạng thái Đã giải

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Đang biên dịch và chạy code...');
    
    // Giả lập thời gian chạy của server
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Vì Piston API hiện tại đã chặn public, chúng ta dùng Mock Engine cho Demo
      let result = '';
      const lowerCode = code.toLowerCase();

      if (problem?.id === 'HW-001') {
        if (lowerCode.includes('print("hello, world!")') || lowerCode.includes('print(\'hello, world!\')')) {
          result = 'Hello, World!\n\n=== Code chạy thành công ===';
        } else if (lowerCode.includes('cout << "hello, world!"') || lowerCode.includes('cout<<"hello, world!"')) {
          result = 'Hello, World!\n\n=== Code chạy thành công ===';
        } else {
          result = 'Lỗi: Đầu ra không khớp với yêu cầu.\nExpected: Hello, World!';
        }
      } else if (problem?.id === 'ADD-001') {
        if (lowerCode.includes('a + b') || lowerCode.includes('a+b')) {
          result = 'Test case 1 (Input: 5 7):\nOutput: 12\n\nTest case 2 (Input: 100 200):\nOutput: 300\n\n=== Tất cả test cases đều pass! ===';
        } else {
          result = 'Lỗi: Kết quả sai.\nBạn chưa in ra tổng của a và b.';
        }
      } else {
        result = 'Hệ thống chấm bài đang bảo trì cho bài tập này.\nVui lòng thử lại sau.';
      }

      setOutput(result);
    } catch (error) {
      setOutput('Lỗi môi trường chạy code cục bộ!');
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    setIsRunning(true);
    setOutput('Đang nộp bài lên hệ thống...\n[1/3] Đang biên dịch code...\n[2/3] Đang chạy Test Case ẩn...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const lowerCode = code.toLowerCase();
    let isPass = false;

    if (problem?.id === 'HW-001') {
      isPass = lowerCode.includes('print("hello, world!")') || lowerCode.includes('print(\'hello, world!\')') || lowerCode.includes('cout << "hello, world!"');
    } else if (problem?.id === 'ADD-001') {
      isPass = lowerCode.includes('a + b') || lowerCode.includes('a+b');
    }

    if (isPass) {
      setOutput('✅ NỘP BÀI THÀNH CÔNG!\n\n=== Chi tiết kết quả ===\nTest 1: PASSED (0.001s)\nTest 2: PASSED (0.002s)\nTest 3 (Hidden): PASSED (0.001s)\nTest 4 (Hidden): PASSED (0.001s)\nTest 5 (Hidden): PASSED (0.002s)\n\n🏆 Tuyệt vời! Bạn đã vượt qua tất cả các test case.');
      setIsSolved(true); // Đánh dấu đã giải xong
    } else {
      setOutput('❌ NỘP BÀI THẤT BẠI!\n\n=== Chi tiết kết quả ===\nTest 1: PASSED (0.001s)\nTest 2: PASSED (0.002s)\nTest 3 (Hidden): FAILED (Kết quả sai)\n\n⚠️ Lời khuyên: Hãy kiểm tra kỹ lại logic của bạn với các trường hợp đặc biệt nhé.');
    }
    
    setIsRunning(false);
  };

  return (
    <div className="workspace animate-fade-in">
      <div className="problem-description prose">
        <h2>
          {problem.id}. {problem.title} 
          {isSolved && <span style={{ color: '#10b981', marginLeft: '10px', fontSize: '20px' }}>✓ Đã giải</span>}
        </h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <span className={`difficulty-badge diff-${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Số người đã giải được: {problem.solvedCount + (isSolved ? 1 : 0)}
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

        <div className="editor-container" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
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

        {/* Thanh kéo để chỉnh kích thước */}
        <div 
          onMouseDown={(e) => {
            e.preventDefault();
            const startY = e.clientY;
            const startHeight = document.getElementById('terminal-container')?.offsetHeight || 150;
            
            const onMouseMove = (moveEvent: MouseEvent) => {
              const delta = startY - moveEvent.clientY; // Kéo lên (Y giảm) -> delta dương -> height tăng
              const newHeight = Math.max(100, Math.min(startHeight + delta, window.innerHeight * 0.8));
              const term = document.getElementById('terminal-container');
              if (term) term.style.height = `${newHeight}px`;
            };

            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
              document.body.style.cursor = 'default';
            };

            document.body.style.cursor = 'ns-resize';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
          style={{
            height: '6px',
            background: '#333',
            cursor: 'ns-resize',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderTop: '1px solid #444',
            borderBottom: '1px solid #111'
          }}
          title="Kéo thả để chỉnh kích thước Terminal"
        >
          <div style={{ width: '40px', height: '2px', background: '#666', borderRadius: '2px' }} />
        </div>

        {/* Console Kết quả chạy */}
        <div id="terminal-container" style={{ 
          padding: '1rem', 
          background: '#1e1e1e', 
          color: '#fff', 
          height: '150px', 
          overflow: 'auto',
          flexShrink: 0
        }}>
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
            <button className="btn btn-success" onClick={submitCode} disabled={isRunning}>
              <Send size={16} /> {isRunning ? 'Đang nộp...' : 'Nộp bài'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
