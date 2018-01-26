require 'socket'

def mainSystem()
    #送信内容の入力
    puts "enter keyword"
    msg = gets.to_s
    if msg == "exit"
      exit!
    end
    port.puts "#{msg}"
    puts "Send: #{Time.now}"
  
    print port.gets
  
    puts "Receive: #{Time.now}"
  
    port.close
  end
  #チャットログを読み込むメソッド
  def loadLog
    File.open('web-api.log','r') do |disp|
      disp.each do |display|
        print display
      end
    end
  end

  begin
    #localhostの20000ポートに接続
    port = TCPSocket.open("127.0.0.1",20000)
  rescue
    puts "TCPSocket.open failed :#$!"
  else
    loop do
      #送信内容の入力
      puts "enter keyword"
      msg = gets.to_s
      if msg == "exit"
        exit!
      end
      port.puts "#{msg}"
      puts "Send: #{Time.now}"
      p port.gets
      puts "Receive: #{Time.now}"
    
      #データ送信完了後のチャットログ読み込みようメソッドを呼び出す
      puts loadLog
    end
    port.close
end