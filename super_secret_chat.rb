
Thread.new do
  require './http_server'
end
require './ws_server'
# server = WSServer.new(ARGV[0])
# server.listen


# STDIN.gets.chomp

# client = Client.new('localhost', ARGV[1])

# loop do
#   user_input = STDIN.gets.chomp
#   client.send user_input
# end