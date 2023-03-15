class Field {
    players = new Map()
    ball = null
    get width() {
        return this._width
    }

    get height() {
        return this._height
    }
    constructor(selector, mqtt_url) {
        this.mqtt_client = mqtt.connect(mqtt_url)
        this.field = document.querySelector(selector)
        this._width = this.field.offsetWidth
        this._height = this.field.offsetHeight
        addEventListener('resize', e => this.on_resize())
        this.mqtt_client.subscribe('player_data')
        this.mqtt_client.on('message', this.on_mqtt_msg.bind(this))
    }
    on_resize() {
        const width = this.field.offsetWidth
        const height = this.field.offsetHeight
        if (this.ball !== null) {
            this.ball.move(this.ball.x*width/this._width, this.ball.y*height/this._height)
        }
        for (const player of this.players.values()) {
            player.move(player.x*width/this._width, player.y*height/this._height)
        }
        this._width = width
        this._height = height
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
        console.log(player)
        player.move(x, y)
    }
    on_mqtt_msg(topic, payload) {
        if (topic === 'player_data') {
            const data = JSON.parse(payload.toString())
            this.move_player(data.player_id, this.field.offsetWidth*data.x/100, this.field.offsetHeight*data.y/100)
        }
    }
}