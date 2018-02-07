require 'webrick'
module WEBrick
  module HTTPServlet
    FileHandler.add_handler('rb', CGIHandler)
  end
end
server = WEBrick::HTTPServer.new({
  :DocumentRoot => '.',
  :CGIInterpreter => WEBrick::HTTPServlet::CGIHandler::Ruby,
  :Port => '8080',
  :RequestCallback => Proc.new{|req,res| res['Access-Control-Allow-Origin'] = '*'} ,
})
['INT', 'TERM'].each {|signal|
  Signal.trap(signal){ server.shutdown }
}
server.start