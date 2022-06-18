require 'em-websocket'

EventMachine.run do
  @clients = []
  @msg_queue = []

  EM::WebSocket.start(:host => '0.0.0.0', :port => '3001') do |ws|
    ws.onopen do |handshake|
      @clients << ws
    end

    ws.onclose do
      @clients.delete ws
    end

    ws.onmessage do |msg|
      @clients.each do |socket|
        socket.send msg
      end
    end

  end
end