import http.server
import socketserver
import webbrowser
import os
import threading
import time
import socket
import urllib.parse

# 配置
DEFAULT_PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# 查找可用端口
def find_free_port(start_port=DEFAULT_PORT, max_attempts=100):
    for port in range(start_port, start_port + max_attempts):
        try:
            # 尝试绑定端口
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            continue
    raise RuntimeError(f"无法找到从 {start_port} 到 {start_port + max_attempts - 1} 的可用端口")

# 创建自定义处理程序来处理中文路径
class ChinesePathHTTPHandler(http.server.SimpleHTTPRequestHandler):
    # 移除可能导致问题的__init__覆盖
    
    def do_GET(self):
        # 解码URL路径
        self.path = urllib.parse.unquote(self.path)
        
        # 处理根路径访问，直接重定向到index.html
        if self.path == '/':
            self.path = '/index.html'
            
        return super().do_GET()

# 查找可用端口
PORT = find_free_port()

# 切换到项目目录
os.chdir(DIRECTORY)

print(f"启动好运转盘服务在 http://localhost:{PORT}")
print(f"当前目录: {os.getcwd()}")
print(f"目录内容: {os.listdir()}")
print("按 Ctrl+C 停止服务器")

# 创建HTTP服务器，使用自定义处理程序
httpd = socketserver.TCPServer(("", PORT), ChinesePathHTTPHandler)

# 在新线程中启动服务器
server_thread = threading.Thread(target=httpd.serve_forever)
server_thread.daemon = True
server_thread.start()

# 稍等片刻，确保服务器完全启动
time.sleep(0.5)

# 打开默认浏览器，直接访问转盘页面
webbrowser.open(f"http://localhost:{PORT}/index.html")

try:
    # 保持主线程运行
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n正在关闭服务器...")
    httpd.shutdown()
    print("服务器已关闭。再见！")
