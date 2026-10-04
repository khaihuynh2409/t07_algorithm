export interface ProblemExample {
  input: string;
  output: string;
  explain?: string;
}

export interface Problem {
  id: string;
  title: string;
  category: string;
  solvedCount: number;
  tags: string[];
  description?: string;
  examples?: ProblemExample[];
  constraints?: string[];
}

export const mockProblems: Problem[] = [
  // Starter / Demo Problems
  {
    id: 'HW-001',
    title: 'Hello World',
    difficulty: 'Easy',
    solvedCount: 9,
    tags: ['Nhập/Xuất', 'Cơ bản', 'Khởi đầu'],
    description: 'Hãy viết một chương trình in ra màn hình dòng chữ `Hello, World!`.',
    examples: [
      { input: '(không có đầu vào)', output: 'Hello, World!', explain: 'Chương trình chỉ cần in đúng chuỗi "Hello, World!" ra stdout.' }
    ],
    constraints: ['Không có đầu vào.', 'Đầu ra phải chính xác là: Hello, World!']
  },
  {
    id: 'ADD-001',
    title: 'Cộng hai số nguyên',
    difficulty: 'Easy',
    solvedCount: 7,
    tags: ['Toán học', 'Cơ bản', 'Nhập/Xuất'],
    description: 'Cho hai số nguyên `a` và `b`, hãy tính và in ra tổng của chúng.',
    examples: [
      { input: '3 5', output: '8', explain: '3 + 5 = 8' },
      { input: '-10 20', output: '10', explain: '-10 + 20 = 10' },
      { input: '0 0', output: '0', explain: '0 + 0 = 0' }
    ],
    constraints: [
      '-10^9 <= a, b <= 10^9',
      'Đầu vào gồm một dòng duy nhất chứa hai số nguyên a và b cách nhau bởi khoảng trắng.',
      'In ra một số nguyên duy nhất là tổng a + b.'
    ]
  },

  // LuyenCode Examples
  { id: 'LC-01', title: 'Tìm số lớn nhất (CB01)', difficulty: 'Easy', solvedCount: 45210, tags: ['LuyenCode', 'Cơ bản', 'Toán học'] },
  { id: 'LC-02', title: 'Tính tổng dãy số nguyên (CB02)', difficulty: 'Easy', solvedCount: 38100, tags: ['LuyenCode', 'Cơ bản', 'Vòng lặp'] },
  { id: 'LC-03', title: 'Kiểm tra số nguyên tố (KT01)', difficulty: 'Medium', solvedCount: 25430, tags: ['LuyenCode', 'Toán học'] },
  { id: 'LC-04', title: 'Dãy Fibonacci (DP01)', difficulty: 'Medium', solvedCount: 18900, tags: ['LuyenCode', 'Quy hoạch động'] },

  // Codeforces Examples
  { id: 'CF-4A', title: 'Watermelon', difficulty: 'Easy', solvedCount: 154200, tags: ['Codeforces', 'Math', 'Brute Force'] },
  { id: 'CF-71A', title: 'Way Too Long Words', difficulty: 'Easy', solvedCount: 132400, tags: ['Codeforces', 'String'] },
  { id: 'CF-1A', title: 'Theatre Square', difficulty: 'Medium', solvedCount: 98500, tags: ['Codeforces', 'Math'] },
  { id: 'CF-158A', title: 'Next Round', difficulty: 'Easy', solvedCount: 112000, tags: ['Codeforces', 'Implementation'] },
  { id: 'CF-50A', title: 'Domino piling', difficulty: 'Medium', solvedCount: 89000, tags: ['Codeforces', 'Greedy', 'Math'] },
  { id: 'CF-1328A', title: 'Divisibility Problem', difficulty: 'Easy', solvedCount: 75000, tags: ['Codeforces', 'Math'] },
  { id: 'CF-189A', title: 'Cut Ribbon', difficulty: 'Medium', solvedCount: 42000, tags: ['Codeforces', 'Dynamic Programming'] },
  { id: 'CF-1520F1', title: 'Guess the K-th Zero (Easy version)', difficulty: 'Hard', solvedCount: 15000, tags: ['Codeforces', 'Binary Search', 'Interactive'] },

  // Standard / Generic Examples
  { id: '1', title: 'Two Sum', difficulty: 'Easy', solvedCount: 15420, tags: ['Array', 'Hash Table'] },
  { id: '2', title: 'Add Two Numbers', difficulty: 'Medium', solvedCount: 10243, tags: ['Linked List', 'Math'] },
  { id: '3', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', solvedCount: 8932, tags: ['Hash Table', 'String'] },
  { id: '4', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', solvedCount: 4120, tags: ['Array', 'Binary Search'] },
];
