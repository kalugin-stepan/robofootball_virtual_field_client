class Rect {
    _x = null
    _y = null
    get x() {
        return this._x
    }
    set x(val) {
        this._x = val
        this.element.style.left = `${this.element.parentElement.offsetLeft + val}px`
    }
    get y() {
        return this._y
    }
    set y(val) {
        this._y = val
        this.element.style.top = `${this.element.parentElement.offsetTop + val}px`
    }
    get w() {
        return this.element.offsetWidth
    }
    set w(val) {
        this.element.style.width = `${val}px`
    }
    get h() {
        return this.element.offsetHeight
    }
    set h(val) {
        this.element.style.height = `${val}px`
    }
    constructor(w, h) {
        this.element = document.createElement('div')
        this.element.classList.add('rect')
        this.w = w
        this.h = h
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