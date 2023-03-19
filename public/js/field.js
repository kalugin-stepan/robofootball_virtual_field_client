class Field {
    players = new Map()
    ball = null
    score_change_event_handlers = []
    constructor(selector, websocket_server_url) {
        this.client = new WebSocket(websocket_server_url)
        this.client.onmessage = this.on_msg.bind(this)
        this.field = document.querySelector(selector)
    }
    add_on_score_change_event(handler) {
        this.score_change_event_handlers.push(handler)
    }
    add_ball(ball) {
        if (this.ball !== null) return
        this.ball = ball
        this.ball.add_to_field(this.field)
    }
    add_player(id, player) {
        player.add_to_field(this.field)
        this.players.set(id, player)
    }
    move_player(id, x, y) {
        const player = this.players.get(id)
        if (player === undefined) return
        player.move(x, y)
    }
    on_msg(payload) {
        if (payload.data === '') return
        const data = JSON.parse(payload.data.toString())
        if (data.type === 'score') {
            this.score_change_event_handlers.forEach(handler => {
                handler(data.score_1, data.score_2)
            })
            return
        }
        for (const i of data) {
            if (i.type === 'ball') {
                this.ball.x = i.x
                this.ball.y = i.y
                continue
            }
            const player = this.players.get(i.id)
            if (player === undefined) continue
            player.x = i.x
            player.y = i.y
        }
    }
}