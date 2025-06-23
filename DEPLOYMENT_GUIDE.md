# AI Gather 云服务器部署指南

## 第一步：购买云服务器

### 1.1 选择云服务商
推荐以下云服务商（按性价比排序）：
- **阿里云**：国内最大，稳定性好
- **腾讯云**：价格实惠，性能不错
- **华为云**：技术实力强，安全性高

### 1.2 服务器配置
```
操作系统：Ubuntu 20.04 LTS
CPU：2核
内存：4GB
硬盘：40GB SSD
带宽：5Mbps
价格：约50-100元/月
```

### 1.3 安全组配置
确保开放以下端口：
- **22端口**：SSH连接
- **80端口**：HTTP访问
- **443端口**：HTTPS访问

## 第二步：连接服务器

### 2.1 获取服务器信息
购买完成后，记录以下信息：
- 公网IP地址
- root密码或SSH密钥
- 服务器所在地域

### 2.2 SSH连接服务器
```bash
# 使用密码连接
ssh root@your-server-ip

# 使用密钥连接
ssh -i your-key.pem root@your-server-ip
```

## 第三步：服务器环境准备

### 3.1 更新系统
```bash
# 更新包列表
sudo apt update

# 升级系统
sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git vim htop
```

### 3.2 安装Go环境
```bash
# 下载Go
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz

# 解压到/usr/local
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz

# 配置环境变量
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# 验证安装
go version
```

### 3.3 安装Nginx
```bash
# 安装Nginx
sudo apt install nginx -y

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查状态
sudo systemctl status nginx
```

### 3.4 安装防火墙
```bash
# 安装UFW
sudo apt install ufw -y

# 配置防火墙规则
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw --force enable

# 查看状态
sudo ufw status
```

## 第四步：上传项目文件

### 4.1 方法一：使用SCP上传
```bash
# 在本地执行，上传项目文件
scp -r ./* root@your-server-ip:/var/www/aigather/
```

### 4.2 方法二：使用Git
```bash
# 在服务器上创建目录
sudo mkdir -p /var/www/aigather
cd /var/www/aigather

# 如果项目在Git仓库，直接克隆
git clone your-repository-url .

# 或者先上传到Git，再在服务器克隆
```

### 4.3 方法三：使用SFTP工具
- 使用FileZilla、WinSCP等工具
- 连接服务器后直接拖拽文件

## 第五步：部署应用

### 5.1 构建应用
```bash
# 进入项目目录
cd /var/www/aigather

# 构建Go应用
go build -o aigather main.go

# 给部署脚本执行权限
chmod +x deploy.sh
```

### 5.2 使用自动化部署脚本
```bash
# 运行部署脚本
./deploy.sh production
```

### 5.3 手动部署（如果脚本有问题）
```bash
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
RestartSec=5
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
EOF

# 配置Nginx
sudo tee /etc/nginx/sites-available/aigather << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用站点
sudo ln -sf /etc/nginx/sites-available/aigather /etc/nginx/sites-enabled/

# 测试Nginx配置
sudo nginx -t

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable aigather
sudo systemctl start aigather
sudo systemctl restart nginx
```

## 第六步：配置域名和SSL

### 6.1 域名解析
1. 在域名注册商后台添加A记录
2. 主机记录：@ 和 www
3. 记录值：你的服务器公网IP
4. TTL：600秒

### 6.2 安装SSL证书
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 申请SSL证书（替换为你的域名）
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

## 第七步：测试和监控

### 7.1 测试网站访问
```bash
# 测试本地访问
curl http://localhost:8080

# 测试公网访问
curl http://your-domain.com

# 测试HTTPS
curl https://your-domain.com
```

### 7.2 检查服务状态
```bash
# 检查应用服务
sudo systemctl status aigather

# 检查Nginx服务
sudo systemctl status nginx

# 查看应用日志
sudo journalctl -u aigather -f

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 7.3 性能监控
```bash
# 安装htop
sudo apt install htop -y

# 监控系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

## 第八步：SEO和推广

### 8.1 提交搜索引擎
1. **Google Search Console**
   - 访问 https://search.google.com/search-console
   - 添加网站属性
   - 验证域名所有权
   - 提交sitemap.xml

2. **百度站长平台**
   - 访问 https://ziyuan.baidu.com/
   - 添加网站
   - 验证域名
   - 提交sitemap

### 8.2 社区推广
- 使用 `V2EX_INTRO.md` 中的模板在V2EX发帖
- 在知乎、微博等平台分享
- 在技术微信群推广

## 常见问题解决

### 问题1：网站无法访问
```bash
# 检查防火墙
sudo ufw status

# 检查端口是否开放
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :8080

# 检查服务状态
sudo systemctl status aigather
sudo systemctl status nginx
```

### 问题2：SSL证书问题
```bash
# 重新申请证书
sudo certbot --nginx -d your-domain.com

# 检查证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew
```

### 问题3：性能问题
```bash
# 启用Nginx压缩
sudo nano /etc/nginx/nginx.conf
# 在http块中添加：
# gzip on;
# gzip_types text/plain text/css application/json application/javascript;

# 重启Nginx
sudo systemctl restart nginx
```

## 维护和更新

### 日常维护
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 更新SSL证书
sudo certbot renew

# 清理日志
sudo journalctl --vacuum-time=7d
```

### 代码更新
```bash
# 停止服务
sudo systemctl stop aigather

# 备份当前版本
cp aigather aigather.backup

# 上传新代码
# 重新构建
go build -o aigather main.go

# 启动服务
sudo systemctl start aigather
```

## 成本估算

### 月度成本
- 云服务器：50-100元
- 域名：约10元/年
- SSL证书：免费
- **总计**：约50-100元/月

### 年度成本
- 服务器：600-1200元
- 域名：10元
- **总计**：约610-1210元/年

## 成功部署检查清单

- [ ] 服务器购买完成
- [ ] 系统环境配置完成
- [ ] 项目文件上传完成
- [ ] 应用部署成功
- [ ] 域名解析配置完成
- [ ] SSL证书申请完成
- [ ] 网站可以正常访问
- [ ] 搜索引擎提交完成
- [ ] 社区推广开始

完成以上步骤后，你的AI Gather网站就可以正式上线了！ 