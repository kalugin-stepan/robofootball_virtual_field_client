class Player {
    _x = null
    _y = null
    get x() {
        return this._x
    }
    set x(val) {
        this._x = val
        this.element.style.left = `${this.element.parentElement.offsetLeft + val - this.R}px`
    }
    get y() {
        return this._y
    }
    set y(val) {
        this._y = val
        this.element.style.top = `${this.element.parentElement.offsetTop + val - this.R}px`
    }
    get R() {
        return this.element.offsetWidth / 2
    }
    set R(val) {
        this.element.style.width = `${2*val}px`
        this.element.style.height = `${2*val}px`
    }
    constructor(team, R) {
        this.element = document.createElement('div')
        this.element.classList.add('player')
        if (team === 'red') {
            this.element.classList.add('team_red')
        }
        else if (team === 'blue') {
            this.element.classList.add('team_blue')
        }
        if (R !== null) this.R = R
    }
    add_to_field(field) {
        field.append(this.element)
    }
    move(x, y) {
        this.x = x
        this.y = y
    }
    remove() {
        this.element.remove()
    }
}