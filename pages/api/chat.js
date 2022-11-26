import Pusher from 'pusher';

const pusher = new Pusher({
  appId: "1364369",
  key: "c25ea714adba518a4f2d",
  secret: "76d0a008748319593a80",
  cluster: "eu",
  useTLS: true
});

export default function chatHandler(req, res) {
  //this sends the update
  pusher.trigger("chat-channel", "message-event", {...req.body});
  
  res.status(200).json({username: req.body.username, message: req.body.message })
};