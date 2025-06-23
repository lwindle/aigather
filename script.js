// 模拟AI新闻数据
const newsData = [
    {
        id: 1,
        title: "OpenAI发布GPT-5预览版，性能大幅提升",
        category: "tech",
        date: "2024-01-15",
        summary: "OpenAI今日发布了GPT-5的预览版本，新模型在推理能力、多模态理解和代码生成方面都有显著提升。"
    },
    {
        id: 2,
        title: "谷歌推出Gemini Ultra 2.0，挑战GPT-5地位",
        category: "tech",
        date: "2024-01-14",
        summary: "谷歌发布了Gemini Ultra 2.0版本，在多项AI基准测试中表现优异，与GPT-5形成直接竞争。"
    },
    {
        id: 3,
        title: "AI在医疗诊断领域取得重大突破",
        category: "industry",
        date: "2024-01-13",
        summary: "最新研究显示，AI辅助诊断系统在多种疾病检测中的准确率已超过人类专家平均水平。"
    },
    {
        id: 4,
        title: "Meta发布开源大语言模型Llama 3",
        category: "tech",
        date: "2024-01-12",
        summary: "Meta公司开源了Llama 3模型，为AI研究社区提供了强大的基础模型选择。"
    }
];

// DOM元素
const newsGrid = document.getElementById('newsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const subscribeForm = document.getElementById('subscribeForm');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    displayNews('all');
    setupEventListeners();
    setupSmoothScrolling();
});

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

    newsGrid.innerHTML = filteredNews.map(news => `
        <article class="news-card" data-category="${news.category}">
            <div class="meta">
                <span class="category">${getCategoryName(news.category)}</span>
                <span class="date">${formatDate(news.date)}</span>
            </div>
            <h3>${news.title}</h3>
            <p>${news.summary}</p>
            <a href="#" class="read-more">阅读更多</a>
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
    return date.toLocaleDateString('zh-CN');
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