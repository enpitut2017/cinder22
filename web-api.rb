#!/usr/bin/ruby
require 'socket'
#require 'cgi'
require 'open3'

#20000番のポートを解放
server = TCPServer.open("127.0.0.1", 20000)
pids = []
loop do
    #クライアント側からの接続待ち
    Thread.start(server.accept) do |client|
        keyword = client.gets
        #keyword = CGI.escapeHTML(cgi['name'])
        print keyword #受け取った情報を出力する

        out, err, status = Open3.capture3("./echo.out", stdin_data: "#{keyword}\nend" )

        p out
        p err
        p status

        sleep(1)

        clinet.puts "#{out}"

        client.close
    end
end
