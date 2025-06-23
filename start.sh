#!/bin/bash

echo "启动AI Gather新闻系统..."

# 检查Go是否安装
if ! command -v go &> /dev/null; then
    echo "错误: 未找到Go，请先安装Go"
    exit 1
fi

# 检查依赖
echo "检查依赖..."
go mod tidy

# 编译程序
echo "编译程序..."
go build -o aigather .

# 启动服务器
echo "启动服务器..."
./aigather 