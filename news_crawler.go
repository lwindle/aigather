package main

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"
)

// NewsService 新闻服务
type NewsService struct {
	newsFile string
	news     []NewsItem
}

// AI新闻源列表
var newsSources = []struct {
	name string
	url  string
}{
	{"TechCrunch AI", "https://techcrunch.com/tag/artificial-intelligence/feed/"},
	{"VentureBeat AI", "https://venturebeat.com/category/ai/feed/"},
	{"AI News", "https://artificialintelligence-news.com/feed/"},
}

// RSSFeed RSS源结构
type RSSFeed struct {
	XMLName xml.Name `xml:"rss"`
	Channel Channel  `xml:"channel"`
}

type Channel struct {
	Title       string `xml:"title"`
	Description string `xml:"description"`
	Items       []Item `xml:"item"`
}

type Item struct {
	Title       string `xml:"title"`
	Link        string `xml:"link"`
	Description string `xml:"description"`
	PubDate     string `xml:"pubDate"`
	GUID        string `xml:"guid"`
}

// 创建新闻服务
func NewNewsService(filename string) *NewsService {
	return &NewsService{
		newsFile: filename,
		news:     []NewsItem{},
	}
}

// 加载新闻数据
func (ns *NewsService) LoadNews() error {
	data, err := os.ReadFile(ns.newsFile)
	if err != nil {
		if os.IsNotExist(err) {
			return nil // 文件不存在时返回空列表
		}
		return err
	}
	
	return json.Unmarshal(data, &ns.news)
}

// 保存新闻数据
func (ns *NewsService) SaveNews() error {
	data, err := json.MarshalIndent(ns.news, "", "  ")
	if err != nil {
		return err
	}
	
	return os.WriteFile(ns.newsFile, data, 0644)
}

// 生成新闻ID
func generateNewsID(title, link string) string {
	return fmt.Sprintf("%s-%s", strings.ReplaceAll(title, " ", "-"), link)
}

// 解析时间
func parseTime(timeStr string) time.Time {
	formats := []string{
		time.RFC1123,
		time.RFC1123Z,
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05-07:00",
	}
	
	for _, format := range formats {
		if t, err := time.Parse(format, timeStr); err == nil {
			return t
		}
	}
	
	return time.Now()
}

// 爬取单个新闻源
func (ns *NewsService) crawlSource(sourceName, sourceURL string) error {
	resp, err := http.Get(sourceURL)
	if err != nil {
		return fmt.Errorf("获取 %s 失败: %v", sourceName, err)
	}
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("读取 %s 响应失败: %v", sourceName, err)
	}
	
	var feed RSSFeed
	if err := xml.Unmarshal(body, &feed); err != nil {
		return fmt.Errorf("解析 %s XML失败: %v", sourceName, err)
	}
	
	for _, item := range feed.Channel.Items {
		newsItem := NewsItem{
			Title:       strings.TrimSpace(item.Title),
			Link:        strings.TrimSpace(item.Link),
			Description: strings.TrimSpace(item.Description),
			Source:      sourceName,
			PublishedAt: parseTime(item.PubDate),
			ID:          generateNewsID(item.Title, item.Link),
		}
		
		// 检查是否已存在
		exists := false
		for _, existing := range ns.news {
			if existing.ID == newsItem.ID {
				exists = true
				break
			}
		}
		
		if !exists {
			ns.news = append(ns.news, newsItem)
		}
	}
	
	return nil
}

// 爬取所有新闻源
func (ns *NewsService) CrawlAllSources() error {
	log.Println("开始爬取AI新闻...")
	
	for _, source := range newsSources {
		log.Printf("正在爬取: %s", source.name)
		if err := ns.crawlSource(source.name, source.url); err != nil {
			log.Printf("爬取 %s 失败: %v", source.name, err)
			continue
		}
		time.Sleep(1 * time.Second) // 避免请求过快
	}
	
	// 按发布时间排序
	sort.Slice(ns.news, func(i, j int) bool {
		return ns.news[i].PublishedAt.After(ns.news[j].PublishedAt)
	})
	
	// 只保留最新的100条新闻
	if len(ns.news) > 100 {
		ns.news = ns.news[:100]
	}
	
	// 保存到文件
	if err := ns.SaveNews(); err != nil {
		return fmt.Errorf("保存新闻失败: %v", err)
	}
	
	log.Printf("爬取完成，共获取 %d 条新闻", len(ns.news))
	return nil
}

// 获取新闻列表
func (ns *NewsService) GetNews() []NewsItem {
	return ns.news
}

// API处理器
func (ns *NewsService) handleGetNews(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	
	news := ns.GetNews()
	json.NewEncoder(w).Encode(map[string]interface{}{
		"news":  news,
		"count": len(news),
	})
}

// 启动API服务器
func (ns *NewsService) StartAPIServer(port string) {
	http.HandleFunc("/api/news", ns.handleGetNews)
	
	log.Printf("API服务器启动在端口 %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

// 定时爬取任务
func (ns *NewsService) StartScheduler() {
	ticker := time.NewTicker(1 * time.Hour) // 每小时爬取一次
	go func() {
		for range ticker.C {
			if err := ns.CrawlAllSources(); err != nil {
				log.Printf("定时爬取失败: %v", err)
			}
		}
	}()
} 