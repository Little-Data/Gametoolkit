import React, { useState, useRef, useEffect } from "react";
import { authors } from "../data/authors";
import "./AuthorCard.css";

// 作者卡片项组件
const AuthorCardItem = ({ author }) => {
  const platformNames = {
    github: 'GitHub',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    instagram: 'Instagram',
    medium: 'Medium',
    blog: '博客',
    email: '邮箱',
    weibo: '微博',
    bilibili :'哔哩哔哩'
  };

  return (
    <div className="author-card">
      <div className="author-avatar-container">
        <img 
          src={author.image_url} 
          alt={`${author.name}的头像`} 
          className="author-avatar" 
        />
      </div>
      <div className="author-info">
        <h3 className="author-name">
          {author.url ? (
            <a href={author.url} target="_blank" rel="noopener noreferrer">
              {author.name}
            </a>
          ) : (
            author.name
          )}
        </h3>
        {author.title && (
          <p className="author-title">{author.title}</p>
        )}
        {author.bio && (
          <p className="author-bio">{author.bio}</p>
        )}
        {author.social && (
          <div className="author-social">
            {Object.entries(author.social).map(([platform, url]) => (
              <a 
                key={platform} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label={`${author.name}的${platformNames[platform] || platform}账号`}
              >
                {platformNames[platform] || platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AuthorCard({ authors: propAuthors }) {
  const [expanded, setExpanded] = useState(false);
  const hiddenAuthorsRef = useRef(null);
  
  // 移除动态判断滚动的逻辑，改为始终使用固定高度
  
  // 展开/折叠状态处理
  useEffect(() => {
    if (hiddenAuthorsRef.current) {
      if (expanded) {
        hiddenAuthorsRef.current.classList.add('expanded');
      } else {
        hiddenAuthorsRef.current.classList.remove('expanded');
      }
    }
  }, [expanded]);

  if (!propAuthors) return null;
  
  const authorKeys = Array.isArray(propAuthors) ? propAuthors : [propAuthors];
  const validAuthors = authorKeys
    .filter(authorKey => authors[authorKey])
    .map(authorKey => authors[authorKey]);

  if (validAuthors.length === 0) return null;

  // 拆分显示的作者和隐藏的作者
  const visibleAuthors = validAuthors.slice(0, 2);
  const hiddenAuthors = validAuthors.slice(2);
  const hiddenCount = hiddenAuthors.length;

  return (
    <div className="author-cards-container">
      {/* 始终显示的前2位作者 */}
      {visibleAuthors.map((author, index) => (
        <AuthorCardItem 
          key={`visible-${index}-${author.name}`} 
          author={author} 
        />
      ))}

      {/* 隐藏的作者（带滚动功能） */}
      {hiddenCount > 0 && (
        <div 
          ref={hiddenAuthorsRef}
          className={`hidden-authors-container ${expanded ? 'expanded' : ''}`}
          style={{ 
            // 固定展开后的最大高度为500px，始终显示滚动条（如果内容超出）
            maxHeight: expanded ? '500px' : '0px',
            overflow: expanded ? 'auto' : 'hidden'
          }}
        >
          <div className="hidden-authors-content">
            {hiddenAuthors.map((author, index) => (
              <AuthorCardItem 
                key={`hidden-${index}-${author.name}`} 
                author={author} 
                style={{ transitionDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 折叠/展开按钮 */}
      {hiddenCount > 0 && (
        <button
          className="toggle-authors-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "收起" : `显示余下${hiddenCount}个作者`}
        </button>
      )}
    </div>
  );
}
