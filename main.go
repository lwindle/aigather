package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

// NewsItem 新闻条目结构
type NewsItem struct {
	Title       string    `json:"title"`
	Link        string    `json:"link"`
	Description string    `json:"description"`
	Source      string    `json:"source"`
	PublishedAt time.Time `json:"published_at"`
	ID          string    `json:"id"`
}

// 全局新闻服务
var newsService *NewsService

func main() {
	// 初始化新闻服务
	newsService = NewNewsService("ai_news.json")
	
	// 加载现有新闻
	if err := newsService.LoadNews(); err != nil {
		log.Printf("加载新闻失败: %v", err)
	}
	
	// 启动定时爬取
	newsService.StartScheduler()
	
	// 立即执行一次爬取
	go func() {
		if err := newsService.CrawlAllSources(); err != nil {
			log.Printf("初始爬取失败: %v", err)
		}
	}()
	
	// 设置API路由
	http.HandleFunc("/api/news", handleGetNews)
	
	// 设置静态文件服务
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)

	// 设置端口
	port := os.Getenv("PORT")
	if port == "" {
		port = "80"
	}

	log.Printf("服务器启动在端口 %s", port)
	log.Printf("访问地址: http://localhost:%s", port)
	log.Printf("API地址: http://localhost:%s/api/news", port)
	
	// 启动服务器
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal(err)
	}
}

// API处理器
func handleGetNews(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	
	news := newsService.GetNews()
	json.NewEncoder(w).Encode(map[string]interface{}{
		"news":  news,
		"count": len(news),
	})
} 