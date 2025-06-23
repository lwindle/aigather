#!/bin/bash

# AI Gather 部署脚本
# 使用方法: ./deploy.sh [production|staging]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    if ! command -v go &> /dev/null; then
        log_error "Go 未安装，请先安装 Go 1.19+"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        log_error "Git 未安装"
        exit 1
    fi
    
    log_info "依赖检查完成"
}

# 构建应用
build_app() {
    log_info "构建应用..."
    
    # 清理旧的构建文件
    rm -f aigather
    
    # 构建Go应用
    go build -o aigather main.go
    
    if [ $? -eq 0 ]; then
        log_info "应用构建成功"
    else
        log_error "应用构建失败"
        exit 1
    fi
}

# 创建systemd服务
create_service() {
    log_info "创建systemd服务..."
    
    sudo tee /etc/systemd/system/aigather.service << EOF
[Unit]
Description=AI Gather Web Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/aigather
Restart=always
RestartSec=5
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
EOF

    log_info "systemd服务创建完成"
}

# 配置Nginx
configure_nginx() {
    log_info "配置Nginx..."
    
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

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/aigather /etc/nginx/sites-enabled/
    
    # 测试Nginx配置
    sudo nginx -t
    
    log_info "Nginx配置完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 重新加载systemd
    sudo systemctl daemon-reload
    
    # 启用并启动服务
    sudo systemctl enable aigather
    sudo systemctl start aigather
    
    # 重启Nginx
    sudo systemctl restart nginx
    
    # 检查服务状态
    if sudo systemctl is-active --quiet aigather; then
        log_info "AI Gather 服务启动成功"
    else
        log_error "AI Gather 服务启动失败"
        sudo systemctl status aigather
        exit 1
    fi
    
    if sudo systemctl is-active --quiet nginx; then
        log_info "Nginx 服务启动成功"
    else
        log_error "Nginx 服务启动失败"
        sudo systemctl status nginx
        exit 1
    fi
}

# 配置SSL证书
setup_ssl() {
    log_info "配置SSL证书..."
    
    if command -v certbot &> /dev/null; then
        sudo certbot --nginx -d aigather.com -d www.aigather.com --non-interactive --agree-tos --email admin@aigather.com
        log_info "SSL证书配置完成"
    else
        log_warn "Certbot 未安装，跳过SSL配置"
        log_info "请手动安装: sudo apt install certbot python3-certbot-nginx"
    fi
}

# 设置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        sudo ufw allow 22/tcp
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        sudo ufw --force enable
        log_info "防火墙配置完成"
    else
        log_warn "UFW 未安装，跳过防火墙配置"
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 5
    
    # 检查HTTP响应
    if curl -f http://localhost:8080 > /dev/null 2>&1; then
        log_info "应用健康检查通过"
    else
        log_error "应用健康检查失败"
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    log_info "部署完成！"
    echo ""
    echo "=== 部署信息 ==="
    echo "应用地址: http://aigather.com"
    echo "本地地址: http://localhost:8080"
    echo "服务状态: sudo systemctl status aigather"
    echo "查看日志: sudo journalctl -u aigather -f"
    echo "重启服务: sudo systemctl restart aigather"
    echo ""
    echo "=== 下一步 ==="
    echo "1. 配置域名DNS解析"
    echo "2. 申请SSL证书"
    echo "3. 提交Google Search Console"
    echo "4. 配置监控和备份"
    echo ""
}

# 主函数
main() {
    local environment=${1:-production}
    
    log_info "开始部署 AI Gather (环境: $environment)"
    
    check_dependencies
    build_app
    create_service
    configure_nginx
    start_services
    setup_firewall
    
    if [ "$environment" = "production" ]; then
        setup_ssl
    fi
    
    health_check
    show_deployment_info
}

# 脚本入口
if [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "AI Gather 部署脚本"
    echo ""
    echo "使用方法:"
    echo "  ./deploy.sh [production|staging]"
    echo ""
    echo "参数:"
    echo "  production  - 生产环境部署 (默认)"
    echo "  staging     - 测试环境部署"
    echo ""
    echo "示例:"
    echo "  ./deploy.sh production"
    echo "  ./deploy.sh staging"
    exit 0
fi

# 执行主函数
main "$@" 