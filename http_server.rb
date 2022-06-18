require 'webrick'

root = File.expand_path '../public', __FILE__
puts root
server = WEBrick::HTTPServer.new :Port => 3000, :DocumentRoot => root
trap 'INT' do
  server.shutdown
end

server.start