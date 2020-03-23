window.Alpine = {
    directives: {
        'x-text': (el, value) => {
            el.innerText = value
        },
        'x-show': (el, value) => {
            el.style.display = value ? 'block' : 'none'
        },
    },

    start() {
        this.root = document.querySelector('[x-data]')
        this.rawData = this.getInitialData()
        this.data = this.observe(this.rawData)
        this.registerListeners()
        this.refreshDom()
    },

    registerListeners() {
        this.walkDom(this.root, el => {
            Array.from(el.attributes).forEach(attribute => {
                if (! attribute.name.startsWith('@')) return

                let event = attribute.name.replace('@', '')

                el.addEventListener(event, () => {
                    eval(`with (this.data) { (${attribute.value}) }`)
                })
            })
        })
    },

    observe(data) {
        var self = this
        return new Proxy(data, {
            set(target, key, value) {
                target[key] = value

                self.refreshDom()
            }
        })
    },

    refreshDom() {
        this.walkDom(this.root, el => {
            Array.from(el.attributes).forEach(attribute => {
                if (! Object.keys(this.directives).includes(attribute.name)) return

                this.directives[attribute.name](el, eval(`with (this.data) { (${attribute.value}) }`))
            })
        })
    },

    walkDom(el, callback) {
        callback(el)

        el = el.firstElementChild

        while (el) {
            this.walkDom(el, callback)

            el = el.nextElementSibling
        }
    },

    getInitialData() {
        let dataString = this.root.getAttribute('x-data')
        return eval(`(${dataString})`)
    }
}

window.Alpine.start()
