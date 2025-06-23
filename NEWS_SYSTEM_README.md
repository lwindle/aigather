# AI Gather 新闻系统

这是一个简单的AI新闻聚合系统，使用Go语言实现，不依赖外部数据库。

## 功能特性

- 🔄 自动爬取多个AI新闻源的RSS订阅
- 📰 新闻去重和分类
- 🌐 RESTful API接口
- 💾 本地JSON文件存储
- ⏰ 定时更新（每小时）
- 🎨 现代化Web界面

## 新闻源

系统目前支持以下新闻源：
- TechCrunch AI
- VentureBeat AI  
- AI News

## 快速开始

### 1. 安装Go

确保你的系统已安装Go 1.16或更高版本：

```bash
# 检查Go版本
go version
```

### 2. 运行系统

```bash
# 方法1: 使用启动脚本
./start.sh

# 方法2: 手动编译运行
go build -o aigather .
./aigather
```

### 3. 访问网站

- 主页: http://localhost:80
- API接口: http://localhost:80/api/news

## API接口

### 获取新闻列表

```
GET /api/news
```

响应格式：
```json
{
  "news": [
    {
      "title": "新闻标题",
      "link": "新闻链接",
      "description": "新闻描述",
      "source": "新闻来源",
      "published_at": "2024-01-15T10:30:00Z",
      "id": "唯一标识"
    }
  ],
  "count": 10
}
```

## 文件结构

```
aigather/
├── main.go              # 主服务器文件
├── news_crawler.go      # 新闻爬虫逻辑
├── index.html           # 主页
├── script.js            # 前端JavaScript
├── styles.css           # 样式文件
├── ai_news.json         # 新闻数据文件（自动生成）
├── start.sh             # 启动脚本
└── go.mod               # Go模块文件
```

## 配置说明

### 修改新闻源

编辑 `news_crawler.go` 文件中的 `newsSources` 变量：

```go
var newsSources = []struct {
    name string
    url  string
}{
    {"新闻源名称", "RSS订阅地址"},
    // 添加更多新闻源...
}
```

### 修改爬取频率

在 `news_crawler.go` 中修改 `StartScheduler` 函数：

```go
ticker := time.NewTicker(30 * time.Minute) // 每30分钟爬取一次
```

### 修改端口

设置环境变量或修改 `main.go`：

```bash
export PORT=8080
./aigather
```

## 部署到服务器

### 1. 上传文件

将项目文件上传到服务器。

### 2. 安装Go

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install golang-go

# CentOS/RHEL
sudo yum install golang
```

### 3. 运行服务

```bash
# 编译
go build -o aigather .

# 后台运行
nohup ./aigather > aigather.log 2>&1 &
```

### 4. 配置Nginx（可选）

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 故障排除

### 1. 新闻加载失败

- 检查网络连接
- 确认RSS源地址有效
- 查看服务器日志

### 2. API无响应

- 确认服务器正在运行
- 检查防火墙设置
- 验证端口配置

### 3. 新闻数据为空

- 等待首次爬取完成
- 检查RSS源是否可访问
- 查看爬虫日志

## 开发说明

### 添加新功能

1. 在 `news_crawler.go` 中添加新的爬虫逻辑
2. 在 `main.go` 中注册新的API路由
3. 更新前端 `script.js` 处理新数据

### 扩展新闻源

1. 在 `newsSources` 中添加新的RSS源
2. 确保RSS格式兼容
3. 测试爬取功能

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。 