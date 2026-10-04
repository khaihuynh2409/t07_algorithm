import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export const Home = () => {
  return (
    <div className="animate-fade-in">
      <section className="hero">
        <div className="container">
          <h1 className="gradient-text">Nền tảng luyện tập dành cho học viên T07</h1>
          <p>
            Tham gia nền tảng giải thuật hàng đầu. Luyện tập với hàng trăm thử thách,
            thi đấu trong các kỳ thi hàng tuần và chuẩn bị tốt nhất cho các buổi phỏng vấn kỹ thuật.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/problems" className="btn btn-primary">
              Bắt đầu làm bài <Zap size={18} />
            </Link>
            <Link to="/problems" className="btn btn-secondary">
              Khám phá bài tập
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
