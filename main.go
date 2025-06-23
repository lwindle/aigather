package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	// 设置静态文件服务
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)

	// 设置端口
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("服务器启动在端口 %s", port)
	log.Printf("访问地址: http://localhost:%s", port)
	
	// 启动服务器
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal(err)
	}
} 