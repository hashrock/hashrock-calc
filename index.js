var timer;

new Vue({
  el: "#app",
  filters: {
    toMinute(v) {
      const s = v % 60
      const m = (v - s) / 60
      return m + "m" + s + "s"
    }
  },
  computed: {
    pasteboardLength() {
      if (!this.pasteboard) {
        return 0
      }
      return this.pasteboard.replace(/\n/g, "").length
    },
    pasteboardSum() {
      if (!this.pasteboard) {
        return 0
      }
      return this.pasteboard.split("\n").map((item) => {
        if (item === "") {
          return 0
        }
        if (isNaN(item)) {
          return 0
        }
        return parseFloat(item)
      }).reduce((a, b) => {
        return a + b
      })
    }
  },
  methods: {
    tick() {
      this.timerRest--;
      if (this.timerRest === 0) {
        new Notification("完了:" + this.timers[0].title)
        this.timers.splice(0, 1)
        if (this.timers.length > 0) {
          this.timerRest = this.timers[0].time
        } else {
          this.stopTimer()
        }
      }
    },
    pauseTimer() {
      if (!this.timerPause) {
        clearInterval(timer)
      } else {
        timer = setInterval(() => {
          this.tick();
        }, 1000)
      }
      this.timerPause = !this.timerPause
    },
    startTimer() {
      this.timerPause = false;
      if (this.timerSource === "") {
        return;
      }

      this.timers = this.timerSource.split("\n").filter(i => i.length > 0).map(i => {
        let s = i.split(" ")
        const minuteMatcher = /([0-9]*)m/
        let m = s[0].match(minuteMatcher)
        s[0] = s[0].replace(minuteMatcher, "")

        let result = 0;
        if (m && m[1]) {
          result += parseInt(m[1], 10) * 60
        }
        if (s[0]) {
          result += parseInt(s[0])
        }

        return {
          title: s[1] ? s[1] : i,
          time: result,
        }
      })

      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          this.timerStart = true;
          this.timerRest = this.timers[0].time
          timer = setInterval(() => {
            this.tick();
          }, 1000)
        }

      });
    },
    stopTimer() {
      this.timerStart = false;
      clearInterval(timer)
    },
    update(type, ev) {
      let val
      switch (type) {
        case "hex":
          val = this.hex.replace(/ /g, "");
          if (val) {
            this.decimal = parseInt(val, 16)
            this.binary = this.decimal.toString(2)
          }
          break;
        case "decimal":
          val = parseInt(this.decimal, 10)
          if (val) {
            this.hex = val.toString(16)
            this.binary = val.toString(2)
          }
          break;
        case "binary":
          val = this.binary.replace(/ /g, "");
          if (val) {
            this.decimal = parseInt(val, 2)
            this.hex = this.decimal.toString(16)
          }
          break;
      }
    }
  },
  data: {
    hex: "",
    decimal: "",
    binary: "",
    pasteboard: "",
    timerSource: "",
    timerStart: false,
    timers: [],
    timerRest: 0,
    timerPause: false,
  },
  watch: {
    pasteboard(value) {
      localStorage.setItem("hashrock-calc__pasteboard", value)
    },
    timerSource(value) {
      localStorage.setItem("hashrock-calc__timerSource", value)
    }

  },
  mounted() {
    if (localStorage.getItem("hashrock-calc__pasteboard")) {
      this.pasteboard = localStorage.getItem("hashrock-calc__pasteboard")
    }
    if (localStorage.getItem("hashrock-calc__timerSource")) {
      this.timerSource = localStorage.getItem("hashrock-calc__timerSource")
    }

  }
})