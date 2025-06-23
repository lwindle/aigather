# AI Gather - 智能AI咨询平台

一个现代化的AI技术资讯网站，提供最新的人工智能新闻、深度分析和工具推荐。

## 功能特点

- 🎨 现代化响应式设计
- 📱 移动端友好
- 🔍 SEO优化
- ⚡ 快速加载
- 📊 新闻分类过滤
- 📧 邮件订阅功能

## 技术栈

- HTML5
- CSS3 (现代特性 + 响应式设计)
- JavaScript (ES6+)
- Go (静态文件服务器)

## 本地开发

### 前置要求

- Go 1.19+

### 运行步骤

1. 克隆项目
```bash
git clone <repository-url>
cd aigather
```

2. 启动开发服务器
```bash
go run main.go
```

3. 访问网站
打开浏览器访问 `http://localhost:8080`

## 部署指南

### 1. 注册域名
推荐使用以下域名注册商：
- 阿里云万网
- 腾讯云
- 华为云
- GoDaddy

建议域名：`aigather.com` 或 `ai-gather.com`

### 2. 购买服务器
推荐配置：
- **云服务器**：阿里云/腾讯云/华为云
- **配置**：2核4G内存，40GB SSD
- **系统**：Ubuntu 20.04 LTS
- **带宽**：5Mbps

### 3. 服务器部署

#### 3.1 连接服务器
```bash
ssh root@your-server-ip
```

#### 3.2 安装必要软件
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Go
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# 安装Nginx
sudo apt install nginx -y
```

#### 3.3 部署应用
```bash
# 创建应用目录
mkdir -p /var/www/aigather
cd /var/www/aigather

# 上传项目文件（使用scp或git）
# scp -r ./* root@your-server-ip:/var/www/aigather/

# 编译Go应用
go build -o aigather main.go

# 创建systemd服务
sudo tee /etc/systemd/system/aigather.service << EOF
[Unit]
Description=AI Gather Web Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/aigather
ExecStart=/var/www/aigather/aigather
Restart=always
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable aigather
sudo systemctl start aigather
```

#### 3.4 配置Nginx
```bash
sudo tee /etc/nginx/sites-available/aigather << EOF
server {
    listen 80;
    server_name aigather.com www.aigather.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 静态文件缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用站点
sudo ln -s /etc/nginx/sites-available/aigather /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 3.5 配置SSL证书
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书
sudo certbot --nginx -d aigather.com -d www.aigather.com
```

### 4. SEO优化

#### 4.1 提交Google Search Console
1. 访问 [Google Search Console](https://search.google.com/search-console)
2. 添加网站属性
3. 验证域名所有权
4. 提交sitemap.xml

#### 4.2 提交百度站长平台
1. 访问 [百度站长平台](https://ziyuan.baidu.com/)
2. 添加网站
3. 验证域名
4. 提交sitemap

### 5. 监控和维护

#### 5.1 日志监控
```bash
# 查看应用日志
sudo journalctl -u aigather -f

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### 5.2 性能监控
```bash
# 安装htop
sudo apt install htop -y

# 监控系统资源
htop
```

## 文件结构

```
aigather/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # JavaScript功能
├── main.go             # Go服务器
├── sitemap.xml         # SEO站点地图
├── robots.txt          # 搜索引擎爬虫配置
├── go.mod              # Go模块文件
└── README.md           # 项目说明
```

## 自定义配置

### 修改网站信息
编辑 `index.html` 中的以下内容：
- 网站标题和描述
- 联系信息
- 社交媒体链接

### 添加新闻内容
在 `script.js` 中的 `newsData` 数组添加新闻条目。

### 修改样式
编辑 `styles.css` 文件自定义颜色、字体等样式。

## 故障排除

### 常见问题

1. **网站无法访问**
   - 检查防火墙设置
   - 确认端口8080开放
   - 检查服务状态：`sudo systemctl status aigather`

2. **SSL证书问题**
   - 重新申请证书：`sudo certbot renew`
   - 检查证书状态：`sudo certbot certificates`

3. **性能问题**
   - 启用Nginx缓存
   - 压缩静态文件
   - 使用CDN加速

## 贡献指南

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License

## 联系方式

- 邮箱：contact@aigather.com
- 微信：aigather_official 