class Joy {
    _x = 0
    _y = 0
    get x() {
        return _x
    }
    get y() {
        return _y
    }
    constructor(selector) {
        this.parent = document.querySelector(selector)
        this.container = document.createElement('div')
        this.container.classList.add('joy_container')
        const container_size = this.parent.offsetHeight
        this.container.style.width = `${container_size}px`
        this.container.style.height = `${container_size}px`
        this.parent.append(this.container)
        this.joy = document.createElement('div')
        this.joy.classList.add('joy')
        const joy_pos = container_size * 0.05
        this.joy.style.left = `${joy_pos}px`
        this.joy.style.top = `${joy_pos}px`
        const joy_size = container_size * 0.9
        this.joy.style.width = `${joy_size}px`
        this.joy.style.height = `${joy_size}px`
        this.joy_radius = container_size * 0.45
        this.container.append(this.joy)
        this.events()
    }
    events() {
        this.container.addEventListener('mousedown', e => this.mouse_down(e))
        this.container.addEventListener('touchstart', e => this.touch_down(e))
        this.container.addEventListener('mousemove', e => this.mouse_move(e))
        this.container.addEventListener('touchmove', e => this.touch_move(e))
        this.container.addEventListener('mouseup', e => this.up())
        this.container.addEventListener('touchcancel', e => this.up())
        this.container.addEventListener('touchend', e => this.up())
        addEventListener('resize', e => this.resize())
    }
    move(x, y) {
        const container_size = this.parent.offsetHeight
        if (x > container_size) {
            x = container_size
        }
        else if (x < 0) {
            x = 0
        }
        if (y > container_size) {
            y = container_size
        }
        else if (y < 0) {
            y = 0
        }
        const joy_radius = container_size * 0.45
        this.joy.style.left = `${x - joy_radius}px`
        this.joy.style.top = `${y - joy_radius}px`
        this._x = 2 * (x / container_size) - 1
        this._y = -2 * (y / container_size) + 1
    }
    mouse_down(e) {
        this.clicked = true
        this.move(e.pageX - this.container.offsetLeft, e.pageY - this.container.offsetTop)
    }
    mouse_move(e) {
        if (!this.clicked) return
        this.move(e.pageX - this.container.offsetLeft, e.pageY - this.container.offsetTop)
    }
    up() {
        const container_size = this.parent.offsetHeight
        this.clicked = false
        const joy_pos = container_size * 0.05
        this.joy.style.left = `${joy_pos}px`
        this.joy.style.top = `${joy_pos}px`
        this._x = 0
        this._y = 0
    }
    touch_down(e) {
        this.clicked = true
        this.move(e.targetTouches[0].pageX - this.container.offsetLeft, e.targetTouches[0].pageY - this.container.offsetTop)
    }
    touch_move(e) {
        if (!this.clicked) return
        this.move(e.targetTouches[0].pageX - this.container.offsetLeft, e.targetTouches[0].pageY - this.container.offsetTop)
    }
    resize() {
        const container_size = this.parent.offsetHeight
        this.container.style.width = `${container_size}px`
        this.container.style.height = `${container_size}px`
        const joy_pos = container_size * 0.05
        const joy_size = container_size * 0.9
        this.joy.style.width = `${joy_size}px`
        this.joy.style.height = `${joy_size}px`
        this.joy.style.left = `${joy_pos}px`
        this.joy.style.top = `${joy_pos}px`
    }
    get_pos(num_of_digits = 1) {
        return { X: Math.round(this._x * num_of_digits), Y: Math.round(this._y * num_of_digits) }
    }
}