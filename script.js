// 新闻数据存储
let newsData = [];

// DOM元素
const newsGrid = document.getElementById('newsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const subscribeForm = document.getElementById('subscribeForm');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadNewsFromAPI();
    setupEventListeners();
    setupSmoothScrolling();
});

// 从API加载新闻
async function loadNewsFromAPI() {
    try {
        const response = await fetch('/api/news');
        if (!response.ok) {
            throw new Error('网络响应错误');
        }
        
        const data = await response.json();
        newsData = data.news || [];
        
        // 为新闻添加分类（基于来源）
        newsData.forEach(news => {
            news.category = getCategoryFromSource(news.source);
        });
        
        displayNews('all');
    } catch (error) {
        console.error('加载新闻失败:', error);
        // 如果API失败，显示错误信息
        newsGrid.innerHTML = `
            <div class="news-error">
                <p>暂时无法加载新闻，请稍后再试</p>
                <button onclick="loadNewsFromAPI()" class="btn btn-primary">重新加载</button>
            </div>
        `;
    }
}

// 根据新闻来源确定分类
function getCategoryFromSource(source) {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('tech') || sourceLower.includes('venture')) {
        return 'tech';
    } else if (sourceLower.includes('industry') || sourceLower.includes('business')) {
        return 'industry';
    } else {
        return 'research';
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 新闻过滤
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // 更新按钮状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应新闻
            displayNews(category);
        });
    });

    // 订阅表单
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', handleSubscribe);
    }

    // 移动端导航
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }

    // 滚动时导航栏效果
    window.addEventListener('scroll', handleScroll);
}

// 显示新闻
function displayNews(category) {
    const filteredNews = category === 'all' 
        ? newsData 
        : newsData.filter(news => news.category === category);

    if (filteredNews.length === 0) {
        newsGrid.innerHTML = `
            <div class="news-empty">
                <p>暂无相关新闻</p>
            </div>
        `;
        return;
    }

    newsGrid.innerHTML = filteredNews.map(news => `
        <article class="news-card" data-category="${news.category}">
            <div class="meta">
                <span class="category">${getCategoryName(news.category)}</span>
                <span class="source">${news.source}</span>
                <span class="date">${formatDate(news.published_at)}</span>
            </div>
            <h3>${news.title}</h3>
            <p>${news.description}</p>
            <a href="${news.link}" target="_blank" class="read-more">阅读原文</a>
        </article>
    `).join('');
}

// 获取分类名称
function getCategoryName(category) {
    const categories = {
        'tech': '技术动态',
        'industry': '行业资讯',
        'research': '研究前沿'
    };
    return categories[category] || category;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return '今天';
    } else if (diffDays === 2) {
        return '昨天';
    } else if (diffDays <= 7) {
        return `${diffDays - 1}天前`;
    } else {
        return date.toLocaleDateString('zh-CN');
    }
}

// 处理订阅
function handleSubscribe(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (email) {
        alert('订阅成功！我们会定期为您发送最新的AI资讯。');
        e.target.reset();
    } else {
        alert('请输入有效的邮箱地址');
    }
}

// 移动端菜单切换
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
}

// 处理滚动
function handleScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
}

// 平滑滚动
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 添加移动端导航样式
const mobileNavStyles = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 70px;
            left: 0;
            width: 100%;
            background: white;
            flex-direction: column;
            padding: 2rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
        }
        
        .nav-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;

// 添加样式到页面
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileNavStyles;
document.head.appendChild(styleSheet);

// 懒加载图片（如果有的话）
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// 性能优化：防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 优化滚动处理
const debouncedScrollHandler = debounce(handleScroll, 10);
window.addEventListener('scroll', debouncedScrollHandler);

// 页面加载完成后的初始化
window.addEventListener('load', function() {
    setupLazyLoading();
    
    // 添加页面加载动画
    document.body.classList.add('loaded');
    
    // 预加载关键资源
    preloadCriticalResources();
});

// 预加载关键资源
function preloadCriticalResources() {
    // 这里可以添加关键资源的预加载逻辑
    console.log('关键资源预加载完成');
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
    // 这里可以添加错误上报逻辑
});

// 性能监控
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('页面加载时间:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
} 